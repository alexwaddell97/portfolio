import { forwardRef, Suspense, useImperativeHandle, useLayoutEffect, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const MODEL_PATH = '/models/macbook.glb';
// Identified by inspecting the GLB's material/mesh graph — these names are
// obfuscated (Sketchfab export) but stable. The screen is the only material
// with an emissiveTexture; its node's ancestor group (14 meshes: screen,
// bezel, camera notch, hinge cover) is a sibling of a ~30-mesh group that's
// clearly the base/chassis (keyboard, ports, trackpad, feet) — the base
// needs no special handling, it just stays part of the static scene.
const LID_NODE_NAME = 'RcexTyyhpuJYATQ';
const SCREEN_MATERIAL_NAME = 'HlQwFCAPWzetDQy';

export interface Laptop3DHandle {
  modelGroup: THREE.Group | null;
  lidPivot: THREE.Group | null;
  // The rotation.x (radians) on lidPivot that lays the lid flush against the
  // base — derived from the model's own geometry (see computeHingeFrame),
  // not a guessed constant. Null until the model has loaded.
  closedRotationX: number | null;
  // The position.y (world units) on lidPivot that lifts the closed lid up
  // to rest on the base's top surface, rather than pivoting from the
  // hinge's own (lower, embedded-in-the-chassis) height. Animate this in
  // lockstep with closedRotationX — both 0 when open, both at their closed
  // value when shut. Null until the model has loaded.
  closedLiftY: number | null;
  // The reveal spotlight above-and-in-front of the laptop. Consumers animate
  // its `intensity` in lockstep with the lid opening/closing (0 when shut,
  // lit once open) — not exposed as a simple number since GSAP needs the
  // live object to tween.
  spotlight: THREE.SpotLight | null;
  // Mirrored spotlight above-and-behind. The model does a full 360° turn
  // between projects — a single front spotlight only lights surfaces whose
  // normal faces roughly toward the camera, so once the lid's outer shell
  // rotates to face front (back of the laptop toward the viewer), it faces
  // away from that light entirely and reads as unlit. This one covers that
  // side; animate it in lockstep with `spotlight` (same intensity, always).
  spotlightBack: THREE.SpotLight | null;
  setScreenTexture: (url: string) => void;
}

// Fallback for when we can't measure the screen mesh's own aspect ratio.
const DEFAULT_SCREEN_ASPECT = 16 / 10;

const imageCache = new Map<string, Promise<HTMLImageElement>>();

function loadImage(url: string): Promise<HTMLImageElement> {
  let promise = imageCache.get(url);
  if (!promise) {
    promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
    imageCache.set(url, promise);
  }
  return promise;
}

const textureCache = new Map<string, THREE.CanvasTexture>();

// Screenshots come in all sorts of aspect ratios (some are full-page,
// very tall captures). Rather than stretching them to fit the laptop
// screen's UVs (which squishes tall images), crop to the screen's aspect
// ratio like `object-fit: cover`, anchored to the top so the most
// relevant part of a tall screenshot (the top of the page) stays visible.
function getCroppedTexture(url: string, aspect: number): Promise<THREE.CanvasTexture> {
  const key = `${url}|${aspect.toFixed(4)}`;
  const cached = textureCache.get(key);
  if (cached) return Promise.resolve(cached);

  return loadImage(url).then((image) => {
    const srcAspect = image.width / image.height;
    const sy = 0;
    let sx = 0;
    let sw = image.width;
    let sh = image.height;

    if (srcAspect > aspect) {
      // Source is wider than the screen — crop the sides, centered.
      sw = image.height * aspect;
      sx = (image.width - sw) / 2;
    } else {
      // Source is taller than the screen — crop top/bottom, anchored to top.
      sh = image.width / aspect;
    }

    const canvas = document.createElement('canvas');
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D canvas context unavailable');
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);

    const texture = new THREE.CanvasTexture(canvas);
    // glTF-authored UVs expect un-flipped images (top-down), unlike
    // three.js's WebGL-style default.
    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    textureCache.set(key, texture);
    return texture;
  });
}

