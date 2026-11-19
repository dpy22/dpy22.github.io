---
project: liquid-cooling-benchmark
locale: en
---
## Defining the model boundary first

As computing workloads change, so does the heat that servers need to dissipate. This project models liquid cooling for AI data centres, from cold plates and racks to CDUs and the cooling plant. Models are organised hierarchically, giving each component a physical meaning, an interface, and parameter provenance before connecting it to a larger system.

Conservation of mass, momentum, and energy constrains the model. Component checks and system-response checks help reveal problems in connections and assumptions; simplified models retain explicit validity boundaries.

## A consistent interface for control experiments

Modelica describes the plant, while FMUs connect it to Python experiment tools. Controllers, scenario definitions, and post-processing are separated from the physical model so that methods can be compared under consistent conditions.

The workflow includes baseline controllers, scenario matrices, result summaries, and figures. Multi-rack and manifold extensions make flow distribution and hydraulic coupling explicit research questions.

## What reproducibility involves

A reproducible experiment preserves the model version, parameter sources, scenario, and execution method together. Completed checks and outstanding realism validation are recorded separately. This remains an active research project; publication plans are not presented as published results.
