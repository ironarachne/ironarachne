import type { DCCCharacter, DCCOccupation } from "./dcc_types";

export function all(): DCCOccupation[] {
  return [
    {
      name: "elven artisan",
      trainedWeapon: { name: "staff", classification: "staff", range: "melee", damage: "1d4", value: 50 },
      tradeGoods: { name: "clay, 1 lb.", value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter): DCCCharacter => {
        character.specialRules.push("Sensitive to iron");
        character.specialRules.push("Heightened senses");
        character.languages.push("Elf");
        return character;
      },
    },
    {
      name: "elven barrister",
      trainedWeapon: { name: "quill", classification: "dart", range: "20/40/60", damage: "1d4", value: 50 },
      tradeGoods: { name: "book", value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter): DCCCharacter => {
        character.specialRules.push("Sensitive to iron");
        character.specialRules.push("Heightened senses");
        character.languages.push("Elf");
        return character;
      },
    },
    {
      name: "elven chandler",
      trainedWeapon: { name: "scissors", classification: "dagger", range: "10/20/30", damage: "1d4/1d10", value: 50 },
      tradeGoods: { name: "candles, 20", value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter): DCCCharacter => {
        character.specialRules.push("Sensitive to iron");
        character.specialRules.push("Heightened senses");
        character.languages.push("Elf");
        return character;
      },
    },
    {
      name: "elven falconer",
      trainedWeapon: { name: "dagger", classification: "dagger", range: "10/20/30", damage: "1d4/1d10", value: 50 },
      tradeGoods: { name: "falcon", value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter): DCCCharacter => {
        character.specialRules.push("Sensitive to iron");
        character.specialRules.push("Heightened senses");
        character.languages.push("Elf");
        return character;
      },
    },
    {
      name: "elven forester",
      trainedWeapon: { name: "staff", classification: "staff", range: "melee", damage: "1d4", value: 50 },
      tradeGoods: { name: "herbs, 1 lb.", value: 1 },
      commonality: 2,
      apply: (character: DCCCharacter): DCCCharacter => {
        character.specialRules.push("Sensitive to iron");
        character.specialRules.push("Heightened senses");
        character.languages.push("Elf");
        return character;
      },
    },
    {
      name: "elven glassblower",
      trainedWeapon: { name: "hammer", classification: "club", range: "melee", damage: "1d4", value: 50 },
      tradeGoods: { name: "glass beads", value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter): DCCCharacter => {
        character.specialRules.push("Sensitive to iron");
        character.specialRules.push("Heightened senses");
        character.languages.push("Elf");
        return character;
      },
    },
    {
      name: "elven navigator",
      trainedWeapon: { name: "shortbow", classification: "shortbow", range: "50/100/150", damage: "1d6", value: 50 },
      tradeGoods: { name: "spyglass", value: 1 },
      commonality: 1,
      apply: (character: DCCCharacter): DCCCharacter => {
        character.specialRules.push("Sensitive to iron");
        character.specialRules.push("Heightened senses");
        character.languages.push("Elf");
        return character;
      },
    },
    {
      name: "elven sage",
      trainedWeapon: { name: "dagger", classification: "dagger", range: "10/20/30", damage: "1d4/1d10", value: 50 },
      tradeGoods: { name: "parchment and quill pen", value: 1 },
      commonality: 2,
      apply: (character: DCCCharacter): DCCCharacter => {
        character.specialRules.push("Sensitive to iron");
        character.specialRules.push("Heightened senses");
        character.languages.push("Elf");
        return character;
      },
    },
  ];
}
