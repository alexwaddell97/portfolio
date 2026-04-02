export interface LabExperiment {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  status: 'live' | 'wip' | 'idea';
  layout?: 'canvas' | 'page';
}

export const labs: LabExperiment[] = [
  {
    slug: 'f1-dashboard',
    title: 'F1 Dashboard',
    description: 'Lap times, tyre strategy, position charts and race control feed for any session — powered by the OpenF1 API.',
    tags: ['f1', 'data', 'openf1', 'recharts'],
    status: 'live',
    layout: 'page',
  },
  {
    slug: 'ttr-dashboard',
    title: 'TTR Newcastle',
    description: 'Live standings and fixtures for Try Tag Rugby Newcastle leagues — The Parks and RGS Wednesday & Thursday.',
    tags: ['tag rugby', 'data', 'local', 'sports'],
    status: 'live',
    layout: 'page',
  },
];
