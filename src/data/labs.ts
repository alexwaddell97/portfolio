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
  },
];