interface HingeFrame {
  // World-space point on the physical hinge line.
  position: THREE.Vector3;
  // World-space direction of the physical hinge line (normalized). Not
  // assumed to be a pure world/local axis — derived from the mesh itself,
  // since a Sketchfab export's root transform isn't guaranteed to leave the
  // hinge running exactly along X.
  axis: THREE.Vector3;
  // Signed radians, about `axis`, that rotates the lid from its authored
  // (open) pose until it lies flush with the horizontal plane the hinge
  // sits in — i.e. flat against the base. Computed from geometry rather
  // than guessed, so it can't leave a gap (undershoot) or clip the lid
  // through the keyboard (overshoot).
  closeAngle: number;
  // World-space Y distance from the hinge up to the base's top surface. A
  // physical hinge barrel sits embedded partway into the chassis, below the
  // keyboard deck — closing the lid by rotation alone still pivots from
  // that embedded height, so the whole lid plane ends up too low (resting
  // at hinge height instead of on top of the base). Applying this as a
  // translation alongside the fold, driven to 0 in lockstep with the
  // rotation returning to its open pose, is what makes the lid physically
  // lift and rest on top of the keyboard when closed, like a real laptop.
  closedLiftY: number;
}

// The lid has no rig, so its physical hinge line has to be located from the
// mesh itself. A bounding-box's min/max per axis can come from two entirely
// different vertices — that's fine for an axis-aligned box, but this lid is
// posed tilted back slightly (typical for a "display open" export), so its
// lowest-Y point and its lowest-Z point don't belong to the same corner.
// Combining them (as a plain Box3 approach does) produces a pivot that
// isn't on the lid at all, which reads as the lid floating free of the
// hinge once rotated. Sampling actual vertices near the bottom edge and
// averaging them keeps the pivot on the real hinge line regardless of tilt.
function computeHingeFrame(scene: THREE.Object3D, lidNode: THREE.Object3D): HingeFrame | null {
  lidNode.updateWorldMatrix(true, true);

  let minY = Infinity;
  let maxY = -Infinity;
  const worldPositions: THREE.Vector3[] = [];
  const v = new THREE.Vector3();

  lidNode.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const posAttr = child.geometry.getAttribute('position');
    if (!posAttr) return;
    for (let i = 0; i < posAttr.count; i++) {
      v.fromBufferAttribute(posAttr, i).applyMatrix4(child.matrixWorld);
      worldPositions.push(v.clone());
      if (v.y < minY) minY = v.y;
      if (v.y > maxY) maxY = v.y;
    }
  });

  if (!worldPositions.length || !Number.isFinite(minY)) return null;

  // Only the bottom-most sliver of vertices — the actual hinge edge —
  // rather than the whole panel, so a backward tilt can't pull in vertices
  // from higher up the screen.
  const band = minY + (maxY - minY) * 0.03;
  const hingeVerts = worldPositions.filter((p) => p.y <= band);
  const source = hingeVerts.length ? hingeVerts : worldPositions;

  const position = new THREE.Vector3();
  source.forEach((p) => position.add(p));
  position.divideScalar(source.length);

  // Hinge axis: the direction the band's vertices are most spread out
  // along. Sample the two extreme points along whichever coordinate has the
  // widest spread (normally X, for a left-right hinge, but this stays
  // correct even if the export isn't perfectly axis-aligned) and use the
  // vector between them, rather than assuming the axis outright.
  let axis = new THREE.Vector3(1, 0, 0);
  if (source.length >= 2) {
    const spreadOf = (key: 'x' | 'y' | 'z') => {
      let lo = Infinity;
      let hi = -Infinity;
      source.forEach((p) => {
        if (p[key] < lo) lo = p[key];
        if (p[key] > hi) hi = p[key];
      });
      return hi - lo;
    };
    const spreads = { x: spreadOf('x'), y: spreadOf('y'), z: spreadOf('z') };
    const sampleKey = (['x', 'y', 'z'] as const).reduce((a, b) => (spreads[b] > spreads[a] ? b : a));

    let minPt = source[0];
    let maxPt = source[0];
    let minVal = Infinity;
    let maxVal = -Infinity;
    source.forEach((p) => {
      const val = p[sampleKey];
      if (val < minVal) {
        minVal = val;
        minPt = p;
      }
      if (val > maxVal) {
        maxVal = val;
        maxPt = p;
      }
    });

    const candidate = maxPt.clone().sub(minPt);
    if (candidate.lengthSq() > 1e-8) axis = candidate.normalize();
  }

  // Exact fold angle: take the lid's farthest point from the hinge (its top
  // edge when open) and strip out the component of that vector running
  // along the hinge axis (rotation about the hinge can't change it, so it's
  // not part of the angle to solve for) — call what's left `perp`.
  //
  // The target isn't "perp with no vertical component": a laptop screen
  // typically opens *past* vertical, leaning back over the hinge, so perp's
  // own horizontal component already points backward, away from the
  // keyboard — measuring the angle from perp to its own horizontal
  // projection only recovers the small backward lean past vertical, not the
  // full ~100-110° fold down onto the keyboard. The real target is "forward,
  // over the base", which has to come from the base's own geometry: the
  // vector from the hinge out to the (non-lid) chassis, horizontal
  // component only. Rotating perp onto *that* is the actual close angle.
  // Distance is measured perpendicular to the hinge axis only (i.e. within
  // the fold plane), not full 3D distance — otherwise a corner vertex (whose
  // extra reach comes from being far along the axis, at the panel's left/
  // right edge, not from being far "up" the screen) wins out over a true
  // top-center point. This panel's top edge isn't perfectly parallel to the
  // hinge axis (camera notch, rounded corners), so a corner's fold-plane
  // displacement doesn't match the panel's actual fold angle.
  let farPoint = worldPositions[0];
  let farPerpDistSq = -Infinity;
  worldPositions.forEach((p) => {
    const rel = p.clone().sub(position);
    const alongAxisComponent = axis.clone().multiplyScalar(rel.dot(axis));
    const perpComponent = rel.sub(alongAxisComponent);
    const d = perpComponent.lengthSq();
    if (d > farPerpDistSq) {
      farPerpDistSq = d;
      farPoint = p;
    }
  });

  const basePositions: THREE.Vector3[] = [];
  const bv = new THREE.Vector3();
  scene.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    for (let n: THREE.Object3D | null = child; n; n = n.parent) {
      if (n === lidNode) return;
    }
    const posAttr = child.geometry.getAttribute('position');
    if (!posAttr) return;
    for (let i = 0; i < posAttr.count; i++) {
      bv.fromBufferAttribute(posAttr, i).applyMatrix4(child.matrixWorld);
      basePositions.push(bv.clone());
    }
  });

  const up = new THREE.Vector3(0, 1, 0);
  const toFar = farPoint.clone().sub(position);
  const alongAxis = axis.clone().multiplyScalar(toFar.dot(axis));
  const perp = toFar.clone().sub(alongAxis);

  // "Forward" needs both a horizontal direction (toward the base, away from
  // the hinge) and a target height — and that height is the base's TOP
  // SURFACE, not the hinge's own position. A physical hinge barrel sits
  // embedded partway into the chassis thickness, below the keyboard deck; a
  // closed-target that lands the lid at "hinge height" therefore tucks it
  // slightly *under* the base's top surface — fully occluded by the base's
  // own opaque geometry, which reads as the lid vanishing entirely rather
  // than just leaving a gap.
  let forward = new THREE.Vector3();
  let closedLiftY = 0;
  if (basePositions.length) {
    const baseCentroid = new THREE.Vector3();
    basePositions.forEach((p) => baseCentroid.add(p));
    baseCentroid.divideScalar(basePositions.length);

    let topSurfaceY = -Infinity;
    basePositions.forEach((p) => {
      if (p.y > topSurfaceY) topSurfaceY = p.y;
    });
    closedLiftY = topSurfaceY - position.y;

    const toBase = baseCentroid.sub(position);
    const toBaseAlongAxis = axis.clone().multiplyScalar(toBase.dot(axis));
    const toBaseHorizontal = toBase.sub(toBaseAlongAxis).sub(up.clone().multiplyScalar(toBase.dot(up)));
    forward = toBaseHorizontal.add(up.clone().multiplyScalar(closedLiftY));
  }

  let closeAngle = 0;
  if (perp.lengthSq() > 1e-8 && forward.lengthSq() > 1e-8) {
    const perpNorm = perp.clone().normalize();
    const forwardNorm = forward.clone().normalize();
    const dot = THREE.MathUtils.clamp(perpNorm.dot(forwardNorm), -1, 1);
    const cross = perpNorm.clone().cross(forwardNorm);
    const sign = cross.dot(axis) < 0 ? -1 : 1;
    closeAngle = sign * Math.acos(dot);
  }

  return { position, axis, closeAngle, closedLiftY };
}

