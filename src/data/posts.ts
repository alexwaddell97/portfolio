import type { BlogPost } from '../types/index.ts';

type FrontmatterValue = string | number | boolean | string[];

const markdownModules = import.meta.glob('../content/blog/*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>;

function stripQuotes(value: string): string {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseFrontmatter(raw: string): { frontmatter: Record<string, FrontmatterValue>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    return { frontmatter: {}, content: raw.trim() };
  }

  const frontmatterBlock = match[1] ?? '';
  const content = raw.slice(match[0].length).trim();
  const lines = frontmatterBlock.split(/\r?\n/);
  const frontmatter: Record<string, FrontmatterValue> = {};

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const entryMatch = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!entryMatch) continue;

    const key = entryMatch[1];
    const rawValue = entryMatch[2].trim();

    if (rawValue.length === 0) {
      const listValues: string[] = [];
      while (index + 1 < lines.length) {
        const nextLine = lines[index + 1];
        const listMatch = nextLine.match(/^\s*-\s*(.+)$/);
        if (!listMatch) break;
        listValues.push(stripQuotes(listMatch[1]));
        index += 1;
      }
      frontmatter[key] = listValues;
      continue;
    }

    if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
      const values = rawValue
        .slice(1, -1)
        .split(',')
        .map((part) => stripQuotes(part))
        .filter(Boolean);
      frontmatter[key] = values;
      continue;
    }

    if (rawValue === 'true' || rawValue === 'false') {
      frontmatter[key] = rawValue === 'true';
      continue;
    }

    if (/^-?\d+(\.\d+)?$/.test(rawValue)) {
      frontmatter[key] = Number(rawValue);
      continue;
    }

    frontmatter[key] = stripQuotes(rawValue);
  }

  return { frontmatter, content };
}

function fallbackSlugFromPath(path: string): string {
  const fileName = path.split('/').pop() ?? 'untitled';
  return fileName.replace(/\.md$/, '');
}

function estimateReadTime(content: string): number {
  const words = content.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function firstParagraph(content: string): string {
  const paragraph = content
    .split(/\n\n+/)
    .map((block) => block.trim())
    .find((block) => block.length > 0 && !block.startsWith('#'));
  if (!paragraph) return '';
  return paragraph.length > 180 ? `${paragraph.slice(0, 177)}...` : paragraph;
}

const posts: BlogPost[] = Object.entries(markdownModules)
  .map(([path, raw]) => {
    const { frontmatter, content } = parseFrontmatter(raw);

    if (frontmatter.draft === true) {
      return null;
    }

    const status = typeof frontmatter.status === 'string'
      ? frontmatter.status.trim().toLowerCase()
      : 'live';

    if (status === 'hidden') {
      return null;
    }

    const slug = typeof frontmatter.slug === 'string' && frontmatter.slug.trim().length > 0
      ? frontmatter.slug
      : fallbackSlugFromPath(path);

    const tags = Array.isArray(frontmatter.tags)
      ? frontmatter.tags.filter((tag): tag is string => typeof tag === 'string' && tag.length > 0)
      : typeof frontmatter.tags === 'string'
        ? frontmatter.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : [];

    const title = typeof frontmatter.title === 'string' && frontmatter.title.trim().length > 0
      ? frontmatter.title
      : slug;

    const date = typeof frontmatter.date === 'string' && frontmatter.date.trim().length > 0
      ? frontmatter.date
      : '1970-01-01';

    const readTime = typeof frontmatter.readTime === 'number' && Number.isFinite(frontmatter.readTime)
      ? Math.max(1, Math.round(frontmatter.readTime))
      : estimateReadTime(content);

    const excerpt = typeof frontmatter.excerpt === 'string' && frontmatter.excerpt.trim().length > 0
      ? frontmatter.excerpt
      : firstParagraph(content);

    return {
      slug,
      title,
      date,
      readTime,
      excerpt,
      tags,
      content,
    } satisfies BlogPost;
  })
  .filter((post): post is BlogPost => Boolean(post))
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export default posts;
