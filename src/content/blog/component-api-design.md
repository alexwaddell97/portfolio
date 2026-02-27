---
status: hidden
title: Writing Component APIs People Actually Want to Use
slug: component-api-design
date: 2025-05-03
readTime: 6
excerpt: The interface between a component and its consumer is a product decision. Here's how I think about designing it.
tags:
  - Dev
  - Architecture
---
## Components Are APIs

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

The best component APIs are ones where you can delete the component later. This means avoiding tight coupling, avoiding global side effects, and designing props that don't bleed implementation details into the consumer. If removing a component requires surgery across twelve files, the API created incidental coupling. If removing it is a one-line deletion, the API was doing its job.
