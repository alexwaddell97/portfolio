(function initDecapPreview() {
  const tagColorMap = {
    Dev: 'bg-cyan/10 text-cyan border-cyan/20',
    Architecture: 'bg-violet/10 text-violet border-violet/20',
    Career: 'bg-pink/10 text-pink border-pink/20',
    Life: 'bg-pink/10 text-pink border-pink/20',
    AI: 'bg-cyan/10 text-cyan border-cyan/20',
    'Open Source': 'bg-violet/10 text-violet border-violet/20',
  };

  function formatDate(iso) {
    if (!iso || typeof iso !== 'string') return 'Draft date';
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return iso;
    return parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function getTagColor(tag) {
    return tagColorMap[tag] || 'bg-violet/10 text-violet border-violet/20';
  }

  function renderContentBlocks(content, h) {
    const blocks = String(content || '')
      .split('\n\n')
      .map((block) => block.trim())
      .filter(Boolean);

    if (blocks.length === 0) {
      return [h('p', { key: '__empty__', className: 'leading-[1.85] text-base text-text-secondary italic' }, 'Start writing to preview your post content.')];
    }

    return blocks.map((block, index) => {
      if (block.startsWith('## ')) {
        return h('h2', {
          key: `h2-${index}`,
          className: 'mt-10 mb-4 text-2xl font-bold tracking-tight text-text-primary',
        }, block.slice(3));
      }

      if (block.startsWith('### ')) {
        return h('h3', {
          key: `h3-${index}`,
          className: 'mt-8 mb-3 text-xl font-semibold text-text-primary',
        }, block.slice(4));
      }

      return h('p', {
        key: `p-${index}`,
        className: `leading-[1.85] text-text-primary ${index === 0 ? 'text-lg' : 'text-base'}`,
      }, block);
    });
  }

  function registerPreview() {
    const CMS = window.CMS;
    const h = window.h;

    if (!CMS || !h) return false;

    function BlogPostPreview(props) {
      const data = props.entry.get('data').toJS();
      const title = data.title || 'Untitled post';
      const excerpt = data.excerpt || 'Add an excerpt to preview the hero summary.';
      const tags = Array.isArray(data.tags) ? data.tags : [];
      const readTime = Number.isFinite(Number(data.readTime)) ? Number(data.readTime) : 5;
      const body = typeof data.body === 'string' ? data.body : '';

      const renderedTags = (tags.length > 0
        ? tags.map((tag) => h('span', {
          key: String(tag),
          className: `rounded-full border px-3 py-1 text-xs font-medium ${getTagColor(String(tag))}`,
        }, String(tag)))
        : [h('span', {
          key: 'untagged',
          className: 'rounded-full border px-3 py-1 text-xs font-medium bg-violet/10 text-violet border-violet/20',
        }, 'Untagged')]
      );

      return h(
        'div',
        { className: 'min-h-screen bg-bg-primary text-text-primary flex flex-col', 'data-theme': 'dark' },
        h(
          'main',
          { className: 'flex-1' },
          h(
            'div',
            { className: 'relative dot-grid border-b border-border overflow-hidden' },
            h('div', { className: 'pointer-events-none absolute -top-20 left-1/3 h-72 w-72 rounded-full bg-violet opacity-[0.07] blur-3xl' }),
            h('div', { className: 'pointer-events-none absolute top-8 right-1/4 h-48 w-48 rounded-full bg-pink opacity-[0.05] blur-3xl' }),
            h(
              'div',
              { className: 'mx-auto w-full max-w-3xl px-4 pb-16 pt-32 sm:px-6 lg:px-8' },
              h(
                'div',
                null,
                h(
                  'div',
                  { className: 'mb-4 flex flex-wrap items-center gap-3' },
                  h('span', { className: 'text-sm text-text-secondary' }, formatDate(data.date)),
                  h('span', { className: 'text-text-secondary/60', 'aria-hidden': 'true' }, '·'),
                  h(
                    'span',
                    { className: 'flex items-center gap-1.5 text-sm text-text-secondary' },
                    h(
                      'svg',
                      {
                        width: '12',
                        height: '12',
                        viewBox: '0 0 24 24',
                        fill: 'none',
                        stroke: 'currentColor',
                        strokeWidth: '2',
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                        'aria-hidden': 'true',
                      },
                      h('circle', { cx: '12', cy: '12', r: '10' }),
                      h('polyline', { points: '12 6 12 12 16 14' })
                    ),
                    `${readTime} min read`
                  )
                ),
                h('h1', { className: 'page-heading-sweep display-heading-safe text-4xl font-bold leading-tight tracking-tight md:text-5xl' }, title),
                h('p', { className: 'mt-4 text-lg leading-relaxed text-text-secondary' }, excerpt),
                h('div', { className: 'mt-5 flex flex-wrap gap-2' }, ...renderedTags)
              )
            )
          ),
          h(
            'article',
            { className: 'mx-auto w-full max-w-2xl px-4 py-16 sm:px-6 lg:px-8' },
            h('div', { className: 'space-y-6' }, ...renderContentBlocks(body, h))
          )
        )
      );
    }

    CMS.registerPreviewStyle('/src/index.css');
    CMS.registerPreviewStyle('/src/App.css');
    CMS.registerPreviewStyle('/admin/preview.css');
    CMS.registerPreviewTemplate('blog', BlogPostPreview);
    return true;
  }

  if (registerPreview()) return;

  let attempts = 0;
  const maxAttempts = 80;
  const timer = window.setInterval(() => {
    attempts += 1;
    if (registerPreview() || attempts >= maxAttempts) {
      window.clearInterval(timer);
    }
  }, 50);
})();
