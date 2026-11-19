---
project: texasjev
locale: en
---
## Connecting AI decisions to verifiable rules

TexasJev integrates Jev decisions into a six-seat play-chip application. The rules engine determines legal actions and settlement; the model proposes a decision through a constrained interface, and the server checks it against the current state. My work covers AI integration, the rules engine, and the real-time application.

## Engineering the model-call lifecycle

Model requests run in a background Worker with timeout, cancellation, and cleanup. Failed requests produce an explicit local fallback action, labelled by its source. The interface records call counts, token usage, and estimated cost so model activity can be inspected.

## State and boundaries in multiplayer interaction

The project includes a six-seat play-chip table and a manual recording and replay tool. WebSockets synchronise public state while each player receives only their own private view. Reconnection, duplicate commands, and server persistence are part of state management.

## Testing and current progress

The public repository preserves rules, network, and protocol tests, plus a real model-call smoke record. These check legal actions, state consistency, and fallback behaviour. They validate the software path; strategy quality and sustained play across physical devices still require further evaluation.
