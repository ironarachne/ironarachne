# Crafting System

This design document explores the overall design and structure of the Iron Arachne crafting system.

## Overview

The purpose of the crafting system is to handle complex bespoke items built from a wide variety of possible components. It allows users to generate interesting and unique items in a way that is consistent with the environment, materials, facilities, and crafting skill available.

## Consumers

The crafting system is meant to be used by self-contained generators as well as the upcoming text adventure game.

## Inspiration

The primary inspiration for this crafting system is Star Wars: Galaxies.

## Mechanics

All items share a general structure (the `Item` type). Beyond that, items usually have a more narrow type that is a type union with the `Item` type.

There are 5 things involved in crafting an item:

- crafting blueprint
- component resources
- optional crafting tool
- optional crafting facility
- the crafter's crafting skill

The crafting blueprint determines what resources, tools, facilities, and skills are required to make an item. The most basic blueprint will usually only require a single resource and nothing else.

Resources have statistics. These determine the range of possible statistics the finished item can have.

Crafting tools may be required, or they may be optional. Either way, if an appropriate crafting tool is involved in an item's creation, it boosts the success chance of crafting. Crafting tools have both a quality rating (0.0-1.0) and a tier (1-5). Quality rating is what affects success chance. Blueprints sometimes require a specific minimum tier of tool.

Crafting facilities may be required, or they may be optional. Facilities have statistics that affect the statistics of finished items.

All blueprints have two categories: a major category and a minor category. If a character has a skill specialization that matches the minor category, then they get a higher boost to the success chance and quality cap for the finished item than if they only have the general crafting skill appropriate for the major category. If the crafting skill is optional for the blueprint, but the character doesn't have either the appropriate general crafting skill or the skill specialization, they can still craft the item but have a success penalty and a low quality cap.

### Gathering

The extraction of raw resources from sources (called "resource nodes") is called gathering. A resource node can be anything from a copper outcropping to a gas fissure to an animal corpse.

Every time raw resources are gathered from a node, there's a chance for the node to disappear permanently. The chance increases with every gathering attempt for that node. The amount of raw resources recovered is determined by the tier of the gathering tool used, and the rate at which the chance to destroy the node increases is determined by the quality of the gathering tool.

A character might have a gathering skill appropriate to the resource node they're gathering from. Each level of this skill increases the chance that a gathering attempt will successfully retrieve raw resources. Resource nodes have a minimum gathering skill required. For some, this minimum is 0, making it possible to gather without the skill.

#### Gathering Progression

If a character's gathering skill is between the minimum gathering skill for the resource node and the proficiency skill cap for the resource node, they will gain 1 level in that gathering skill for each gathering attempt, whether successful or not. Once they are past the proficiency skill cap, they only have a 1% chance to increase their gathering skill from each gathering attempt.

#### Gathering Tools

Most resource nodes require a tool to gather them, but not all. A gathering tool's quality increases the amount of raw resources retrieved from a resource node in each successful attempt.

Some types of gathering require two tools: one for the extraction, and one for storage. The storage tool's quality affects the maximum quantity that can be stored in the storage tool. All storage tools are a union type of the `Container` type.

#### Gathering Skills

These are the gathering skills:

- Mining
- Skinning
- Herbology
- Fishing
- Butchering
- Gas Extraction
- Woodcutting

Resource nodes are always associated with at least one of these skills. The type of raw resources extracted depends on the skill used.

## Genres

The crafting system is meant to apply to any genre of setting, from stone age to far future.

## Crafting Skills

The following are the general crafting skills:

- Blacksmithing
- Electronics
- Mechanics
- Tailoring
- Chemistry
- Leatherworking
- Cooking
- Jewelcrafting
- Woodworking
- Construction
- Enchanting
- Scribing

## Refining Skills

The following skills are used exclusively for turning raw resources into refined versions.

- Smelting
- Distilling
- Fermenting
- Tanning
- Milling
- Gemcutting

Some crafting skills, like Woodworking, handle both refining and other crafting.

## Skill Specializations

Rather than being a separate list of skills, a specialization is a general skill with an item type attached to it.

For example, a character might have a skill specialization of "Blacksmithing: Bladesmithing", and an example of an applicable blueprint might be a Broadsword Blueprint, with major category Blacksmithing and minor category Bladesmithing.

## Blueprints

A blueprint's list of components will be an array of `Component` objects, which specify whether the component is required or optional, what statistic of the finished item it affects, what statistic of the component item it uses, the quantity of the component item required, and either an item major type, an item minor type, or a specific item name.

For example, a blueprint for a longsword might have a "hilt decoration" optional component with the "HiltDecoration" major type.