function fitCameraToObject(camera: THREE.PerspectiveCamera, object: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(object);
  // Aesthetic look-at point only — NOT the rotation pivot. `object` (the
  // modelGroup) gets `rotation.y` animated directly during the showcase,
  // which spins it about its own local origin, not the bounding box's
  // centroid. Those two points differ here (the tall open lid pulls the
  // box centroid well off origin), so a vertex's path during rotation is a
  // circle of its own radius from the ORIGIN, offset by however far the
  // origin sits from this look-at center — not a circle of "distance from
  // center" as a naive fit would assume. Conflating the two silently
  // understates reach on one side and overstates it on the other.
  const center = box.getCenter(new THREE.Vector3());
  const rotationOrigin = object.getWorldPosition(new THREE.Vector3());

  const verticalFov = (camera.fov * Math.PI) / 180;
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect);
  const tanV = Math.tan(verticalFov / 2);
  const tanH = Math.tan(horizontalFov / 2);

  // Matches the vertical offset applied to the camera below.
  const yOffset = box.getSize(new THREE.Vector3()).y * 0.15;

  // The offset from the true rotation axis to the chosen look-at center —
  // this is what makes each vertex's swing path an off-center circle
  // relative to the camera's aim point.
  const shiftX = center.x - rotationOrigin.x;
  const shiftZ = center.z - rotationOrigin.z;

  let requiredDistance = 0;
  const v = new THREE.Vector3();
  const STEPS = 72;
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const posAttr = child.geometry.getAttribute('position');
    if (!posAttr) return;
    for (let i = 0; i < posAttr.count; i++) {
      v.fromBufferAttribute(posAttr, i).applyMatrix4(child.matrixWorld);
      const radius = Math.hypot(v.x - rotationOrigin.x, v.z - rotationOrigin.z);
      const relY = v.y - center.y - yOffset;
      const vTermY = Math.abs(relY) / tanV;

      // Sweep the vertex's actual rotation angle (about rotationOrigin),
      // expressed relative to the look-at center (via shiftX/shiftZ), since
      // the shift breaks the closed-form "R / sin(halfFov)" shortcut that
      // holds only when rotation axis and look-at center coincide.
      for (let s = 0; s < STEPS; s++) {
        const alpha = (s / STEPS) * Math.PI * 2;
        const rx = radius * Math.cos(alpha) - shiftX;
        const rz = radius * Math.sin(alpha) - shiftZ;

        const vDistance = rz + vTermY;
        const hDistance = rz + Math.abs(rx) / tanH;
        if (vDistance > requiredDistance) requiredDistance = vDistance;
        if (hDistance > requiredDistance) requiredDistance = hDistance;
      }
    }
  });

  // Small safety margin on top of the exact fit.
  camera.position.set(center.x, center.y + yOffset, center.z + requiredDistance * 1.05);
  camera.lookAt(center);
  camera.near = requiredDistance / 100;
  camera.far = requiredDistance * 100;
  camera.updateProjectionMatrix();
}

