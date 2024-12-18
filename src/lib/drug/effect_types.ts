import type EffectType from "./effect_type";

export function all(): EffectType[] {
  return [
    {
      name: "hallucinogen",
      effects: [
        "It creates psychedelic visions.",
        "It warps the appearance of things around you.",
        "It shows you your brightest hopes, and sometimes your darkest nightmares.",
        "It makes you delirious.",
        "It shows you things you wish were real.",
        "It seems to separate your mind from your body.",
      ],
    },
    {
      name: "aphrodesiac",
      effects: [
        "It increases your sex drive.",
        "Among other things, it increases your confidence.",
        "It boosts your performance and your sexual appetite.",
      ],
    },
    {
      name: "depressant",
      effects: [
        "It makes you mentally numb.",
        "It makes you mentally and physically numb.",
        "It numbs pain.",
        "It numbs physical sensation.",
        "It suppresses anger.",
        "It suppresses pain.",
        "It puts the world around you in a fog.",
      ],
    },
    {
      name: "stimulant",
      effects: [
        "It gets you jazzed up.",
        "It increases your reflexes.",
        "It boosts your ability to interface with cybertech.",
        "It increases your mental focus.",
        "It makes you more aware of your surroundings.",
        "It boosts your strength.",
        "It increases your awareness.",
      ],
    },
    {
      name: "tranquilizer",
      effects: [
        "It relaxes you.",
        "It helps you sleep.",
        "It eliminates anxiety.",
        "It reduces anxiety.",
        "It puts you to sleep immediately.",
      ],
    },
    {
      name: "euphoriant",
      effects: [
        "It makes you feel happy.",
        "It makes you feel really good.",
        "It makes you immune to pain.",
        "It turns pain into pleasure.",
        "It gives you a rush of energy and a feeling of excitement.",
        "It makes you feel invincible.",
      ],
    },
  ];
}
