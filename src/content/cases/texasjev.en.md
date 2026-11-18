---
project: texasjev
locale: en
---
## Deterministic rules, uncertain decisions

Game rules need to be explicit and repeatable, while AI decisions may fail or produce invalid output. TexasJev separates these concerns: the rules engine determines legal actions and settlement, and a constrained interface accepts model decisions.

## State and boundaries in multiplayer interaction

The project includes a six-seat play-chip table and a manual recording and replay tool. WebSockets synchronise public state while each player receives only their own private view. Reconnection, duplicate commands, and server persistence are part of state management.

## Keeping experimental status honest

The repository preserves rules, network, and protocol test records. Jev is not an optimal-strategy solver, and sustained play across physical devices still needs acceptance testing. This portfolio describes the software without embedding the table or triggering model calls.
