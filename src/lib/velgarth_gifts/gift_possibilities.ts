import type GiftPossibility from "./gift_possibility";

export function all(): GiftPossibility[] {
  return [
    {
      name: "Bardic",
      description:
        "You have the ability to draw your audience into your music and make them experience images and emotions tied to it.",
      commonality: 5,
      strength_levels: [
        {
          description:
            "Your Bardic gift is weak, and you can only affect a few people at a time. The effect is subtle.",
          strength: 1,
          commonality: 5,
        },
        {
          description:
            "Your Bardic gift is average, and you can affect a small group of people at a time. The effect is subtle.",
          strength: 2,
          commonality: 6,
        },
        {
          description:
            "Your Bardic gift is stronger, and you can affect a large group of people at a time. However, the effect is subtle.",
          strength: 3,
          commonality: 3,
        },
        {
          description:
            "Your Bardic gift is potent, and while you can only affect a handful of people, the effect is intense.",
          strength: 4,
          commonality: 2,
        },
        {
          description:
            "Your Bardic gift is powerful, and you can affect a large group of people at a time. The effect is intense.",
          strength: 5,
          commonality: 1,
        },
      ],
    },
    {
      name: "Earth-sense",
      description:
        "You can sense the health and status of the earth around you.",
      commonality: 5,
      strength_levels: [
        {
          description:
            "Your Earth-sense is weak, and you can only sense the earth around you.",
          strength: 1,
          commonality: 5,
        },
        {
          description:
            "Your Earth-sense is average. You can sense the earth around you and a little beyond.",
          strength: 2,
          commonality: 6,
        },
        {
          description:
            "Your Earth-sense is average. You can only sense the earth for a few miles around you, but it is very clear.",
          strength: 3,
          commonality: 3,
        },
        {
          description:
            "Your Earth-sense is potent. You can sense the earth for several miles around you.",
          strength: 4,
          commonality: 2,
        },
        {
          description:
            "Your Earth-sense is powerful. You can sense the earth for many miles around you. The feeling is deep and clear.",
          strength: 5,
          commonality: 1,
        },
      ],
    },
    {
      name: "Empathy",
      description:
        "You can sense the emotions of others, and can sometimes influence them.",
      commonality: 5,
      strength_levels: [
        {
          description:
            "Your Empathy is weak, and you can only sense the emotions of a handful of people close at hand.",
          strength: 1,
          commonality: 5,
        },
        {
          description:
            "Your Empathy is weak, and you can only sense the emotions of a handful of animals close at hand.",
          strength: 1,
          commonality: 5,
        },
        {
          description:
            "Your Empathy is average, and you can sense the emotions of a handful of people or animals close at hand.",
          strength: 2,
          commonality: 6,
        },
        {
          description:
            "Your Empathy is average, and you can sense the emotions of nearby people well.",
          strength: 2,
          commonality: 6,
        },
        {
          description:
            "Your Empathy is average, and you can sense the emotions of nearby animals well.",
          strength: 2,
          commonality: 6,
        },
        {
          description:
            "Your Empathy is strong, and you can sense the emotions of people for quite a distance. You have some subtle influence over them also.",
          strength: 3,
          commonality: 3,
        },
        {
          description:
            "Your Empathy is strong, and you can sense the emotions of animals for quite a distance. You have some subtle influence over them also.",
          strength: 3,
          commonality: 3,
        },
        {
          description:
            "Your Empathy is potent, and you can sense the emotions of people for a great distance. You have some influence over them.",
          strength: 4,
          commonality: 2,
        },
        {
          description:
            "Your Empathy is potent, and you can sense the emotions of animals for a great distance. You have some influence over them.",
          strength: 4,
          commonality: 2,
        },
        {
          description:
            "Your Empathy is powerful, and you can sense the emotions of people for a great distance. You have strong influence over them.",
          strength: 5,
          commonality: 1,
        },
        {
          description:
            "Your Empathy is powerful, and you can sense the emotions of animals for a great distance. You have strong influence over them.",
          strength: 5,
          commonality: 1,
        },
      ],
    },
    {
      name: "Fetching",
      description: "You can teleport things from place to place.",
      commonality: 5,
      strength_levels: [
        {
          description:
            "Your Fetching is weak, and you can only Fetch small objects that you're familiar with a short distance.",
          strength: 1,
          commonality: 5,
        },
        {
          description:
            "Your Fetching is weak, and you can only Fetch small objects over a moderate distance.",
          strength: 2,
          commonality: 6,
        },
        {
          description:
            "Your Fetching is average, and you can Fetch up to dog-sized objects over a moderate distance.",
          strength: 3,
          commonality: 3,
        },
        {
          description:
            "Your Fetching is potent, and you can Fetch up to cow-sized objects over a great distance.",
          strength: 4,
          commonality: 2,
        },
        {
          description:
            "Your Fetching is powerful, and you can Fetch up to horse-sized objects or even living things over a great distance.",
          strength: 5,
          commonality: 1,
        },
      ],
    },
    {
      name: "Firestarting",
      description: "You can start fires with your mind.",
      commonality: 1,
      strength_levels: [
        {
          description: "You can conjure sparks and candleflames.",
          strength: 1,
          commonality: 10,
        },
        {
          description: "You can summon torch-sized flames near at hand.",
          strength: 2,
          commonality: 15,
        },
        {
          description: "You can conjure bonfires and campfires nearby.",
          strength: 3,
          commonality: 3,
        },
        {
          description: "You can create torch-sized flames at a distance.",
          strength: 3,
          commonality: 3,
        },
        {
          description: "You can summon bonfires up to a mile away.",
          strength: 4,
          commonality: 2,
        },
        {
          description: "You can create house-sized conflagrations nearby.",
          strength: 5,
          commonality: 1,
        },
        {
          description:
            "You can summon infernos the size of a village up to a mile away.",
          strength: 6,
          commonality: 1,
        },
        {
          description: "You can cause entire valleys to erupt in flames.",
          strength: 7,
          commonality: 1,
        },
      ],
    },
    {
      name: "Farsight",
      description: "You can send your senses to a distant place.",
      commonality: 5,
      strength_levels: [
        {
          description:
            "You have a vague sense of what's happening in the next room.",
          strength: 1,
          commonality: 5,
        },
        {
          description: "You can see what's happening in the next room.",
          strength: 2,
          commonality: 6,
        },
        {
          description:
            "You have a vague sense of what's happening up to a mile away.",
          strength: 2,
          commonality: 6,
        },
        {
          description:
            "You can see what's happening in a particular area up to a mile away.",
          strength: 3,
          commonality: 3,
        },
        {
          description:
            "You can see what's happening in a particular area many miles away.",
          strength: 4,
          commonality: 2,
        },
        {
          description:
            "You can see what's happening in a particular area up to a hundred miles away.",
          strength: 5,
          commonality: 1,
        },
      ],
    },
    {
      name: "Foresight",
      description: "You can see the future.",
      commonality: 5,
      strength_levels: [
        {
          description: "You get vague hunches about what's about to happen.",
          strength: 1,
          commonality: 8,
        },
        {
          description:
            "You get accurate hunches about general events in the near future.",
          strength: 2,
          commonality: 10,
        },
        {
          description:
            "You get accurate hunches about specific events in the near future.",
          strength: 3,
          commonality: 3,
        },
        {
          description:
            "You can clearly envision specific events in the near future.",
          strength: 4,
          commonality: 2,
        },
        {
          description:
            "You get accurate hunches about specific events in the distant future.",
          strength: 5,
          commonality: 1,
        },
        {
          description:
            "You can clearly envision specific events in the distant future.",
          strength: 6,
          commonality: 1,
        },
      ],
    },
    {
      name: "Healing",
      description: "You can heal the wounds of others with your mind.",
      commonality: 5,
      strength_levels: [
        {
          description:
            "You can Heal minor wounds, though the effort is taxing.",
          strength: 1,
          commonality: 5,
        },
        {
          description:
            "You can Heal moderate wounds, or several minor wounds, before needing to rest.",
          strength: 2,
          commonality: 6,
        },
        {
          description:
            "You can ease the pain of severe wounds and Heal moderate wounds.",
          strength: 3,
          commonality: 3,
        },
        {
          description:
            "You can Heal severe wounds and Heal for hours without rest.",
          strength: 4,
          commonality: 2,
        },
        {
          description:
            "You can Heal otherwise mortal wounds, though the effort costs you greatly.",
          strength: 5,
          commonality: 1,
        },
      ],
    },
    {
      name: "Mage-Gift",
      description: "You can use true magic.",
      commonality: 1,
      strength_levels: [
        {
          description: "You have little more than hedge-wizard potential.",
          strength: 1,
          commonality: 10,
        },
        {
          description: "You have Journeyman potential.",
          strength: 2,
          commonality: 15,
        },
        {
          description: "You have Master potential.",
          strength: 3,
          commonality: 6,
        },
        {
          description: "You have Adept potential.",
          strength: 4,
          commonality: 1,
        },
      ],
    },
    {
      name: "Mindspeech",
      description: "You can speak mind-to-mind.",
      commonality: 5,
      strength_levels: [
        {
          description:
            "You can sense the surface thoughts of others close by and speak to a specific person.",
          strength: 1,
          commonality: 5,
        },
        {
          description: "You can speak to multiple people close by.",
          strength: 2,
          commonality: 6,
        },
        {
          description: "You can speak to multiple people or animals close by.",
          strength: 3,
          commonality: 3,
        },
        {
          description: "You can speak to multiple people several miles away.",
          strength: 4,
          commonality: 2,
        },
        {
          description:
            "You can speak to multiple people several miles away, and you can intrude on their deeper thoughts, if you are so inclined.",
          strength: 5,
          commonality: 1,
        },
      ],
    },
  ];
}
