import {
  SiReact, SiTypescript, SiNodedotjs, SiNextdotjs, SiPostgresql,
  SiDocker, SiTailwindcss, SiGraphql, SiRedis, SiPython,
  SiMongodb, SiWordpress, SiSanity, SiPwa,
  SiAmazonwebservices, SiVercel, SiSentry, SiStripe, SiVitest,
  SiCypress, SiReactrouter, SiJsonwebtokens, SiStrapi,
  SiOpenai, SiClaude, SiGooglegemini, SiGithubcopilot, SiHuggingface,
  SiAstro,
} from 'react-icons/si';
import { FiZap } from 'react-icons/fi';

const techIcons = [
  { Icon: SiReact, label: 'React', color: '#61dafb' },
  { Icon: SiTypescript, label: 'TypeScript', color: '#3178c6' },
  { Icon: SiNodedotjs, label: 'Node.js', color: '#6cc24a' },
  { Icon: SiNextdotjs, label: 'Next.js', color: '#e4e4e7' },
  { Icon: SiPostgresql, label: 'PostgreSQL', color: '#4169e1' },
  { Icon: SiDocker, label: 'Docker', color: '#2496ed' },
  { Icon: SiTailwindcss, label: 'Tailwind', color: '#06b6d4' },
  { Icon: SiGraphql, label: 'GraphQL', color: '#e10098' },
  { Icon: SiRedis, label: 'Redis', color: '#dc382d' },
  { Icon: SiPython, label: 'Python', color: '#3776ab' },
  { Icon: SiMongodb, label: 'MongoDB', color: '#47a248' },
  { Icon: SiWordpress, label: 'WordPress', color: '#21759b' },
  { Icon: SiStrapi, label: 'Strapi', color: '#8e75ff' },
  { Icon: SiSanity, label: 'Sanity.io', color: '#f03e2f' },
  { Icon: SiReactrouter, label: 'React Router', color: '#ca4245' },
  { Icon: SiVitest, label: 'Vitest', color: '#6e9f18' },
  { Icon: SiCypress, label: 'Cypress', color: '#69d3a7' },
  { Icon: SiJsonwebtokens, label: 'JWT', color: '#f5a524' },
  { Icon: SiStripe, label: 'Stripe', color: '#635bff' },
  { Icon: SiAmazonwebservices, label: 'AWS', color: '#ff9900' },
  { Icon: SiVercel, label: 'Vercel', color: '#ffffff' },
  { Icon: SiSentry, label: 'Sentry', color: '#362d59' },
  { Icon: SiPwa, label: 'PWA', color: '#5a0fc8' },
  { Icon: FiZap, label: 'Vite', color: '#fbbf24' },
  { Icon: SiOpenai, label: 'ChatGPT', color: '#10a37f' },
  { Icon: SiClaude, label: 'Claude', color: '#D97757' },
  { Icon: SiGooglegemini, label: 'Gemini', color: '#4285F4' },
  { Icon: SiGithubcopilot, label: 'GitHub Copilot', color: '#9b72cf' },
  { Icon: SiHuggingface, label: 'Hugging Face', color: '#FFD21E' },
  { Icon: SiAstro, label: 'Astro', color: '#FF5D01' },
];

const marqueeIcons = [...techIcons, ...techIcons];

function MarqueeTicker() {
  return (
    <div className="relative overflow-hidden border-t border-border bg-bg-primary/70 py-4 backdrop-blur-sm">
      {/* Fade edges */}
      <div
        className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-24"
        style={{ background: 'linear-gradient(to right, var(--color-bg-primary), transparent)' }}
      />
      <div
        className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-24"
        style={{ background: 'linear-gradient(to left, var(--color-bg-primary), transparent)' }}
      />

      <div className="marquee-track">
        {[0, 1].map((groupIndex) => (
          <div key={groupIndex} className="marquee-group" aria-hidden={groupIndex === 1}>
            {marqueeIcons.map((item, itemIndex) => (
              <div key={`${groupIndex}-${item.label}-${itemIndex}`} className="flex items-center gap-2.5">
                <item.Icon size={18} style={{ color: item.color }} />
                <span className="text-sm font-medium text-text-muted">{item.label}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MarqueeTicker;
