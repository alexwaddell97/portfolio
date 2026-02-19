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
    tags: ['React', 'Vite', 'Node.js', 'Marketplace', 'Booking Platform', 'SaaS'],
    category: ['Full-Stack', 'Frontend'],
    accentColor: 'cyan',
    accentHex: '#14DEC7',
    accentHexLight: '#0A8C7D',
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
    accentHexLight: '#7A5225',
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
    tags: ['Next.js', 'Geo Search', 'Leaflet Map', 'Business Directory'],
    category: ['Full-Stack', 'Data & Viz'],
    accentColor: 'pink',
    accentHex: '#FBA2C7',
    accentHexLight: '#B02E6E',
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
    title: 'Sports Guardian - App',
    description:
      'A sports safety and medical ID platform with QR-enabled wristbands, individual subscriptions, and organisation support flows.',
    image: '/images/8.webp',
    liveUrl: 'https://app.sportsguardian.com/',
    repoUrl: '',
    tags: ['React', 'Vite', 'QR', 'Native Integration', 'PWA'],
    category: ['Full-Stack', 'Frontend'],
    accentColor: 'cyan',
    accentHex: '#EBAA00',
    accentHexLight: '#8B6300',
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
    accentHexLight: '#155556',
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
    tags: ['Next.js', 'Headless Wordpress', 'Real Estate', 'Property Search'],
    category: ['Full-Stack', 'Frontend'],
    accentColor: 'pink',
    accentHex: '#DEAFF8',
    accentHexLight: '#7820C8',
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
      'Sales intelligence application responsible for ingestion, enrichment, scoring and the compact prospect-brief dashboard used by sales teams.',
    image: '/images/12.webp',
    imageBgHex: '#FCB22D',
    liveUrl: 'https://www.saleslynk.co.uk/',
    repoUrl: '',
    tags: ['React', 'Node.js', 'Postgres', 'Data Pipeline', 'SaaS'],
    category: ['Full-Stack', 'Data & Viz', 'AI / ML'],
    accentColor: 'cyan',
    accentHex: '#FCB22D',
    accentHexLight: '#9C5E00',
    stats: [
      { label: 'Companies Indexed', value: 'Millions+' },
      { label: 'Enterprise Trials', value: 'Private / By Invite' },
      { label: 'Avg Research Time', value: '<1min' },
    ],
    caseStudy: {
      titleGradient: { from: '#FCB22D', to: '#E6583A' },
      overview:
        'Built the core SalesLynk sales intelligence application: resilient ingestion and enrichment pipelines, a relevance/scoring engine, and a compact dashboard that delivers actionable prospect briefs to sales reps (private enterprise access).',
      challenge:
        'Aggregating, normalising and enriching signals from thousands of sources while keeping data fresh, accurate and concise for fast consumption by sales teams.',
      approach:
        'Implemented resilient ETL pipelines, deduplication and company/contact resolution, a scoring layer for relevance, server-side caching and precomputed briefs, plus a minimal UX optimized for rapid reading and role-based access controls for enterprise deployments.',
      outcome:
        'Delivered private enterprise deployments and pilot trials that reduced pre-call research time to under a minute and increased meeting conversion for pilot customers; marketing site remains separate for demos and lead capture.',
    },
  },
  {
    id: 'project-8',
    slug: 'roleplaying-realm',
    title: 'Roleplaying Realm',
    description:
      'A personal project that uses AI as a game master to let players roleplay in fictitious worlds and franchise-style settings.',
    image: '/images/14.png',
    imageBgHex: '#4F46E5',
    liveUrl: 'https://dev.roleplayingrealm.com/',
    repoUrl: '',
    tags: ['AI', 'Game Master', 'Roleplaying', 'LLM'],
    category: ['Full-Stack', 'AI / ML'],
    accentColor: 'violet',
    accentHex: '#4F46E5',
    accentHexLight: '#A78BFA',
    featured: false,
    stats: [
      { label: 'Playable Worlds', value: '15+' },
      { label: 'Active Sessions', value: '100+' },
      { label: 'Unique Players', value: '45+' },
    ],
    caseStudy: {
      titleGradient: { from: '#4F46E5', to: '#A78BFA' },
      overview:
        'Roleplaying Realm experiments with using a large language model as an adaptive game master, creating dynamic narratives and playable scenarios inspired by favourite franchises.',
      challenge:
        'Keeping narrative coherence across long sessions while allowing free-form player input and respecting franchise-specific tone and constraints.',
      approach:
        'Combined strong system prompts with retrieval-augmented context for lore, explicit state management for game sessions, deterministic seeds for reproducible events, and moderation layers to enforce safety and IP-aware behaviour.',
      outcome:
        'Delivered a public demo at the provided URL with stable session persistence and coherent storylines; useful testbed for experimenting with interactive narrative designs and safety-driven LLM orchestration.',
      imageUrl: '/images/14.png',
    },
  },
  {
    id: 'project-9',
    slug: 'null-void',
    title: 'null // void',
    description:
      'A puzzle/investigation game built around an old-style computer terminal interface.',
    image: '/images/15.png',
    imageBgHex: '#62AD72',
    liveUrl: 'https://nullvoid-smoky.vercel.app/',
    repoUrl: '',
    tags: ['React', 'Vite', 'Electron', 'Puzzle', 'Investigation', 'Interactive'],
    category: ['Full-Stack', 'AI / ML'],
    accentColor: 'cyan',
    accentHex: '#62AD72',
    accentHexLight: '#3F8A55',
    featured: false,
    stats: [
      { label: 'Playtest Sessions', value: '100+' },
      { label: 'Unique Puzzles', value: '20+' },
      { label: 'Interface', value: 'Terminal-style' },
    ],
    caseStudy: {
      titleGradient: { from: '#62AD72', to: '#A7F0C9' },
      overview:
        'Designed and built a web-based investigation game emulating a vintage terminal UI where players piece together story fragments via commands and log analysis.',
      challenge:
        'Creating an authentic terminal experience while keeping interactions discoverable and robust across browsers.',
      approach:
        'Implemented a command parser and stateful session backend, crafted puzzles as modular, testable units, and designed the UI to evoke retro terminals while remaining accessible.',
      outcome:
        'Shipped a public demo that highlighted constrained-UI UX and narrative puzzle design; used as a portfolio piece and playtest vehicle for iterative puzzle tuning.',
      imageUrl: '/images/15.png',
    },
  },
  {
    id: 'project-10',
    slug: 'styleability',
    title: 'Styleability',
    description:
      'An accessibility first clothing guidance and sizing platform tailored for diverse user needs.',
    image: '/images/16.png',
    imageBgHex: '#32164C',
    liveUrl: 'https://www.styleability.co.uk/',
    repoUrl: '',
    tags: ['Next.js', 'Accessibility', 'Recommendation Engine', 'E-commerce'],
    category: ['Full-Stack', 'Frontend'],
    accentColor: 'violet',
    accentHex: '#6B5B8A',
    accentHexLight: '#32164C',
    featured: false,
    stats: [
      { label: 'Brands Supported', value: '20+' },
      { label: 'Items Indexed', value: '50k+' },
      { label: 'Avg Fit Time', value: '<2min' },
    ],
    caseStudy: {
      titleGradient: { from: '#6B5B8A', to: '#32164C' },
      overview:
        'Built the core Styleability platform that powers accessible clothing guidance, size recommendations and measurement coaching for customers across brands.',
      challenge:
        'Standardising size data across brands and designing an inclusive, accessible UI that helps users find better-fitting clothes quickly.',
      approach:
        'Created a size-mapping engine, measurement-guided onboarding, and an accessibility-first UI with clear contrast, screen-reader support and reduced-motion defaults.',
      outcome:
        'Delivered a production-ready application driving the marketing site’s demo flows and improving user confidence in fit and accessibility across supported brands.',
      imageUrl: '/images/16.png',
    },
  },
  {
    id: 'project-11',
    slug: 'octolog',
    title: 'OctoLog',
    description:
      'A web based visual client for storing and playing emulated ROMs.',
    image: '/images/17.png',
    imageBgHex: '#ffb86a',
    liveUrl: '',
    repoUrl: '',
    tags: ['Electron', 'Emulation', 'Media', 'Local-First'],
    category: ['Frontend', 'Full-Stack'],
    accentColor: 'cyan',
    accentHex: '#ffb86a',
    accentHexLight: '#ffdca8',
    featured: false,
    stats: [
      { label: 'Roms Stored', value: '500+' },
      { label: 'Play Sessions', value: '2k+' },
      { label: 'Formats Supported', value: '10+' },
    ],
    caseStudy: {
      titleGradient: { from: '#ffb86a', to: '#ffdca8' },
      overview:
        'OctoLog is a visual client for managing and playing emulated ROMs: a local-first library with a lightweight player and metadata-driven UI.',
      challenge:
        'Providing a smooth, safe browser-based playback experience while indexing and previewing many ROM formats and respecting user files.',
      approach:
        'Built a local-first storage layer, background processing to generate thumbnails/previews, and an embeddable WebAssembly-based player for performant, sandboxed playback.',
      outcome:
        'Delivered a polished demo used for playtesting and to validate WebAssembly playback performance and local indexing UX.',
      imageUrl: '/images/17.png',
    },
  },
  {
    id: 'project-12',
    slug: 'arbitrum-grants',
    title: 'Arbitrum Grants',
    description:
      'Built the grants page for the Arbitrum Foundation website while keeping the experience accessible and performant.',
    image: '/images/18.png',
    imageBgHex: '#39A1F0',
    liveUrl: 'https://arbitrum.foundation/grants',
    repoUrl: '',
    tags: ['Next.js', 'Web3', 'Grants', 'Accessibility'],
    category: ['Frontend'],
    accentColor: 'cyan',
    accentHex: '#7FD1FF',
    accentHexLight: '#39A1F0',
    featured: false,
    stats: [
      { label: 'Grants Listed', value: '100+' },
      { label: 'Applications', value: 'Thousands' },
      { label: 'Avg Decision Time', value: '<48hrs' },
    ],
    caseStudy: {
      titleGradient: { from: '#7FD1FF', to: '#39A1F0' },
      overview:
        'Implemented the public grants listing and application experience for the Arbitrum Foundation, focusing on clarity, accessibility and performance.',
      challenge:
        'Presenting complex eligibility criteria and a large, filterable grants catalogue while keeping the experience accessible and performant.',
      approach:
        'Built an accessible, responsive layout with server-side rendering for fast initial load, robust filtering and clear call-to-action flows for applicants.',
      outcome:
        'Launched the live grants page used for applications and program info; improved discoverability and clarity for prospective applicants.',
      imageUrl: '/images/18.png',
    },
  },
  {
    id: 'project-13',
    slug: 'beinggiant',
    title: 'Being Giant',
    description:
      'A standard marketing site plus dashboard to access unlockable course content and member resources.',
    image: '/images/19.png',
    imageBgHex: '#0E0726',
    liveUrl: 'https://beinggiant.com/',
    repoUrl: '',
    tags: ['Next.js', 'Dashboard', 'Membership', 'Education'],
    category: ['Full-Stack'],
    accentColor: 'violet',
    accentHex: '#5B4B7A',
    accentHexLight: '#0E0726',
    featured: false,
    stats: [
      { label: 'Courses', value: '100+' },
      { label: 'Members', value: '300+' },
      { label: 'Unlocks', value: '2000+' },
    ],
    caseStudy: {
      titleGradient: { from: '#5B4B7A', to: '#0E0726' },
      overview:
        'Built the Being Giant marketing site and member dashboard, enabling course unlocks, gated content and a clear member journey.',
      challenge:
        'Designing a performant, accessible membership flow with reliable gated access to course materials across devices.',
      approach:
        'Implemented an SSR marketing site with a secure dashboard, incremental static regeneration for content, and role-based access for course unlocks.',
      outcome:
        'Launched a cohesive marketing + member experience that improved course discoverability and reduced support friction for access-related issues.',
      imageUrl: '/images/19.png',
    },
  },
  {
    id: 'project-14',
    slug: 'sports-guardian-booking',
    title: 'Sports Guardian - Booking Platform',
    description:
      'The booking system for Sports Guardian venues, allowing participants to book activities and manage memberships.',
    image: '/images/20.png',
    imageBgHex: '#EBAA00',
    liveUrl: 'https://booking-dev.sportsguardian.com/',
    repoUrl: '',
    tags: ['Next.js', 'Booking', 'Scheduling'],
    category: ['Full-Stack'],
    accentColor: 'cyan',
    accentHex: '#EBAA00',
    accentHexLight: '#8B6300',
    featured: false,
    stats: [
      { label: 'Bookings / month', value: '10k+' },
      { label: 'Organisations', value: '1k+' },
      { label: 'Avg Lead Time', value: '<3 days' },
    ],
    caseStudy: {
      titleGradient: { from: '#EBAA00', to: '#EBAA00' },
      overview:
        'Built the booking platform for Sports Guardian handling venue schedules, customer bookings and organiser admin flows.',
      challenge:
        'Coordinating availability across organisers, preventing double-booking and keeping the booking UX fast and accessible across devices.',
      approach:
        'Implemented robust availability checks, optimistic UI for bookings, background reconciliation for edge cases, and an accessible PWA frontend for offline-friendly booking.',
      outcome:
        'Delivered a production-ready booking system used in pilot deployments; the dev URL is provided and the production URL will remove the `-dev` suffix.',
      imageUrl: '/images/20.png',
    },
  },
];

export default projects;
