---
project: wind-wake
locale: en
---
## Finding a connection between physics and data

Wind-turbine wakes involve complex flow, and full CFD calculations carry a computational cost. Using an existing wake-field dataset, the project explored neural surrogate prediction as a more convenient way to work with the problem.

I participated in building a convolutional surrogate coupled with a physical analytical model. The physical prior provides structure, while learning attempts to capture variation that is harder to describe directly.

## From training strategies to comparison

The work used PyTorch and explored pretraining, fine-tuning, and self-supervised learning. Prediction quality was considered alongside computational cost, rather than judging a model from a single visualisation.

This experience made scientific machine learning more concrete for me: the architecture and training strategy have to be discussed together with the engineering object.

## Research outcome

The research stage ran from September 2024 to August 2025. The project received Third Prize in the 18th National University Energy Conservation & Emission Reduction Competition. The streamlines on this page are conceptual illustrations, not model output.
