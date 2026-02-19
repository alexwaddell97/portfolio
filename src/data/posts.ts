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
  {
    slug: 'typescript-patterns-worth-the-boilerplate',
    title: 'TypeScript Patterns Worth the Boilerplate',
    date: '2025-06-10',
    readTime: 7,
    excerpt:
      "Most TypeScript advice optimises for type safety at the expense of readability. Here are the patterns I've kept after ruthlessly cutting the rest.",
    tags: ['Dev'],
    content: `## Start With the Boundary, Not the Centre

The most productive mindset shift I've had with TypeScript: stop writing types for everything inside a module, and focus on the boundary. The types that matter are the ones that cross function or module boundaries — API responses, component props, function parameters.

Internal implementation types often don't need to be explicit at all. TypeScript's inference is good enough that annotating every intermediate variable is just noise.

## Discriminated Unions Replace Flags

Before I learned discriminated unions, I'd reach for boolean flags. A component would take an isLoading, isError, and data prop, and I'd have to mentally track which combinations were valid. The TypeScript compiler couldn't help because all the combinations were technically legal.

Discriminated unions make invalid states unrepresentable. Instead of three boolean flags, you have a single status field that narrows the available data. Add a new union member and the compiler tells you every switch that needs updating — which makes refactors dramatically safer.

## const Assertions for Literal Types

When you need a value to be used as a literal type rather than just string or number, const assertions are the cleanest solution. I reach for this often with configuration objects and lookup maps where I want the values to remain narrow.

The most practical application I've found: action type constants in a reducer. Without as const, TypeScript widens the type to string, which defeats the purpose of a discriminated union on action.type.

## Template Literal Types for Constrained Strings

This one felt like a party trick when I first saw it, but I now use it regularly for anything involving structured string keys — CSS variable names, route paths, event names. You get autocomplete and type checking on strings that follow a pattern.

The main gotcha: these can slow down the type checker at scale. I don't use them for very large union expansions.

## When to Stop

The trap I see most often is types that describe types rather than domain concepts. If you find yourself writing utility types to manipulate other utility types, step back and ask whether the abstraction is serving the code or satisfying a completeness instinct. Good TypeScript typing is mostly invisible. If a type is the most interesting thing in a file, something has gone wrong.`,
  },
  {
    slug: 'component-api-design',
    title: 'Writing Component APIs People Actually Want to Use',
    date: '2025-05-03',
    readTime: 6,
    excerpt:
      "The interface between a component and its consumer is a product decision. Here's how I think about designing it.",
    tags: ['Dev', 'Architecture'],
    content: `## Components Are APIs

Every component you write is an API. It has a contract: these are the inputs I accept, this is the output I produce, these are the side effects I have. The quality of that API determines how easy it is to use, extend, and eventually delete.

Most component API problems fall into one of two failure modes: too rigid (accepts exactly the shape it was built for, breaks the moment requirements drift) or too flexible (accepts anything, communicates nothing, provides no guidance on correct usage).

## Composition Over Configuration

The classic failure mode of a rigid API: a mega-component with twenty props controlling internal behaviour. Twelve booleans and six optional callbacks. The author had good intentions — they wanted to support every use case — but the result is a component that's harder to understand than writing the feature yourself.

The alternative is composition: smaller components with clear responsibilities that the consumer assembles. A Card with a CardHeader, CardBody, and CardFooter is more useful than a Card with headerContent, footerContent, and showFooter props. The consumer sees the structure in the JSX.

## Sensible Defaults, Explicit Overrides

Good APIs do the right thing by default and get out of the way. A Button that defaults to type="button" prevents the classic form-submission bug. A dialog that traps focus by default prevents the classic accessibility bug.

When overrides are needed, make them explicit rather than inferred. Don't try to guess intent from combinations of props — give the consumer a clear escape hatch.

## The Rule of Least Surprise

I test component APIs with a simple question: if someone who hadn't written this component tried to use it cold, what would they expect to happen? The closer the actual behaviour is to that expectation, the better the API.

This is why I'm conservative about clever prop patterns. Render props, compound components, and control inversion all have their place, but they're non-obvious to newcomers. Default to the simplest pattern that solves the problem.

## Deletion Is a Feature

The best component APIs are ones where you can delete the component later. This means avoiding tight coupling, avoiding global side effects, and designing props that don't bleed implementation details into the consumer. If removing a component requires surgery across twelve files, the API created incidental coupling. If removing it is a one-line deletion, the API was doing its job.`,
  },
];

export default posts;
