import MeleeWeapon from "../../weapons/melee.js";
import type ItemMutator from "../itemmutator.js";
import MeleeWeaponMutator from "../meleeweapon.js";

export function all(): ItemMutator[] {
  let sets = [
    {
      element: "fire",
      damage: "+1d6 fire",
      description:
        "The blade is wreathed in flame when wielded. Anything flammable struck with it immediately ignites.",
    },
    {
      element: "ice",
      damage: "+1d6 cold",
      description:
        "The blade is surrounded by a layer of ice when wielded. Enemies struck with it are chilled to the bone and have difficulty moving.",
    },
    {
      element: "lightning",
      damage: "+1d6 electricity",
      description: "The blade is surrounded by crackling lightning when wielded.",
    },
    {
      element: "poison",
      damage: "+1d6 poison",
      description:
        "The blade is coated in a sickly green liquid when wielded. The liquid is highly poisonous, causing illness and eventually death if not cured.",
    },
    {
      element: "acid",
      damage: "+1d6 acid",
      description: "The blade is coated in a thin yellow acid when wielded.",
    },
    {
      element: "darkness",
      damage: "+1d6 darkness",
      description:
        "The blade is hidden in shadow when wielded. It is difficult for enemies to predict where attacks with this weapon will come from.",
    },
    {
      element: "light",
      damage: "+1d6 light",
      description:
        "The blade glows faintly when wielded. On command, that light glows brightly enough to illuminate a large room.",
    },
    {
      element: "earth",
      damage: "+1d6 earth",
      description: "The blade appears to be made of stone. Anything struck with it is turned to stone.",
    },
  ];

  let result = [];

  for (let set of sets) {
    result.push(
      new MeleeWeaponMutator(
        `${set.element}-enchanted melee weapon`,
        (item) => {
          item.name = `${set.element}-enchanted ${item.name}`;
          if (item instanceof MeleeWeapon) {
            item.damage += ` ${set.damage}`;
          }
          item.description += ` ${set.description}`;
          item.value += 10000;
          return item;
        },
        "bladed weapon",
        ["weapon", "melee weapon", "bladed weapon", "enchantment", set.element],
      ),
    );
  }

  return result;
}