function LaptopModel({
  apiRef,
  onReady,
  spotlightRef,
  spotlightBackRef,
}: {
  apiRef: React.MutableRefObject<Laptop3DHandle | null>;
  onReady?: () => void;
  spotlightRef: React.RefObject<THREE.SpotLight | null>;
  spotlightBackRef: React.RefObject<THREE.SpotLight | null>;
}) {
  const { scene: cachedScene, materials } = useGLTF(MODEL_PATH);
  // useGLTF caches the parsed scene by URL and returns the SAME object
  // reference on every mount. The setup effect below permanently reparents
  // the lid mesh out of the scene's original hierarchy (pivot.attach), so
  // reusing the cached scene directly would corrupt it after the first
  // mount: on any later remount (e.g. navigating away and back), the lid
  // node would already be missing from `scene`, hinge computation would
  // silently fail, and closedRotationX/closedLiftY would stay null. Clone
  // the hierarchy per mount (geometry/materials stay shared references —
  // only the Object3D graph itself is duplicated) so this instance's
  // reparenting never touches the shared cache.
  const scene = useMemo(() => cachedScene.clone(true), [cachedScene]);
  const { camera } = useThree();
  const modelGroupRef = useRef<THREE.Group>(null);
  // Two-level hinge rig: `hingeAnchorRef` sits at the hinge point and holds
  // a fixed alignment quaternion (rotating its local +X to the mesh's real
  // hinge axis, whatever direction that turns out to be); `lidPivotRef` is
  // its child, left at identity so its local X now *is* that real axis.
  // Consumers animate rotation.x on lidPivotRef — that always folds the lid
  // around its true physical hinge, not an assumed world/local axis, so
  // large open/close sweeps stay flush instead of clipping on one edge.
  const hingeAnchorRef = useRef<THREE.Group>(null);
  const lidPivotRef = useRef<THREE.Group>(null);
  const screenMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const screenAspectRef = useRef<number>(DEFAULT_SCREEN_ASPECT);
  // onReady is an inline closure from the caller (a fresh reference every
  // time it re-renders, e.g. once laptopReady flips), which would otherwise
  // force this whole setup effect — including the initial-rotation reset
  // below — to re-run and clobber whatever rotation the scroll-driven GSAP
  // timeline has since applied. Reading it through a ref keeps the effect's
  // dependency array free of that unstable reference.
  const onReadyRef = useRef(onReady);
  useLayoutEffect(() => {
    onReadyRef.current = onReady;
  });
  const initializedRef = useRef(false);

  // useLayoutEffect (not useEffect) so the lid is reparented and closed
  // before the browser paints the first frame — otherwise the model's
  // authored (open) pose flashes on screen for a frame before the caller's
  // own effect gets a chance to close it.
  useLayoutEffect(() => {
    const modelGroup = modelGroupRef.current;
    const anchor = hingeAnchorRef.current;
    const pivot = lidPivotRef.current;
    if (!modelGroup || !anchor || !pivot) return;

    if (initializedRef.current) {
      onReadyRef.current?.();
      return;
    }
    initializedRef.current = true;

    modelGroup.updateMatrixWorld(true);

    if (camera instanceof THREE.PerspectiveCamera) {
      fitCameraToObject(camera, modelGroup);
    }

    const lidNode = scene.getObjectByName(LID_NODE_NAME);
    let closedRotationX: number | null = null;
    let closedLiftY: number | null = null;

    if (lidNode) {
      // Re-pivot the lid at runtime: this GLB has no rig/joints, so the lid's
      // own local origin isn't necessarily at the physical hinge. Locate the
      // hinge from the mesh's own vertices, orient the anchor so the pivot's
      // local X becomes the real hinge axis, and reparent the lid under the
      // pivot — Object3D.attach() preserves world transform automatically,
      // so nothing visually jumps.
      const hingeFrame = computeHingeFrame(scene, lidNode);

      if (hingeFrame) {
        const hingeLocal = hingeFrame.position.clone();
        modelGroup.worldToLocal(hingeLocal);
        anchor.position.copy(hingeLocal);

        const modelGroupQuatInverse = modelGroup.getWorldQuaternion(new THREE.Quaternion()).invert();
        const axisLocal = hingeFrame.axis.clone().applyQuaternion(modelGroupQuatInverse).normalize();
        anchor.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), axisLocal);
        anchor.updateMatrixWorld(true);

        pivot.position.set(0, 0, 0);
        pivot.rotation.set(0, 0, 0);
        pivot.updateMatrixWorld(true);

        pivot.attach(lidNode);

        closedRotationX = hingeFrame.closeAngle + (5 * Math.PI) / 180;
        closedLiftY = hingeFrame.closedLiftY;
        pivot.rotation.x = closedRotationX;
        pivot.position.y = closedLiftY;
      }
    }

    const screenMat = materials[SCREEN_MATERIAL_NAME] as THREE.MeshStandardMaterial | undefined;
    if (screenMat) {
      screenMaterialRef.current = screenMat;

      // Measure the screen mesh's own bounding box to derive its aspect
      // ratio, so cropped textures match the physical screen shape instead
      // of an assumed default.
      scene.traverse((obj) => {
        if (!(obj instanceof THREE.Mesh)) return;
        const matchesScreen = Array.isArray(obj.material)
          ? obj.material.includes(screenMat)
          : obj.material === screenMat;
        if (!matchesScreen) return;

        obj.geometry.computeBoundingBox();
        const box = obj.geometry.boundingBox;
        if (!box) return;
        const size = new THREE.Vector3();
        box.getSize(size);
        const [minor, major] = [size.x, size.y, size.z].sort((a, b) => a - b).slice(1);
        if (minor > 0) screenAspectRef.current = major / minor;
      });
    }

    if (apiRef) {
      apiRef.current = {
        modelGroup,
        lidPivot: pivot,
        closedRotationX,
        closedLiftY,
        spotlight: spotlightRef.current,
        spotlightBack: spotlightBackRef.current,
        setScreenTexture: (url: string) => {
          getCroppedTexture(url, screenAspectRef.current)
            .then((texture) => {
              const mat = screenMaterialRef.current;
              if (!mat) return;
              mat.emissiveMap = texture;
              mat.emissive.set('#ffffff');
              mat.emissiveIntensity = 1;
              mat.needsUpdate = true;
            })
            .catch(() => {
              /* leave existing texture in place on failure */
            });
        },
      };
    }

    onReadyRef.current?.();
  }, [scene, materials, apiRef, camera, spotlightRef, spotlightBackRef]);

  return (
    <group ref={modelGroupRef}>
      <primitive object={scene} />
      <group ref={hingeAnchorRef}>
        <group ref={lidPivotRef} />
      </group>
    </group>
  );
}

