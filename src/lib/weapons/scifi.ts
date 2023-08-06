import * as Weapons from "./weapons.js";

export const all = [
  Weapons.newWeaponType(
    "energy rifle",
    [
      "This rifle",
      "This energy rifle",
      "This blaster rifle",
      "This energy carbine",
      "This carbine",
    ],
    [
      Weapons.newWeaponComponent("barrel", ["an extended barrel", "a short barrel", "a grooved barrel"]),
      Weapons.newWeaponComponent("scope", ["advanced sighting", "a long scope", "a short scope"]),
      Weapons.newWeaponComponent("stock", [
        "a short stock",
        "a clever stock",
        "a comfortable stock",
        "an extended stock",
      ]),
      Weapons.newWeaponComponent("trigger", [
        "a hair trigger",
        "a double trigger",
        "a comfortable trigger",
      ]),
    ],
    [
      Weapons.newWeaponEffect("energy bolt", [
        "fires green bolts",
        "fires blue bolts",
        "fires red bolts",
        "fires yellow bolts",
        "fires purple bolts",
      ]),
      Weapons.newWeaponEffect("sound", [
        "sounds like a buzzsaw",
        "has a high-pitched whine",
        "emits a rumbling sound",
      ]),
      Weapons.newWeaponEffect("recoil", ["kicks hard", "has no recoil", "has a slight recoil"]),
      Weapons.newWeaponEffect("accuracy", [
        "has poor accuracy",
        "has excellent accuracy",
        "uses onboard AI to enhance accuracy",
        "has excellent accuracy",
      ]),
    ],
    "long",
    2,
    "energy",
  ),
  Weapons.newWeaponType(
    "energy pistol",
    ["This pistol", "This energy pistol", "This blaster pistol"],
    [
      Weapons.newWeaponComponent("barrel", ["an extended barrel", "a short barrel", "a grooved barrel"]),
      Weapons.newWeaponComponent("trigger", [
        "a hair trigger",
        "a double trigger",
        "a comfortable trigger",
      ]),
      Weapons.newWeaponComponent("grip", [
        "a comfortable grip",
        "a synthetic hide grip",
        "a biometric grip",
      ]),
    ],
    [
      Weapons.newWeaponEffect("energy bolt", [
        "fires green bolts",
        "fires blue bolts",
        "fires red bolts",
        "fires yellow bolts",
        "fires purple bolts",
      ]),
      Weapons.newWeaponEffect("sound", [
        "is very quiet",
        "has a high-pitched firing sound",
        "emits a low sound when it fires",
      ]),
      Weapons.newWeaponEffect("recoil", ["kicks hard", "has no recoil", "has a slight recoil"]),
      Weapons.newWeaponEffect("accuracy", [
        "has poor accuracy",
        "has excellent accuracy",
        "has good accuracy",
      ]),
    ],
    "short",
    1,
    "energy",
  ),
  Weapons.newWeaponType(
    "pistol",
    ["This pistol", "This revolver", "This sidearm"],
    [
      Weapons.newWeaponComponent("barrel", ["an extended barrel", "a short barrel", "a grooved barrel"]),
      Weapons.newWeaponComponent("trigger", [
        "a hair trigger",
        "a comfortable trigger",
        "a sensitive trigger",
      ]),
      Weapons.newWeaponComponent("grip", [
        "a comfortable grip",
        "a synthetic hide grip",
        "a biometric grip",
      ]),
    ],
    [
      Weapons.newWeaponEffect("ammunition", [
        "fires light rounds",
        "fires heavy rounds",
        "fires armor-piercing rounds",
        "fires incendiary rounds",
      ]),
      Weapons.newWeaponEffect("sound", [
        "is very quiet",
        "has a reverberating firing sound",
        "is loud when it fires",
      ]),
      Weapons.newWeaponEffect("recoil", ["kicks hard", "has no recoil", "has a slight recoil"]),
      Weapons.newWeaponEffect("accuracy", [
        "has poor accuracy",
        "has excellent accuracy",
        "has good accuracy",
      ]),
    ],
    "short",
    1,
    "projectile",
  ),
  Weapons.newWeaponType(
    "rifle",
    [
      "This rifle",
      "This assault rifle",
      "This sniper rifle",
      "This assault carbine",
      "This carbine",
    ],
    [
      Weapons.newWeaponComponent("barrel", ["an extended barrel", "a short barrel", "a grooved barrel"]),
      Weapons.newWeaponComponent("scope", [
        "advanced sighting",
        "a long scope",
        "a nightvision scope",
        "a short scope",
      ]),
      Weapons.newWeaponComponent("stock", [
        "a short stock",
        "a clever stock",
        "a comfortable stock",
        "an extended stock",
        "a collapsible stock",
      ]),
      Weapons.newWeaponComponent("trigger", [
        "a hair trigger",
        "a double trigger",
        "a comfortable trigger",
      ]),
    ],
    [
      Weapons.newWeaponEffect("ammunition", [
        "fires light rounds",
        "fires heavy rounds",
        "fires armor-piercing rounds",
        "fires anti-vehicular rounds",
        "fires incendiary rounds",
        "fires high explosive rounds",
      ]),
      Weapons.newWeaponEffect("sound", [
        "sounds like a cannon",
        "has a high-pitched firing sound",
        "echoes when it fires",
      ]),
      Weapons.newWeaponEffect("recoil", ["kicks hard", "has no recoil", "has a slight recoil"]),
      Weapons.newWeaponEffect("accuracy", [
        "has poor accuracy",
        "has excellent accuracy",
        "uses onboard AI to enhance accuracy",
        "has excellent accuracy",
      ]),
    ],
    "long",
    2,
    "projectile",
  ),
];
