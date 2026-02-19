import type { CVProfile } from '../types/index.ts';

export const cvFileName = 'alexander-waddell-cv.pdf';
export const cvFilePath = `/${cvFileName}`;

const cvData: CVProfile = {
  fullName: 'Alexander Waddell',
  title: 'Lead Developer · Architect · Mentor',
  location: 'Newcastle, United Kingdom',
  email: 'alexwaddell97@gmail.com',
  website: 'https://alexw.dev',
  summary:
    'Lead Developer with 6+ years delivering production software for agencies and SMEs. I specialise in JavaScript/TypeScript, React, Next.js, and Node.js, building scalable web apps, CRMs, and high-converting marketing sites from discovery through launch. I also help teams adopt AI tooling and optimise developer workflows to increase delivery velocity and reduce cognitive load.',
  links: [
    { label: '07940327386', href: 'tel:+447940327386' },
    { label: 'Website', href: 'https://alexw.dev' },
    { label: 'GitHub', href: 'https://github.com/alexwaddell97' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/alexander-waddell/' },
  ],
  strengths: [
    'Leading small teams and line management',
    'Mentoring developers and T-Level students',
    'Optimising team processes and developer workflows with AI tooling',
    'Technical planning, code reviews, and delivery leadership',
  ],
  skills: [
    'JavaScript',
    'TypeScript',
    'React',
    'Node.js',
    'Next.js',
    'Tailwind CSS',
    'LLMs & AI tooling',
    'Azure DevOps',
    'AWS',
    'Vercel',
    'Git Workflow',
    'WordPress',
    'Line Management',
    'Code Reviews',
  ],
  experience: [
    {
      role: 'Lead Developer',
      company: 'Layers Studio',
      location: 'Gateshead, United Kingdom',
      start: 'May 2023',
      end: 'Current',
      highlights: [
        'Own technical planning and delivery of complex web applications from scoping to release.',
        'Ship full-stack solutions across multiple concurrent client projects using modern JS/TS stacks.',
        'Lead technical interviews and client discovery sessions to shape clear, feasible project scopes.',
        'Design and run bootcamps and T-Level training focused on practical, project-first development.',
      ],
      tech: ['React', 'TypeScript', 'Next.js', 'Node.js', 'Tailwind CSS'],
    },
    {
      role: 'Senior Software Engineer',
      company: 'Boxmodel',
      location: 'Newcastle, United Kingdom',
      start: 'February 2022',
      end: 'April 2023',
      highlights: [
        'Delivered full-stack features across a broad portfolio of client products and websites.',
        'Supported technical planning for complex builds, balancing scope, quality, and delivery timelines.',
        'Mentored junior developers through implementation, code reviews, and day-to-day engineering support.',
        'Maintained team standards through consistent reviews and practical best-practice guidance.',
        'Line-managed developers and ran annual reviews with actionable development goals.',
      ],
      tech: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Next.js'],
    },
    {
      role: 'Director / Lead Front-end Developer',
      company: 'Coastline Software',
      location: 'Sunderland, United Kingdom',
      start: 'September 2019',
      end: 'February 2022',
      highlights: [
        'Co-led delivery of websites, web applications, and mobile apps for a diverse client base.',
        'Owned front-end architecture and implementation across commercial projects from concept to launch.',
        'Partnered with clients and internal teams to deliver practical, business-focused digital products.',
      ],
      tech: ['JavaScript', 'TypeScript', 'React', 'WordPress'],
    },
  ],
  education: [
    {
      qualification: 'Bachelor of Science in Games Software Development (2:1)',
      institution: 'University of Sunderland, Sunderland',
      start: '2015',
      end: '2019',
    },
    {
      qualification: 'Maths (A Level), Computing (A Level), Physics (AS Level), Creative Media Production (BTEC)',
      institution: 'Durham Sixth Form Centre, Durham',
      start: '2013',
      end: '2015',
    },
  ],
};

export default cvData;
