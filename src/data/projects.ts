import type { Project } from '../types/index.ts';

const projects: Project[] = [
  {
    id: 'project-1',
    slug: 'gig-lab',
    title: 'Gig Lab',
    description:
      'A venue discovery and booking platform helping independent UK venues get found, get booked, and grow.',
    image: '/images/11.webp',
    imageBgHex: '#1D1F2E',
    liveUrl: 'https://www.giglab.co.uk/',
    repoUrl: '',
    tags: ['React', 'Node.js', 'Marketplace', 'Booking Platform'],
    category: ['Full-Stack', 'Frontend'],
    accentColor: 'cyan',
    accentHex: '#14DEC7',
    featured: true,
    stats: [
      { label: 'Music Venues', value: '800+' },
      { label: 'Active Users', value: '10k+' },
      { label: 'Uptime', value: '99.9%' },
    ],
    caseStudy: {
      titleGradient: { from: '#F292D2', to: '#14DEC7' },
      overview:
        'Built a production-grade e-commerce platform serving thousands of daily transactions with real-time inventory across multiple warehouses.',
      challenge:
        'Needed to handle real-time inventory sync across multiple warehouses without overselling during flash sales — traditional polling caused race conditions.',
      approach:
        'Implemented an event-sourcing pattern with PostgreSQL LISTEN/NOTIFY for live inventory updates, combined with optimistic locking and a queue-based checkout flow.',
      outcome:
        'Reduced checkout abandonment by 40% and achieved sub-100ms inventory checks at 10k concurrent users. Zero overselling incidents in 12 months of production.',
    },
  },
  {
    id: 'project-2',
    slug: 'my-atlas',
    title: 'My Atlas',
    description:
      'A health diagnostics platform for at-home and in-clinic blood testing, with online booking and GP consultation journeys.',
    image: '/images/2.webp',
    imageBgHex: '#F9F2EA',
    liveUrl: 'https://my-atlas.co.uk',
    repoUrl: '',
    tags: ['WordPress', 'WooCommerce', 'HealthTech', 'E-commerce'],
    category: ['Full-Stack', 'Frontend'],
    accentColor: 'violet',
    accentHex: '#F8F3EA',
    stats: [
      { label: 'Teams Using', value: '500+' },
      { label: 'Tasks Created', value: '1M+' },
      { label: 'Sync Latency', value: '<50ms' },
    ],
    caseStudy: {
      titleGradient: { from: '#F8F3EA', to: '#F8F3EA' },
      overview:
        'A real-time collaborative workspace built for distributed teams, designed to replace a legacy tool with a 6-year-old architecture.',
      challenge:
        'Keeping board state consistent across clients during concurrent edits without conflicts or lost updates.',
      approach:
        'Used CRDTs (conflict-free replicated data types) via Yjs over WebSocket for optimistic updates, with Prisma handling durable persistence.',
      outcome:
        'Zero data conflicts reported across 500 teams in 6 months of production. Sync latency consistently under 50ms globally.',
    },
  },
  {
    id: 'project-3',
    slug: 'floe-ne-map',
    title: 'Floe NE Map',
    description:
      'An interactive regional map and business directory connecting the North East entrepreneurial and tech ecosystem.',
    image: '/images/9.webp',
    imageBgHex: '#111827',
    liveUrl: 'https://www.nemap.co.uk/',
    repoUrl: '',
    tags: ['Next.js', 'Geo Search', 'Interactive Map', 'Business Directory'],
    category: 'Data & Viz',
    accentColor: 'pink',
    accentHex: '#FBA2C7',
    stats: [
      { label: 'Events/second', value: '50k' },
      { label: 'Render Time', value: '<16ms' },
      { label: 'Data Sources', value: '12' },
    ],
    caseStudy: {
      titleGradient: { from: '#1CE7B1', to: '#FBA2C7' },
      overview:
        'High-frequency data visualisation for a fintech client processing 50k events per second across 12 data sources.',
      challenge:
        "Rendering thousands of data points in real-time without dropping frames — the DOM simply couldn't keep up.",
      approach:
        'Canvas-based D3 rendering with a Redis pub/sub fan-out and intelligent data decimation to maintain 60fps at any zoom level.',
      outcome:
        'Sustained 60fps at 50k events/sec on mid-range hardware. Client reported a 3x increase in analyst productivity.',
    },
  },
  {
    id: 'project-4',
    slug: 'sports-guardian',
    title: 'Sports Guardian',
    description:
      'A sports safety and medical ID platform with QR-enabled wristbands, individual subscriptions, and organisation support flows.',
    image: '/images/8.webp',
    liveUrl: 'https://app.sportsguardian.com/',
    tags: ['Next.js', 'QR Authentication', 'Safety Platform', 'Subscription Flow'],
    category: ['Full-Stack', 'Frontend'],
    accentColor: 'cyan',
    accentHex: '#EBAA00',
    stats: [
      { label: 'Pieces Generated', value: '100k+' },
      { label: 'Time Saved/user', value: '3hrs' },
      { label: 'Editor Approval', value: '94%' },
    ],
    caseStudy: {
      titleGradient: { from: '#EBAA00', to: '#EBAA00' },
      overview:
        'An AI-powered writing assistant that generates on-brand content at scale for enterprise marketing teams.',
      challenge:
        "Maintaining consistent brand voice across LLM outputs — early versions produced content the editors rejected 55% of the time.",
      approach:
        'Fine-tuning prompts with RAG over company style guides stored in a vector DB, plus a feedback loop that learns from editor corrections.',
      outcome:
        'Editor approval rate increased from 45% to 94% in 3 months. Average time saved per writer: 3 hours per week.',
    },
  },
  {
    id: 'project-5',
    slug: 'switch-savvi',
    title: 'Switch Savvi',
    description:
      'An SME business energy comparison and switching journey that generates personalised quotes in a guided flow.',
    image: '/images/4.webp',
    liveUrl: 'https://switchsavvi.procuresmart.com/',
    repoUrl: '',
    tags: ['Next.js', 'Multi-Step Form', 'Energy Comparison', 'Lead Capture'],
    category: ['Full-Stack', 'Frontend'],
    accentColor: 'violet',
    accentHex: '#1E7675',
    stats: [
      { label: 'Active Users', value: '20k+' },
      { label: 'Coins Tracked', value: '1,000+' },
      { label: 'Price Update Latency', value: '<1s' },
    ],
    caseStudy: {
      titleGradient: { from: '#1E7675', to: '#C7EBB6' },
      overview:
        'A real-time cryptocurrency portfolio tracker that aggregates data from multiple exchanges and APIs.',
      challenge:
        "Ensuring real-time price updates with low latency while handling API rate limits and potential downtime.",
      approach:
        'Implemented a WebSocket-based data pipeline with intelligent caching and fallback strategies to maintain real-time updates.',
      outcome:
        'Achieved sub-1 second price update latency for 1,000+ coins. User base grew to 20k active users within 6 months.',
    },
  },
  {
    id: 'project-6',
    slug: 'sp_ce-real-estate',
    title: 'SP_CE Real Estate',
    description:
      'A real estate consultancy website with property listings, search filters, and service-led lead generation pages.',
    image: '/images/3.webp',
    liveUrl: 'https://www.spacerealestate.me/',
    repoUrl: '',
    tags: ['Next.js', 'CMS', 'Real Estate', 'Property Search'],
    category: ['Full-Stack', 'Frontend'],
    accentColor: 'pink',
    accentHex: '#DEAFF8',
    stats: [
      { label: 'Downloads', value: '50k+' },
      { label: 'Daily Active Users', value: '5k+' },
      { label: 'Average Session', value: '15min' },
    ],
    caseStudy: {
      titleGradient: { from: '#DEAFF8', to: '#ADCCFE' },
      overview:
        'A mobile app designed to help users reduce stress through guided meditations and mood tracking.',
      challenge:
        "Creating a calming, performant experience on mobile while integrating rich animations and real-time mood tracking.",
      approach:
        'Used React Native with Expo for rapid development, Firebase for real-time data sync, and Lottie for smooth animations.',
      outcome:
        '50k+ downloads with a 4.8-star rating. Average session length of 15 minutes, indicating high user engagement.',
    },
  },
  {
    id: 'project-7',
    slug: 'saleslynk',
    title: 'SalesLynk',
    description:
      'A personal portfolio website used to showcase projects, case studies, and content updates.',
    image: '/images/12.webp',
    imageBgHex: '#FCB22D',
    liveUrl: 'https://alexw.dev/',
    repoUrl: '',
    tags: ['React', 'Vite', 'Portfolio', 'CMS-Driven'],
    category: 'Frontend',
    accentColor: 'cyan',
    accentHex: '#FCB22D',
    stats: [
      { label: 'Unique Visitors/month', value: '5k+' },
      { label: 'Projects Showcased', value: '10+' },
      { label: 'CMS Updates', value: '100% via Contentful' },
    ],
    caseStudy: {
      titleGradient: { from: '#FCB22D', to: '#E6583A' },
      overview:
        'A personal portfolio website designed to showcase projects and share insights through a custom CMS.',
      challenge:
        "Building a unique, visually engaging portfolio that stands out while being easy to update without developer intervention.",
      approach:
        'Used React and Tailwind for a custom design, Vite for fast performance, and Contentful as a headless CMS for non-technical updates.',
      outcome:
        'Attracts 5k+ unique visitors per month. All project updates and blog posts are managed through Contentful, allowing for easy maintenance.',
    },  
  }
];

export default projects;
