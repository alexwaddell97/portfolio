import { useEffect, useMemo, useState } from 'react';
import { FiX } from 'react-icons/fi';
import { createPortal } from 'react-dom';

type Direction = 'up' | 'down' | 'left' | 'right';

interface Point {
  x: number;
  y: number;
}

interface SnakeOverlayProps {
  onClose: () => void;
}

const COLS = 26;
const ROWS = 16;
const POWER_UP_DURATION_TICKS = 52;
const POWER_UP_SPAWN_CHANCE = 0.06;

const START_SNAKE: Point[] = [
  { x: 8, y: 8 },
  { x: 7, y: 8 },
  { x: 6, y: 8 },
];

function randomFood(snake: Point[], blocked: Point[] = []): Point {
  const occupied = new Set(snake.map((segment) => `${segment.x},${segment.y}`));
  blocked.forEach((point) => {
    occupied.add(`${point.x},${point.y}`);
  });
  const candidates: Point[] = [];

  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      if (!occupied.has(`${x},${y}`)) {
        candidates.push({ x, y });
      }
    }
  }

  if (candidates.length === 0) return { x: 0, y: 0 };
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function nextHead(current: Point, direction: Direction): Point {
  if (direction === 'up') return { x: current.x, y: (current.y - 1 + ROWS) % ROWS };
  if (direction === 'down') return { x: current.x, y: (current.y + 1) % ROWS };
  if (direction === 'left') return { x: (current.x - 1 + COLS) % COLS, y: current.y };
  return { x: (current.x + 1) % COLS, y: current.y };
}

function isOpposite(a: Direction, b: Direction): boolean {
  return (
    (a === 'up' && b === 'down')
    || (a === 'down' && b === 'up')
    || (a === 'left' && b === 'right')
    || (a === 'right' && b === 'left')
  );
}

