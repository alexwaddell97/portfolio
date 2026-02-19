export interface ProjectStat {
  label: string;
  value: string;
}

export interface CaseStudyContent {
  overview: string;
  challenge: string;
  approach: string;
  outcome: string;
  titleGradient?: {
    from: string;
    to: string;
  };
  imageUrl?: string;
}

export type ProjectCategory = 'Full-Stack' | 'Frontend' | 'AI / ML' | 'Data & Viz' | 'Other';

export type BlogTag = 'Dev' | 'Architecture' | 'Career' | 'Life' | 'AI' | 'Open Source';

export interface BlogPost {
  slug: string;
  title: string;
  date: string;      // ISO date string e.g. "2025-11-14"
  readTime: number;  // minutes
  excerpt: string;
  tags: BlogTag[];
  content: string;   // markdown-style plain text / paragraphs, separated by \n\n
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  imageBgHex?: string;
  accentHex?: string;       // dark mode accent
  accentHexLight?: string;  // light mode accent (darker variant)
  liveUrl: string;
  repoUrl?: string;
  tags: string[];
  category: ProjectCategory | ProjectCategory[];
  accentColor: 'cyan' | 'violet' | 'pink';
  featured?: boolean;
  stats?: ProjectStat[];
  caseStudy?: CaseStudyContent;
}

export interface CVLink {
  label: string;
  href: string;
}

export interface CVExperience {
  role: string;
  company: string;
  location?: string;
  start: string;
  end: string;
  highlights: string[];
  tech?: string[];
}

export interface CVEducation {
  qualification: string;
  institution: string;
  start: string;
  end: string;
  notes?: string[];
}

export interface CVProfile {
  fullName: string;
  title: string;
  location: string;
  email: string;
  website: string;
  summary: string;
  links: CVLink[];
  strengths: string[];
  skills: string[];
  experience: CVExperience[];
  education: CVEducation[];
}
