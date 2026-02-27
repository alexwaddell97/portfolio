---
status: hidden
title: 'Event Sourcing in Practice: What Nobody Warns You About'
slug: event-sourcing-in-practice
date: 2025-10-02
readTime: 9
excerpt: Event sourcing is elegant in theory. In production it comes with sharp edges most articles don't cover.
tags:
  - Dev
  - Architecture
---
Event sourcing is one of those patterns that looks beautiful in a conference talk. Immutable audit log, time-travel debugging, replay any state from history — it sounds like it solves everything. And it can, but the production reality is considerably more complex.

The first thing that bites you is schema evolution. Your events are immutable, but your understanding of what they mean isn't. When you rename a field three months in, you now have two interpretations of the same event type in your log. You need upcasters — functions that transform old events to new schemas on read. Build this infrastructure early, before you have 10 million events.

The second issue is read model complexity. You're essentially trading write simplicity for read complexity. Your projections can fall behind under load, which means your read models are temporarily stale. Most tutorials gloss over the operational overhead of keeping projections fresh, monitoring lag, and handling replays safely.

Snapshots are essential but add their own complexity. Once your aggregate history grows beyond a few hundred events, rebuilding state on every command becomes prohibitively slow. You'll need a snapshot strategy — and then a strategy for invalidating snapshots when your projection logic changes.

That said, the pattern genuinely shines for audit-heavy domains. My e-commerce inventory system runs on it, and being able to replay exactly what happened during a flash sale incident has saved hours of debugging time on multiple occasions.

The rule I've settled on: reach for event sourcing when you need an immutable audit log as a first-class requirement, not as a side effect of another pattern. If auditing is an afterthought, a simpler append-only log table gives you 80% of the benefit for 20% of the complexity.
