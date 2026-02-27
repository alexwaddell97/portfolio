---
status: hidden
title: Why I Stopped Over-Engineering Everything
slug: why-i-stopped-over-engineering
date: 2025-11-14
readTime: 6
excerpt: Three years ago I would have built a distributed cache for a feature used by 12 people. Here's what changed.
tags:
  - Dev
  - Architecture
  - Career
---
There's a particular kind of developer hubris that comes with knowing too much. You've read the papers, you've seen the war stories, and you know exactly how Netflix solved their problems at scale. So naturally, when you're tasked with building an internal tool for the marketing team, you reach for Kafka.

I've been that developer. I still sometimes catch myself opening a browser tab to check if I should introduce a message queue into a system that processes 40 requests a day.

The turning point was a code review where a senior colleague circled a 200-line abstraction I'd built and wrote: "This is clever. Why does it exist?" I couldn't answer without invoking hypothetical future requirements. That stung.

What I've learned since is that complexity is debt you pay every single day — in onboarding time, debugging sessions, and the cognitive overhead of every person who reads your code. Simple code that works today is almost always better than flexible code that's ready for a problem you haven't had yet.

The heuristic I use now: if the requirement doesn't exist in a ticket, don't build for it. If you find yourself writing "this will be useful when..." in a comment, stop. Your future self will thank you for the straightforward solution.

This doesn't mean write bad code. It means write code that's obviously correct, obviously scoped, and obviously deletable. The best code I've ever shipped was code that was later deleted because the requirements changed — and deleting it took 20 minutes instead of two weeks.
