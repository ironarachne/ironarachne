export type ReligionCategory = {
  name: string;
  description: string;
  hasDeities: boolean;
  hasLeader: boolean;
  minDeities: number;
  maxDeities: number;
};

export const monotheism = {
  name: "monotheism",
  description: "This religion has a single all-powerful god.",
  hasDeities: true,
  hasLeader: false,
  minDeities: 1,
  maxDeities: 1,
};

export const polytheism = {
  name: "polytheism",
  description: "This religion has multiple deities.",
  hasDeities: true,
  hasLeader: false,
  minDeities: 2,
  maxDeities: 20,
};

export const animism = {
  name: "animism",
  description:
    "This religion believes that spirits inhabit natural objects and phenomena.",
  hasDeities: false,
  hasLeader: false,
  minDeities: 0,
  maxDeities: 0,
};

export const totemism = {
  name: "totemism",
  description:
    "This religion reveres a particular animal or natural object as a spiritual emblem.",
  hasDeities: false,
  hasLeader: false,
  minDeities: 0,
  maxDeities: 0,
};

export const ancestorWorship = {
  name: "ancestor worship",
  description:
    "This religion involves rituals and practices to honor deceased ancestors.",
  hasDeities: false,
  hasLeader: false,
  minDeities: 0,
  maxDeities: 0,
};

export const shamanism = {
  name: "shamanism",
  description:
    "This religion centers around shamans who interact with the spirit world.",
  hasDeities: false,
  hasLeader: true,
  minDeities: 0,
  maxDeities: 0,
};

export function all(): ReligionCategory[] {
  return [
    monotheism,
    polytheism,
    animism,
    totemism,
    ancestorWorship,
    shamanism,
  ];
}

export function byName(
  name: string,
  categories: ReligionCategory[],
): ReligionCategory {
  for (let i = 0; i < categories.length; i++) {
    if (categories[i].name === name) {
      return categories[i];
    }
  }

  throw new Error(`No religion category found with name ${name}.`);
}
