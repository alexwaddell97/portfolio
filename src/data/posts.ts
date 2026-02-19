import type { BlogPost } from '../types/index.ts';

const posts: BlogPost[] = [
  {
    slug: 'why-i-stopped-over-engineering',
    title: 'Why I Stopped Over-Engineering Everything',
    date: '2025-11-14',
    readTime: 6,
    excerpt:
      'Three years ago I would have built a distributed cache for a feature used by 12 people. Here\'s what changed.',
    tags: ['Dev', 'Architecture', 'Career'],
    content: `There's a particular kind of developer hubris that comes with knowing too much. You've read the papers, you've seen the war stories, and you know exactly how Netflix solved their problems at scale. So naturally, when you're tasked with building an internal tool for the marketing team, you reach for Kafka.

I've been that developer. I still sometimes catch myself opening a browser tab to check if I should introduce a message queue into a system that processes 40 requests a day.

The turning point was a code review where a senior colleague circled a 200-line abstraction I'd built and wrote: "This is clever. Why does it exist?" I couldn't answer without invoking hypothetical future requirements. That stung.

What I've learned since is that complexity is debt you pay every single day — in onboarding time, debugging sessions, and the cognitive overhead of every person who reads your code. Simple code that works today is almost always better than flexible code that's ready for a problem you haven't had yet.

The heuristic I use now: if the requirement doesn't exist in a ticket, don't build for it. If you find yourself writing "this will be useful when..." in a comment, stop. Your future self will thank you for the straightforward solution.

This doesn't mean write bad code. It means write code that's obviously correct, obviously scoped, and obviously deletable. The best code I've ever shipped was code that was later deleted because the requirements changed — and deleting it took 20 minutes instead of two weeks.`,
  },
  {
    slug: 'event-sourcing-in-practice',
    title: 'Event Sourcing in Practice: What Nobody Warns You About',
    date: '2025-10-02',
    readTime: 9,
    excerpt:
      'Event sourcing is elegant in theory. In production it comes with sharp edges most articles don\'t cover.',
    tags: ['Dev', 'Architecture'],
    content: `Event sourcing is one of those patterns that looks beautiful in a conference talk. Immutable audit log, time-travel debugging, replay any state from history — it sounds like it solves everything. And it can, but the production reality is considerably more complex.

The first thing that bites you is schema evolution. Your events are immutable, but your understanding of what they mean isn't. When you rename a field three months in, you now have two interpretations of the same event type in your log. You need upcasters — functions that transform old events to new schemas on read. Build this infrastructure early, before you have 10 million events.

The second issue is read model complexity. You're essentially trading write simplicity for read complexity. Your projections can fall behind under load, which means your read models are temporarily stale. Most tutorials gloss over the operational overhead of keeping projections fresh, monitoring lag, and handling replays safely.

Snapshots are essential but add their own complexity. Once your aggregate history grows beyond a few hundred events, rebuilding state on every command becomes prohibitively slow. You'll need a snapshot strategy — and then a strategy for invalidating snapshots when your projection logic changes.

That said, the pattern genuinely shines for audit-heavy domains. My e-commerce inventory system runs on it, and being able to replay exactly what happened during a flash sale incident has saved hours of debugging time on multiple occasions.

The rule I've settled on: reach for event sourcing when you need an immutable audit log as a first-class requirement, not as a side effect of another pattern. If auditing is an afterthought, a simpler append-only log table gives you 80% of the benefit for 20% of the complexity.`,
  },
  {
    slug: 'working-remotely-for-five-years',
    title: 'Five Years of Remote Work: The Honest Version',
    date: '2025-08-19',
    readTime: 5,
    excerpt:
      'Remote work is great. It\'s also genuinely hard. Both things are true and most content only covers one of them.',
    tags: ['Life', 'Career'],
    content: `I've been fully remote since 2020, and like most people who went remote during the pandemic, I've had time to form actual opinions rather than just novelty reactions.

The honest version: it's the best working arrangement I've had, and there are days where I genuinely struggle with it.

The good is well-documented. No commute. Flexibility to structure your day around your energy levels. The ability to do deep work without a constant stream of interruptions. I write better code at home than I ever did in an open-plan office.

What's less discussed is the social infrastructure you lose. In an office, you pick up context passively — overhearing conversations, noticing when a colleague looks stressed before a deadline, the informal check-ins by the coffee machine. Remote work demands you rebuild all of that infrastructure deliberately. If you don't, you end up isolated in a way that sneaks up on you.

The practices that have helped me most: a daily 15-minute sync with my closest collaborator (not a standup — an actual conversation), being aggressive about over-communicating in writing, and treating my local coffee shop as a genuine office two days a week.

The other thing nobody warns you about is how your relationship with work changes when it lives in the same building as you. The commute, as annoying as it is, creates a transition ritual. Without it, work expands to fill whatever space you give it. You have to build your own rituals: a specific chair, a specific playlist, a deliberate close-of-day action that signals the end of the working day to your brain.

Five years in, I'd find it very difficult to go back. But I've also stopped pretending it's universally perfect.`,
  },
  {
    slug: 'building-with-llms-in-2025',
    title: 'Building Real Products with LLMs: Patterns That Actually Work',
    date: '2025-07-08',
    readTime: 8,
    excerpt:
      'After building two production LLM-powered features, here\'s what I\'d tell myself on day one.',
    tags: ['Dev', 'AI'],
    content: `The LLM hype cycle has matured enough that we can now talk about what actually works in production, as opposed to what looks impressive in a demo.

The biggest shift in my thinking was treating LLM outputs as probabilistic, not deterministic. This sounds obvious but it changes how you architect everything. You need validation layers. You need human review workflows for high-stakes outputs. You need ways to detect when a model has confidently produced garbage.

RAG (retrieval-augmented generation) has become my default starting point for any feature that requires domain-specific knowledge. Fine-tuning is expensive and slow to iterate; RAG lets you update your knowledge base without touching the model. The AI content generator I built uses a vector store of brand voice examples and style guide excerpts — swapping in new examples immediately improves output quality without any model changes.

Prompt engineering is a real discipline and deserves proper engineering practices. Version your prompts. Test them against a fixed evaluation set before deploying changes. Log inputs and outputs so you can debug regressions. The teams I've seen fail with LLMs treat prompts as configuration strings and wonder why quality varies wildly between deployments.

The pattern I've found most reliable for structured output: few-shot examples in the prompt + JSON schema validation on the output + a retry loop with error feedback when validation fails. This gets you deterministic structure with probabilistic content — which is usually what you need.

On cost: OpenAI's pricing feels cheap until you're at scale. Profile your token usage early. Caching identical or near-identical requests with semantic similarity is often worth the engineering effort. One feature I optimised reduced costs by 60% just by caching common variants.`,
  },
];

export default posts;
