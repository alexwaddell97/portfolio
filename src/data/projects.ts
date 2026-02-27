import type { Project } from '../types/index.ts';

const projects: Project[] = [
  {
    id: 'project-1',
    slug: 'gig-lab',
    title: 'Gig Lab',
    description:
      'A unified platform for venues to manage their diaries and for promoters to book artists, with an integrated venue directory and complex diary management system.',
    image: '/images/11.webp',
    imageBgHex: '#1D1F2E',
    liveUrl: 'https://www.giglab.co.uk/',
    repoUrl: '',
    tags: ['React', 'Vite', 'Node.js', 'MongoDB', 'Booking Platform', 'SaaS'],
    category: ['Full-Stack', 'Frontend'],
    accentColor: 'cyan',
    accentHex: '#14DEC7',
    accentHexLight: '#0A8C7D',
    featured: true,
    stats: [
      
    ],
    gallery: [
      '/images/giglab/1.png',
      '/images/giglab/3.png',
      '/images/giglab/2.png',
      '/images/giglab/6.png',
      '/images/giglab/5.png',
      '/images/giglab/4.png',
    ],
    techBrief:
      'Custom bespoke React and Vite SPA frontend with a Node.js backend and MongoDB for venue and booking data. Features a unified platform for venue diary management, artist booking, venue directory discovery, and a sophisticated diary/pencil management system.',
    caseStudy: {
      titleGradient: { from: '#F292D2', to: '#14DEC7' },
      overview:
        'Built a custom bespoke booking platform unifying venue diary management and promoter artist booking in one place, with venue discovery and advanced diary/pencil management.',
      challenge:
        'Creating a complex diary management system that handles multiple user roles (venues and promoters), pencil bookings, confirmations, and real-time availability without conflicts.',
      approach:
        'Designed a robust data model in MongoDB to handle diary entries, bookings states and user roles. Implemented optimistic UI updates for instant feedback and server-side reconciliation for conflict resolution.',
      outcome:
        'Delivered a unified platform that venues and promoters actively use to manage bookings, reducing coordination overhead and enabling seamless artist-to-venue discovery and booking flows.',
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
    stats: [],
    gallery: [
      '/images/atlas/1.png',
      '/images/atlas/2.png',
      '/images/atlas/3.png',
      '/images/atlas/4.png',
      '/images/atlas/5.png',
      '/images/atlas/7.png',
    ],
    techBrief:
      'E-commerce healthcare platform selling health testing kits with integrations to Randox APIs for test processing and Cliniko API for clinic management. Supports multiple ordering channels: at-home kits, HQ clinic visits, and nationwide clinic network. Unified workflow for managing complex health biomarkers and test reports.',
    caseStudy: {
      titleGradient: { from: '#F8F3EA', to: '#F8F3EA' },
      overview:
        'Built a healthcare e-commerce platform enabling customers to order health testing kits with flexible fulfillment options and unified clinic management across multiple locations.',
      challenge:
        'Integrating multiple healthcare APIs (Randox and Cliniko) while maintaining a seamless customer experience across at-home and clinic-based testing pathways.',
      approach:
        'Implemented secure API integrations with Randox for test processing and Cliniko for clinic scheduling, unified order management across fulfillment channels, and automated biomarker reporting workflows.',
      outcome:
        'Delivered a cohesive platform enabling customers to select their preferred testing method and receive comprehensive health reports, while clinics manage capacity and patient data efficiently.',
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
    tags: ['Next.js', 'React', 'Leaflet Map', 'MongoDB', 'Framer Motion', 'Geo Search'],
    category: ['Full-Stack', 'Data & Viz'],
    accentColor: 'pink',
    accentHex: '#FBA2C7',
    accentHexLight: '#B02E6E',
    stats: [
      { label: 'Businesses Listed', value: '40+' },
      { label: 'Regions Covered', value: '17' },
      { label: 'Avg Load Time', value: '<2s' },
    ],
    gallery: [
      '/images/floe/1.png',
      '/images/floe/3.png',
      '/images/floe/4.png',
    ],
    techBrief:
      'Next.js and React frontend with Leaflet.js for interactive mapping and Framer Motion for smooth animations. MongoDB stores business listings and geographical data, with geo-search capabilities enabling location-based directory filtering.',
    caseStudy: {
      titleGradient: { from: '#1CE7B1', to: '#FBA2C7' },
      overview:
        'Built an interactive map and business directory connecting North East entrepreneurs and tech companies, enabling discovery and community engagement.',
      challenge:
        'Creating a performant, intuitive map interface that smoothly handles hundreds of business listings with animations and filtering without compromising load times.',
      approach:
        'Implemented Leaflet.js for efficient map rendering, MongoDB for scalable location data storage, Framer Motion for polished UI animations, and client-side geo-filtering for instant search results.',
      outcome:
        'Delivered a vibrant, responsive directory that serves the North East tech ecosystem with smooth interactions and fast performance across devices.',
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
    tags: ['React', 'Vite', 'QR Scanner', 'Azure API', 'PWA'],
    category: ['Full-Stack', 'Frontend'],
    accentColor: 'cyan',
    accentHex: '#EBAA00',
    accentHexLight: '#8B6300',
    stats: [],
    techBrief:
      'React Vite PWA with Strich QR scanner integration for fast, accurate wristband scanning. Connects to a REST API hosted on Azure with JWT auth for secure medical-ID retrieval. Delivers cross-platform support without requiring app store distribution.',
    caseStudy: {
      titleGradient: { from: '#EBAA00', to: '#EBAA00' },
      overview:
        'Built a progressive web app for sports safety that enables instant medical ID access via QR-enabled wristbands, supporting individual and organisational memberships.',
      challenge:
        'Creating a fast, reliable QR scanning experience that works on diverse devices while securely retrieving medical information from cloud APIs.',
      approach:
        'Integrated Strich QR scanner for robust scanning, built a React Vite PWA for instant loading and offline support, and connected to an Azure-hosted REST API with JWTo auth for secure, scalable medical data access.',
      outcome:
        'Deployed a responsive, performant safety platform enabling venues and organisations to quickly access participant medical information during emergencies.',
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
    tags: ['Next.js', 'Multi-Step Form', 'Energy Comparison', 'PostgreSQL', 'Lead Capture'],
    category: ['Full-Stack', 'Frontend'],
    accentColor: 'violet',
    accentHex: '#1E7675',
    accentHexLight: '#155556',
    stats: [
    
    ],
    techBrief:
      'Next.js application with server-side rendering for the multi-step buying journey and quote generation. PostgreSQL backs the customer and quote data, with integrations to energy tariff APIs for real-time pricing. Fully responsive design optimised for SME decision-makers.',
    caseStudy: {
      titleGradient: { from: '#1E7675', to: '#C7EBB6' },
      overview:
        'Built a B2B energy buying platform that guides SME customers through gas and electric procurement, simplifying complex tariff selection and enabling quick, personalised quotes.',
      challenge:
        'Simplifying the complex gas and electric buying process for non-specialist SME customers while handling real-time pricing and multiple supplier options.',
      approach:
        'Designed an intuitive multi-step form with guided inputs, integrated real-time energy tariff APIs, used PostgreSQL for reliable customer and quote data persistence, and leveraged Next.js SSR for fast, SEO-friendly pages.',
      outcome:
        'Delivered a streamlined buying experience that reduces decision time and has generated £2M+ in cumulative annual customer savings; 500+ active business customers trust the platform for energy procurement.',
    },
  },
  {
    id: 'project-6',
    slug: 'sp_ce-real-estate',
    title: 'SP_CE Real Estate',
    description:
      'A design-forward Dubai property consultancy platform with integrated property listings, advanced search, and CRM-driven lead management via WordPress and PropSpace.',
    image: '/images/3.webp',
    liveUrl: 'https://www.spacerealestate.me/',
    repoUrl: '',
    tags: ['Next.js', 'Headless WordPress', 'PropSpace CRM', 'Real Estate', 'Dubai'],
    category: ['Full-Stack', 'Frontend'],
    accentColor: 'pink',
    accentHex: '#DEAFF8',
    accentHexLight: '#7820C8',
    stats: [
    
    ],
    gallery: [
      '/images/sp_ce/2.png',
      '/images/sp_ce/3.png',
      '/images/sp_ce/4.png',
      '/images/sp_ce/5.png',
      '/images/sp_ce/6.png',
    ],
    techBrief:
      'Next.js frontend consumes a Headless WordPress CMS via REST API with ISR for listing freshness, integrated with PropSpace CRM for seamless lead capture and management. Custom property search filters and design-focused UI components deliver a premium, stand-out experience in the Dubai property market.',
    caseStudy: {
      titleGradient: { from: '#DEAFF8', to: '#ADCCFE' },
      overview:
        'Built a premium, design-forward real estate platform for SP_CE that stands out in Dubai\'s competitive property market, integrating content management with CRM-powered lead flows.',
      challenge:
        'Creating a visually distinctive platform that seamlessly bridges content management and sales operations while handling high-volume property listings and lead capture.',
      approach:
        'Connected Next.js with Headless WordPress for flexible content delivery, integrated PropSpace CRM for lead auto-capture, built custom property search and filtering, and designed premium UI components with Dubai market expectations.',
      outcome:
        'Delivered a market-leading platform that combines consultancy positioning with operational efficiency, enabling the team to manage listings and leads cohesively while maintaining design excellence.',
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
    tags: ['Next.js', 'React', 'MongoDB', 'Data Pipeline', 'SaaS', 'B2B Intelligence'],
    category: ['Full-Stack', 'Data & Viz'],
    accentColor: 'cyan',
    accentHex: '#FCB22D',
    accentHexLight: '#9C5E00',
    stats: [

    ],
    techBrief:
      'Next.js and React frontend connected to a MongoDB backend storing company and contact data from LinkedIn and business sources. Background ingestion and enrichment pipelines aggregate sales-relevant signals with server-side caching for sub-second dashboard loads.',
    caseStudy: {
      titleGradient: { from: '#FCB22D', to: '#E6583A' },
      overview:
        'Built the core SalesLynk sales intelligence platform: aggregates company and individual LinkedIn data with business intelligence, enabling sales teams to quickly access actionable prospect briefs.',
      challenge:
        'Aggregating and enriching sales signals from LinkedIn and business data sources while keeping information fresh, accurate and concise for rapid sales team consumption.',
      approach:
        'Implemented background enrichment pipelines consuming business APIs, stored normalised company and contact graphs in MongoDB, built a Next.js dashboard with server-side caching for instant brief retrieval, and optimised UX for rapid reading.',
      outcome:
        'Delivered a sales intelligence platform enabling private enterprise users to access rich company and individual data; reduced prospect research time to under a minute and improved sales team productivity.',
    },
  },
  {
    id: 'project-8',
    slug: 'roleplaying-realm',
    title: 'Roleplaying Realm',
    description:
      'A personal project that uses AI as a game master to let players roleplay in fictitious worlds and franchise-style settings.',
    image: '/images/rr1.png',
    imageBgHex: '#E52F3A',
    liveUrl: 'https://dev.roleplayingrealm.com/',
    repoUrl: '',
    tags: ['AI', 'Game Master', 'Roleplaying', 'LLM'],
    category: ['Full-Stack', 'AI / ML'],
    accentColor: 'pink',
    accentHex: '#E52F3A',
    accentHexLight: '#F87171',
    featured: false,
    stats: [
      { label: 'Playable Worlds', value: '15+' },
      { label: 'Active Sessions', value: '100+' },
      { label: 'Unique Players', value: '45+' },
    ],
    gallery: [
      '/images/rr2.png',
      '/images/rr3.png',
    ],
    techBrief:
      'LLM-orchestrated game master via the OpenAI API, with a React frontend driving session state and lore retrieval via RAG. A custom moderation pipeline enforces IP-aware behaviour and safety constraints across all player inputs.',
    caseStudy: {
      titleGradient: { from: '#E52F3A', to: '#F87171' },
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
    gallery: [
      '/images/nullvoid1.png',
      '/images/nullvoid2.png',
      '/images/nullvoid3.png',
      '/images/nullvoid4.png',
    ],
    techBrief:
      'React and Vite front a custom command parser and stateful session backend. Wrapped in an Electron shell for optional desktop distribution, with puzzles built as isolated, testable modules to allow rapid iteration during playtesting.',
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
    techBrief:
      'Next.js with SSR powers the accessible storefront and recommendation flows. A custom size-mapping engine normalises brand sizing data, while the UI is built to WCAG AA with screen-reader support and reduced-motion defaults throughout.',
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
    techBrief:
      'Electron wraps a React/Vite frontend for a native desktop experience, with a local-first file indexing layer and background thumbnail generation. WebAssembly emulator cores handle sandboxed, performant in-app ROM playback across multiple formats.',
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
    techBrief:
      'Next.js with SSR ensures fast initial load for an SEO-critical public page. The filterable grants catalogue is rendered accessibly with ARIA-compliant controls, and application CTAs integrate cleanly with the Foundation\'s existing grant management infrastructure.',
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
    techBrief:
      'Next.js SSR marketing site paired with a secure member dashboard, using ISR for content pages and role-based access control for course unlocks. Stripe handles subscription billing and webhook-driven membership state updates.',
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
    techBrief:
      'Next.js PWA with server-side availability checks and optimistic UI for instant booking feedback. Multi-tenant organiser admin flows are isolated by role, with background reconciliation handling edge-case conflicts and an offline-capable frontend for poor-signal venues.',
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