function SnakeOverlay({ onClose }: SnakeOverlayProps) {
  const [snake, setSnake] = useState<Point[]>(START_SNAKE);
  const [direction, setDirection] = useState<Direction>('right');
  const [queuedDirection, setQueuedDirection] = useState<Direction>('right');
  const [food, setFood] = useState<Point>(() => randomFood(START_SNAKE));
  const [powerUp, setPowerUp] = useState<Point | null>(null);
  const [powerTicksRemaining, setPowerTicksRemaining] = useState(0);
  const [alive, setAlive] = useState(true);
  const [score, setScore] = useState(0);
  const hasPowerUp = powerTicksRemaining > 0;

  function restart() {
    setSnake(START_SNAKE);
    setDirection('right');
    setQueuedDirection('right');
    setFood(randomFood(START_SNAKE));
    setPowerUp(null);
    setPowerTicksRemaining(0);
    setAlive(true);
    setScore(0);
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const code = event.code.toLowerCase();
      const next =
        key === 'arrowup' || key === 'w' ? 'up'
          : key === 'arrowdown' || key === 's' ? 'down'
            : key === 'arrowleft' || key === 'a' ? 'left'
              : key === 'arrowright' || key === 'd' ? 'right'
                : null;
      const isRestartKey = key === 'enter' || key === 'return' || code === 'enter' || code === 'numpadenter';

      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (isRestartKey && !alive) {
        event.preventDefault();
        restart();
        return;
      }

      if (!next) return;
      event.preventDefault();

      setQueuedDirection((currentQueued) => {
        const baseline = currentQueued ?? direction;
        if (isOpposite(baseline, next)) return currentQueued;
        return next;
      });
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [alive, direction, onClose]);

  useEffect(() => {
    if (!alive) return undefined;

    const baseSpeed = Math.max(70, 125 - score * 2);
    const speed = hasPowerUp ? Math.min(230, baseSpeed + 55) : baseSpeed;
    const timer = window.setInterval(() => {
      setDirection((currentDir) => (isOpposite(currentDir, queuedDirection) ? currentDir : queuedDirection));

      setSnake((currentSnake) => {
        const activeDirection = isOpposite(direction, queuedDirection) ? direction : queuedDirection;
        const head = currentSnake[0];
        const incoming = nextHead(head, activeDirection);
        const powerActiveOnTick = powerTicksRemaining > 0;
        const hitsSelf = currentSnake.some((segment) => segment.x === incoming.x && segment.y === incoming.y);

        if (hitsSelf && !powerActiveOnTick) {
          setAlive(false);
          return currentSnake;
        }

        const didEat = incoming.x === food.x && incoming.y === food.y;
        const didCollectPower = Boolean(powerUp && incoming.x === powerUp.x && incoming.y === powerUp.y);
        const nextSnake = [incoming, ...currentSnake];

        if (!didEat && !didCollectPower) {
          nextSnake.pop();
        } else {
          if (didEat) {
            setScore((prev) => prev + (powerActiveOnTick ? 2 : 1));
            setFood(randomFood(nextSnake, powerUp ? [powerUp] : []));
          }

          if (didCollectPower) {
            setPowerUp(null);
            setPowerTicksRemaining(POWER_UP_DURATION_TICKS);
          }
        }

        if (!didCollectPower) {
          setPowerTicksRemaining((current) => (current > 0 ? current - 1 : 0));
        }

        if (!powerActiveOnTick && !didCollectPower) {
          setPowerUp((currentPowerUp) => {
            if (currentPowerUp || Math.random() > POWER_UP_SPAWN_CHANCE) {
              return currentPowerUp;
            }

            return randomFood(nextSnake, [food]);
          });
        }

        return nextSnake;
      });
    }, speed);

    return () => window.clearInterval(timer);
  }, [alive, direction, queuedDirection, food, score, hasPowerUp, powerUp, powerTicksRemaining]);

  const snakeCells = useMemo(() => new Set(snake.map((segment) => `${segment.x},${segment.y}`)), [snake]);
  const baseSpeed = Math.max(70, 125 - score * 2);
  const speed = hasPowerUp ? Math.min(230, baseSpeed + 55) : baseSpeed;
  const powerSecondsRemaining = Math.max(0, Math.ceil((powerTicksRemaining * speed) / 1000));

  return createPortal(
    <div className="fixed inset-0 z-[72] pointer-events-none bg-transparent">
      <div
        className="absolute inset-0 grid overflow-hidden border border-cyan/25 bg-bg-primary/10"
        style={{
          gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: COLS * ROWS }).map((_, index) => {
          const x = index % COLS;
          const y = Math.floor(index / COLS);
          const cellKey = `${x},${y}`;
          const isHead = snake[0]?.x === x && snake[0]?.y === y;
          const isBody = snakeCells.has(cellKey);
          const isFood = food.x === x && food.y === y;
          const isPower = powerUp?.x === x && powerUp?.y === y;

          return (
            <span
              key={cellKey}
              className={`${
                isHead
                  ? hasPowerUp
                    ? 'bg-cyan/90 shadow-[0_0_16px_rgba(6,182,212,0.85)] snake-rainbow-pulse'
                    : 'bg-cyan/90 shadow-[0_0_16px_rgba(6,182,212,0.85)]'
                  : isBody
                    ? hasPowerUp
                      ? 'bg-cyan/55 snake-rainbow-pulse'
                      : 'bg-cyan/55'
                    : isFood
                      ? 'bg-pink/90'
                      : isPower
                        ? 'snake-rainbow-pulse flex items-center justify-center bg-violet/85 font-mono text-lg font-black leading-none tracking-tighter text-bg-primary sm:text-xl'
                      : 'bg-transparent'
              }`}
            >
              {isPower ? 'x2' : null}
            </span>
          );
        })}
      </div>

      <div
        className="pointer-events-auto absolute rounded-md border border-cyan/35 bg-bg-primary/35 px-3 py-2 text-xs text-cyan backdrop-blur-md"
        style={{
          left: 'max(1rem, calc(env(safe-area-inset-left, 0px) + 0.5rem))',
          top: 'max(1rem, calc(env(safe-area-inset-top, 0px) + 0.5rem))',
        }}
      >
        <p className="text-[10px] tracking-[0.12em] uppercase text-cyan/80">Score</p>
        <p className="text-sm font-semibold text-cyan">{score}</p>
      </div>

      <div
        className="pointer-events-auto absolute rounded-md border border-cyan/35 bg-bg-primary/35 px-3 py-2 text-xs text-cyan backdrop-blur-md"
        style={{
          right: 'max(1rem, calc(env(safe-area-inset-right, 0px) + 0.5rem))',
          top: 'max(1rem, calc(env(safe-area-inset-top, 0px) + 0.5rem))',
        }}
      >
        <p className="text-[10px] tracking-[0.12em] uppercase text-cyan/80">Status</p>
        <p className="text-sm font-semibold text-cyan">{alive ? 'Running' : 'Game Over'}</p>
        <p className="text-[11px] text-cyan/80">Speed {speed}ms</p>
        <p className="text-[11px] text-cyan/80">
          {hasPowerUp ? `Boost 2x points · ${powerSecondsRemaining}s` : 'Boost ready (2x points + slow)'}
        </p>
      </div>

      <div
        className="pointer-events-auto absolute rounded-md border border-cyan/35 bg-bg-primary/35 px-3 py-2 text-xs text-cyan/90 backdrop-blur-md"
        style={{
          left: 'max(1rem, calc(env(safe-area-inset-left, 0px) + 0.5rem))',
          bottom: 'max(1rem, calc(env(safe-area-inset-bottom, 0px) + 0.5rem))',
        }}
      >
        <p>Arrows / WASD to move</p>
        <p>Collect violet nodes for 2x points + slow</p>
        <p>Enter to restart · Esc to exit</p>
      </div>

      <div
        className="pointer-events-auto absolute"
        style={{
          right: 'max(1rem, calc(env(safe-area-inset-right, 0px) + 0.5rem))',
          bottom: 'max(1rem, calc(env(safe-area-inset-bottom, 0px) + 0.5rem))',
        }}
      >
        <button
          onClick={onClose}
          className="cursor-pointer rounded-md border border-cyan/35 bg-bg-primary/35 px-3 py-2 text-xs text-cyan backdrop-blur-md transition-colors hover:text-white"
          aria-label="Close snake mode"
        >
          <span className="inline-flex items-center gap-2">
            <FiX size={14} />
            Exit Snake
          </span>
        </button>
      </div>
    </div>,
    document.body,
  );
}

export default SnakeOverlay;