const Laptop3D = forwardRef<Laptop3DHandle, { className?: string; style?: CSSProperties; onReady?: () => void }>(
  function Laptop3D({ className, style, onReady }, ref) {
    const apiRef = useRef<Laptop3DHandle | null>(null);
    const spotlightRef = useRef<THREE.SpotLight>(null);
    const spotlightBackRef = useRef<THREE.SpotLight>(null);

    useImperativeHandle(
      ref,
      () => ({
        get modelGroup() {
          return apiRef.current?.modelGroup ?? null;
        },
        get lidPivot() {
          return apiRef.current?.lidPivot ?? null;
        },
        get closedRotationX() {
          return apiRef.current?.closedRotationX ?? null;
        },
        get closedLiftY() {
          return apiRef.current?.closedLiftY ?? null;
        },
        get spotlight() {
          return apiRef.current?.spotlight ?? null;
        },
        get spotlightBack() {
          return apiRef.current?.spotlightBack ?? null;
        },
        setScreenTexture: (url: string) => apiRef.current?.setScreenTexture(url),
      }),
      [],
    );

    return (
      <Canvas
        className={className}
        // Canvas sets position/width/height inline internally, which beats
        // any className-based positioning (inline style always wins over
        // stylesheet rules) — so positioning must go through this prop,
        // not Tailwind classes on the wrapper.
        style={style}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        camera={{ fov: 32 }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 4, 3]} intensity={1.4} />
        <directionalLight position={[-3, 2, -2]} intensity={0.4} />
        {/* Reveal spotlight pair — off while closed, animated on together as
            the lid opens (see WorkSlides' GSAP timeline, which tweens both
            `intensity`s in lockstep with the lid rotation/lift). The model
            does a full 360° turn between projects; one fixed spotlight only
            lights surfaces facing roughly toward it, so a mirrored one on
            the opposite side keeps whichever face is toward the camera lit
            regardless of turn progress. Both start at 0 so there's no flash
            before the GSAP tween takes over. */}
        <spotLight
          ref={spotlightRef}
          position={[0, 1.1, 0.5]}
          angle={0.5}
          penumbra={0.6}
          decay={1.5}
          distance={4}
          intensity={0}
        />
        <spotLight
          ref={spotlightBackRef}
          position={[0, 1.1, -0.5]}
          angle={0.5}
          penumbra={0.6}
          decay={1.5}
          distance={4}
          intensity={0}
        />
        <Suspense fallback={null}>
          <LaptopModel
            apiRef={apiRef}
            onReady={onReady}
            spotlightRef={spotlightRef}
            spotlightBackRef={spotlightBackRef}
          />
        </Suspense>
      </Canvas>
    );
  },
);

useGLTF.preload(MODEL_PATH);

export default Laptop3D;
