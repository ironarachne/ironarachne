import type PersonalityTrait from "./personality_trait";

export function all(): PersonalityTrait[] {
  return [
    {
      name: "aggressiveness",
      score: 0,
      descriptor: "",
      negativeDescriptor: "passive",
      positiveDescriptor: "belligerent",
    },
    { name: "altruism", score: 0, descriptor: "", negativeDescriptor: "selfish", positiveDescriptor: "selfless" },
    { name: "bravery", score: 0, descriptor: "", negativeDescriptor: "cowardly", positiveDescriptor: "brave" },
    {
      name: "competitiveness",
      score: 0,
      descriptor: "",
      negativeDescriptor: "cooperative",
      positiveDescriptor: "competitive",
    },
    { name: "confidence", score: 0, descriptor: "", negativeDescriptor: "uncertain", positiveDescriptor: "confident" },
    {
      name: "creativity",
      score: 0,
      descriptor: "",
      negativeDescriptor: "unimaginative",
      positiveDescriptor: "creative",
    },
    { name: "eloquence", score: 0, descriptor: "", negativeDescriptor: "plain-spoken", positiveDescriptor: "eloquent" },
    { name: "friendliness", score: 0, descriptor: "", negativeDescriptor: "aloof", positiveDescriptor: "friendly" },
    { name: "honesty", score: 0, descriptor: "", negativeDescriptor: "dishonest", positiveDescriptor: "honest" },
    {
      name: "industriousness",
      score: 0,
      descriptor: "",
      negativeDescriptor: "lazy",
      positiveDescriptor: "hard-working",
    },
    { name: "intelligence", score: 0, descriptor: "", negativeDescriptor: "stupid", positiveDescriptor: "smart" },
    { name: "kindness", score: 0, descriptor: "", negativeDescriptor: "cruel", positiveDescriptor: "kind" },
    { name: "loyalty", score: 0, descriptor: "", negativeDescriptor: "disloyal", positiveDescriptor: "loyal" },
    { name: "optimism", score: 0, descriptor: "", negativeDescriptor: "pessimistic", positiveDescriptor: "optimistic" },
    { name: "politeness", score: 0, descriptor: "", negativeDescriptor: "rude", positiveDescriptor: "polite" },
    {
      name: "thoughtfulness",
      score: 0,
      descriptor: "",
      negativeDescriptor: "unthinking",
      positiveDescriptor: "thoughtful",
    },
    { name: "tolerance", score: 0, descriptor: "", negativeDescriptor: "intolerant", positiveDescriptor: "tolerant" },
    { name: "wisdom", score: 0, descriptor: "", negativeDescriptor: "foolish", positiveDescriptor: "wise" },
  ];
}
