---
title: 'Building Real Products with LLMs: Patterns That Actually Work'
slug: building-with-llms-in-2025
date: 2025-07-08
readTime: 8
excerpt: After building two production LLM-powered features, here's what I'd tell myself on day one.
tags:
  - Dev
  - AI
---
The LLM hype cycle has matured enough that we can now talk about what actually works in production, as opposed to what looks impressive in a demo.

The biggest shift in my thinking was treating LLM outputs as probabilistic, not deterministic. This sounds obvious but it changes how you architect everything. You need validation layers. You need human review workflows for high-stakes outputs. You need ways to detect when a model has confidently produced garbage.

RAG (retrieval-augmented generation) has become my default starting point for any feature that requires domain-specific knowledge. Fine-tuning is expensive and slow to iterate; RAG lets you update your knowledge base without touching the model. The AI content generator I built uses a vector store of brand voice examples and style guide excerpts — swapping in new examples immediately improves output quality without any model changes.

Prompt engineering is a real discipline and deserves proper engineering practices. Version your prompts. Test them against a fixed evaluation set before deploying changes. Log inputs and outputs so you can debug regressions. The teams I've seen fail with LLMs treat prompts as configuration strings and wonder why quality varies wildly between deployments.

The pattern I've found most reliable for structured output: few-shot examples in the prompt + JSON schema validation on the output + a retry loop with error feedback when validation fails. This gets you deterministic structure with probabilistic content — which is usually what you need.

On cost: OpenAI's pricing feels cheap until you're at scale. Profile your token usage early. Caching identical or near-identical requests with semantic similarity is often worth the engineering effort. One feature I optimised reduced costs by 60% just by caching common variants.
