export interface LabExperiment {
  slug: string;
  path: string;
  title: string;
  description: string;
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
    title: 'F1 Dashboard',
    description: 'Lap times, tyre strategy, position charts and race control feed for any session, powered by the OpenF1 API.',
    tags: ['f1', 'data', 'openf1', 'recharts'],
    status: 'live',
    layout: 'page',
    color: '#f97316',
    icon: '🏎',
  },
  {
    slug: 'ttr-dashboard',
    path: '/ttr',
    title: 'TTR Newcastle',
    description: 'Live standings and fixtures for Try Tag Rugby Newcastle leagues, running Monday, Wednesday and Thursday.',
    tags: ['tag rugby', 'data', 'local', 'sports'],
    status: 'live',
    layout: 'page',
    color: '#d01c1c',
    icon: '🏉',
  },
];
