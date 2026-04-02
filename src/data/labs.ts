export interface LabCaseStudy {
  overview: string;
  challenge: string;
  approach: string;
  outcome: string;
  techBrief?: string;
}

export interface LabExperiment {
  slug: string;
  path: string;
  title: string;
  shortTitle?: string;
  description: string;
  image?: string;
  tags: string[];
  status: 'live' | 'wip' | 'idea';
  layout?: 'canvas' | 'page';
  color: string;
  icon: string;
  caseStudy?: LabCaseStudy;
}

export const labs: LabExperiment[] = [
  {
    slug: 'f1-dashboard',
    path: '/f1',
    title: 'F1 Data Explorer',
    description: 'Lap times, tyre strategy, position charts and race control feed for any session, powered by the OpenF1 API.',
    image: '/images/labs/f1.png',
    tags: ['React', 'TypeScript', 'Recharts', 'OpenF1 API', 'Vite'],
    status: 'live',
    layout: 'page',
    color: '#f97316',
    icon: '🏎',
    caseStudy: {
      overview:
        'A race data explorer for drilling from championship standings down to lap time comparisons, tyre strategy and race control messages. Powered by the OpenF1 API.',
      challenge:
        'The OpenF1 API returns raw time-series data at high granularity, requiring client-side aggregation and normalisation before it can be rendered in charts. Keeping the UI snappy without a backend was the key constraint.',
      approach:
        'Data fetching is layered: year, meeting, session, telemetry. Each level is cached in state and the drill-down is serialised into URL search params so any view is shareable. Recharts handles visualisations with custom tooltips tuned for F1 data.',
      outcome:
        'A fast, shareable dashboard where F1 fans can explore any session from past and current seasons, entirely in the browser.',
      techBrief:
        'React SPA with Recharts and React Router URL params for stateful navigation. Data is fetched client-side from the public OpenF1 API. Built with Vite and TypeScript.',
    },
  },
  {
    slug: 'ttr-dashboard',
    path: '/ttr',
    title: 'TTR Newcastle Fixtures & Standings',
    shortTitle: 'TTR Newcastle',
    description: 'Live standings and fixtures for Try Tag Rugby Newcastle leagues, running Monday, Wednesday and Thursday.',
    image: '/images/labs/ttr.png',
    tags: ['React', 'TypeScript', 'Vercel Edge', 'Vite'],
    status: 'live',
    layout: 'page',
    color: '#d01c1c',
    icon: '🏉',
    caseStudy: {
      overview:
        'A standings and fixtures dashboard for Try Tag Rugby Newcastle, covering Monday, Wednesday and Thursday leagues. Built for the players, with team profiles, head-to-head records and shareable URLs.',
      challenge:
        'TTR does not expose a public API. Data had to be sourced by reverse-engineering the internal calls made by the existing web app, then proxied through an edge function to avoid CORS restrictions.',
      approach:
        'A Vercel Edge Function relays requests to the upstream TTR API, keeping auth headers server-side. Data is also cached as JSON snapshots so the dashboard stays available when the upstream API is slow. All navigable state lives in URL search params.',
      outcome:
        'A bookmarkable dashboard TTR Newcastle players use weekly. Any view is a shareable URL. All-time records and head-to-head stats give players context beyond the current season.',
      techBrief:
        'React SPA with React Router URL params for all navigable state. Vercel Edge Function proxy for upstream API access. JSON snapshots for resilient caching. Built with Vite and TypeScript.',
    },
  },
];
