---
status: hidden
title: TypeScript Patterns Worth the Boilerplate
slug: typescript-patterns-worth-the-boilerplate
date: 2025-06-10
readTime: 7
excerpt: Most TypeScript advice optimises for type safety at the expense of readability. Here are the patterns I've kept after ruthlessly cutting the rest.
tags:
  - Dev
---
## Start With the Boundary, Not the Centre

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

The trap I see most often is types that describe types rather than domain concepts. If you find yourself writing utility types to manipulate other utility types, step back and ask whether the abstraction is serving the code or satisfying a completeness instinct. Good TypeScript typing is mostly invisible. If a type is the most interesting thing in a file, something has gone wrong.
