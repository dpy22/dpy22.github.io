---
project: wind-wake
locale: en
---
## Physical priors and convolutional surrogates

Wind-turbine wakes involve complex flow, and full CFD calculations carry a computational cost. Using an existing wake-field dataset, the project explored neural surrogate prediction as a more convenient way to work with the problem.

I participated in building a convolutional surrogate coupled with a physical analytical model. The physical prior provides structure, while learning attempts to capture variation that is harder to describe directly.

## PyTorch training and evaluation

The work used PyTorch and explored pretraining, fine-tuning, and self-supervised learning. Prediction quality was considered alongside computational cost, rather than judging a model from a single visualisation.

My contribution focused on the physical analytical model, convolutional network, and training strategies within one prediction task, using CFD data to understand model inputs, prediction targets, and applicability.

## Research outcome

The research stage ran from September 2024 to August 2025. The project received Third Prize in the 18th National University Energy Conservation & Emission Reduction Competition. The streamlines on this page are conceptual illustrations, not model output.
