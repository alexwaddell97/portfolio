(function initAdminThemeFixes() {
  const styled = new WeakSet();
  const iframePatched = new WeakSet();

  function applyStyle(el, styles) {
    if (!(el instanceof HTMLElement)) return;
    Object.entries(styles).forEach(([prop, value]) => {
      el.style.setProperty(prop, value, 'important');
    });
  }

  function isActionButton(el) {
    const text = (el.textContent || '').toLowerCase();
    const title = (el.getAttribute('title') || '').toLowerCase();
    const className = (el.className || '').toString().toLowerCase();
    return (
      /preview|publish|save|status|duplicate|delete|unpublish|open authoring|create/i.test(text)
      || /toggle preview|sync scrolling/.test(title)
      || className.includes('editortoggle')
      || className.includes('buttonround')
      || className.includes('viewcontrols')
    );
  }

  function patchLabels(root) {
    const selectors = [
      'label',
      '[class*="Label"]',
      '[class*="label"]',
      '[class*="FieldLabel"]',
      '[class*="fieldLabel"]',
      '[for]',
    ];

    root.querySelectorAll(selectors.join(',')).forEach((el) => {
      if (styled.has(el)) return;
      applyStyle(el, {
        color: 'var(--aw-text-primary)',
        fontWeight: '600',
      });
      styled.add(el);
    });
  }

  function patchInputs(root) {
    const selectors = [
      'input',
      'textarea',
      'select',
      '[role="textbox"]',
      '[role="combobox"]',
      '[class*="SelectControl"]',
      '[class*="select-control"]',
      '[class*="Control"]',
      '[class*="control"]',
    ];

    root.querySelectorAll(selectors.join(',')).forEach((el) => {
      if (
        el instanceof HTMLInputElement
        && (
          el.getAttribute('aria-autocomplete') === 'list'
          || el.closest('.css-1tj8f8z-container')
          || el.closest('[class*="-container"]')
        )
      ) {
        applyStyle(el, {
          background: 'transparent',
          color: 'var(--aw-text-primary)',
          border: '0',
          boxShadow: 'none',
          outline: 'none',
        });
        styled.add(el);
        return;
      }

      if (styled.has(el)) return;
      applyStyle(el, {
        background: 'var(--aw-bg-secondary)',
        color: 'var(--aw-text-primary)',
        border: '1px solid var(--aw-border)',
        borderRadius: '10px',
      });
      styled.add(el);
    });
  }

  function patchDateControls(root) {
    const selectors = [
      '.rdt',
      '.rdtPicker',
      '.rdtBtn',
      '.rdtPrev',
      '.rdtNext',
      '.rdtSwitch',
      '[class*="date"] button',
      '[class*="Date"] button',
      '[aria-label*="Previous"]',
      '[aria-label*="Next"]',
      '.react-datepicker',
      '.react-datepicker *',
    ];

    root.querySelectorAll(selectors.join(',')).forEach((el) => {
      if (styled.has(el)) return;
      applyStyle(el, {
        background: 'var(--aw-bg-secondary)',
        color: 'var(--aw-text-primary)',
        borderColor: 'var(--aw-border)',
      });
      styled.add(el);
    });
  }

  function patchActionButtons(root) {
    root.querySelectorAll('[class*="ViewControls"], .css-1bqupl5-ViewControls').forEach((el) => {
      if (!(el instanceof HTMLElement) || styled.has(el)) return;
      applyStyle(el, {
        background: 'var(--aw-bg-secondary)',
        color: 'var(--aw-text-primary)',
        border: '1px solid var(--aw-border)',
        borderRadius: '12px',
      });
      styled.add(el);
    });

    root.querySelectorAll('button, a[role="button"], [class*="Button"], [class*="button"]').forEach((el) => {
      if (!(el instanceof HTMLElement) || styled.has(el) || !isActionButton(el)) return;

      const text = (el.textContent || '').toLowerCase();
      const title = (el.getAttribute('title') || '').toLowerCase();
      const className = (el.className || '').toString().toLowerCase();
      const isPrimary = /publish|save|create|open authoring/i.test(text);
      const isDanger = /delete|unpublish/i.test(text);
      const isEditorToggle = /toggle preview|sync scrolling/.test(title)
        || className.includes('editortoggle')
        || className.includes('buttonround');

      if (isPrimary) {
        applyStyle(el, {
          background: 'linear-gradient(135deg, var(--aw-cyan), var(--aw-violet))',
          color: '#ffffff',
          border: '0',
          borderRadius: '10px',
        });
      } else if (isDanger) {
        applyStyle(el, {
          background: 'rgba(236, 72, 153, 0.16)',
          color: '#fbcfe8',
          border: '1px solid rgba(236, 72, 153, 0.45)',
          borderRadius: '10px',
        });
      } else if (isEditorToggle) {
        applyStyle(el, {
          background: 'var(--aw-soft-button-bg)',
          color: 'var(--aw-soft-button-text)',
          border: '1px solid var(--aw-soft-button-border)',
          borderRadius: '10px',
        });
      } else {
        applyStyle(el, {
          background: 'var(--aw-soft-button-bg)',
          color: 'var(--aw-soft-button-text)',
          border: '1px solid var(--aw-soft-button-border)',
          borderRadius: '10px',
        });
      }

      styled.add(el);

      el.querySelectorAll('svg, svg path').forEach((iconNode) => {
        if (!(iconNode instanceof HTMLElement)) return;
        applyStyle(iconNode, {
          color: 'currentColor',
          fill: 'currentColor',
        });
      });
    });
  }

  function patchText(root) {
    const selectors = [
      'p',
      'small',
      'strong',
      '[class*="Hint"]',
      '[class*="hint"]',
      '[class*="Description"]',
      '[class*="description"]',
    ];

    root.querySelectorAll(selectors.join(',')).forEach((el) => {
      if (
        el instanceof HTMLElement
        && (el.closest('[data-slate-editor="true"]') || el.matches('[data-slate-editor="true"]'))
      ) {
        applyStyle(el, { color: 'var(--aw-text-primary)' });
        styled.add(el);
        return;
      }

      if (styled.has(el)) return;
      applyStyle(el, { color: 'var(--aw-text-secondary)' });
      styled.add(el);
    });
  }

  function applyPreviewIframeTheme(iframe) {
    if (!(iframe instanceof HTMLIFrameElement)) return;

    const doc = iframe.contentDocument;
    if (!doc) return;

    const rootStyle = getComputedStyle(document.documentElement);
    const bg = rootStyle.getPropertyValue('--aw-bg-card').trim() || '#12121f';
    const text = rootStyle.getPropertyValue('--aw-text-primary').trim() || '#e4e4e7';

    doc.documentElement.style.setProperty('background', bg, 'important');
    doc.documentElement.style.setProperty('color', text, 'important');
    doc.body.style.setProperty('margin', '0', 'important');
    doc.body.style.setProperty('background', bg, 'important');
    doc.body.style.setProperty('color', text, 'important');
    doc.body.style.setProperty('font-family', "'Inter', system-ui, sans-serif", 'important');
  }

  function patchPreviewPane(root) {
    root.querySelectorAll('iframe#preview-pane, iframe[class*="PreviewPaneFrame"], [class*="PreviewPaneContainer"] iframe').forEach((node) => {
      if (!(node instanceof HTMLIFrameElement)) return;

      applyStyle(node, {
        background: 'var(--aw-bg-card)',
        borderColor: 'var(--aw-border)',
      });

      applyPreviewIframeTheme(node);

      if (!iframePatched.has(node)) {
        node.addEventListener('load', () => applyPreviewIframeTheme(node));
        iframePatched.add(node);
      }
    });
  }

  function patchAll(root = document) {
    patchLabels(root);
    patchInputs(root);
    patchDateControls(root);
    patchActionButtons(root);
    patchText(root);
    patchPreviewPane(root);
  }

  patchAll(document);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          patchAll(node);
        }
      });
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener('aw-admin-theme-change', () => {
    patchAll(document);
  });
})();
