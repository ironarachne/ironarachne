import WeaponComponent from "./component";
import WeaponEffect from "./effect";
import WeaponType from "./type";

export function allTypes() {
  return [
    new WeaponType(
      "energy rifle",
      [
        "This rifle",
        "This energy rifle",
        "This blaster rifle",
        "This energy carbine",
        "This carbine",
      ],
      [
        new WeaponComponent(
          "barrel",
          [
            "an extended barrel",
            "a short barrel",
            "a grooved barrel",
          ]
        ),
        new WeaponComponent(
          "scope",
          [
            "advanced sighting",
            "a long scope",
            "a short scope",
          ]
        ),
        new WeaponComponent(
          "stock",
          [
            "a short stock",
            "a clever stock",
            "a comfortable stock",
            "an extended stock",
          ]
        ),
        new WeaponComponent(
          "trigger",
          [
            "a hair trigger",
            "a double trigger",
            "a comfortable trigger",
          ]
        ),
      ],
      [
        new WeaponEffect(
          "energy bolt",
          [
            "fires green bolts",
            "fires blue bolts",
            "fires red bolts",
            "fires yellow bolts",
            "fires purple bolts",
          ]
        ),
        new WeaponEffect(
          "sound",
          [
            "sounds like a buzzsaw",
            "has a high-pitched whine",
            "emits a rumbling sound",
          ]
        ),
        new WeaponEffect(
          "recoil",
          [
            "kicks hard",
            "has no recoil",
            "has a slight recoil",
          ]
        ),
        new WeaponEffect(
          "accuracy",
          [
            "has poor accuracy",
            "has excellent accuracy",
            "uses onboard AI to enhance accuracy",
            "has excellent accuracy",
          ]
        ),
      ],
      "long",
      2,
      "energy"
    ),
    new WeaponType(
      "energy pistol",
      [
        "This pistol",
        "This energy pistol",
        "This blaster pistol",
      ],
      [
        new WeaponComponent(
          "barrel",
          [
            "an extended barrel",
            "a short barrel",
            "a grooved barrel",
          ]
        ),
        new WeaponComponent(
          "trigger",
          [
            "a hair trigger",
            "a double trigger",
            "a comfortable trigger",
          ]
        ),
        new WeaponComponent(
          "grip",
          [
            "a comfortable grip",
            "a synthetic hide grip",
            "a biometric grip",
          ]
        ),
      ],
      [
        new WeaponEffect(
          "energy bolt",
          [
            "fires green bolts",
            "fires blue bolts",
            "fires red bolts",
            "fires yellow bolts",
            "fires purple bolts",
          ]
        ),
        new WeaponEffect(
          "sound",
          [
            "is very quiet",
            "has a high-pitched firing sound",
            "emits a low sound when it fires",
          ]
        ),
        new WeaponEffect(
          "recoil",
          [
            "kicks hard",
            "has no recoil",
            "has a slight recoil",
          ]
        ),
        new WeaponEffect(
          "accuracy",
          [
            "has poor accuracy",
            "has excellent accuracy",
            "has good accuracy",
          ]
        ),
      ],
      "short",
      1,
      "energy"
    ),
    new WeaponType(
      "pistol",
      [
        "This pistol",
        "This revolver",
        "This sidearm",
      ],
      [
        new WeaponComponent(
          "barrel",
          [
            "an extended barrel",
            "a short barrel",
            "a grooved barrel",
          ]
        ),
        new WeaponComponent(
          "trigger",
          [
            "a hair trigger",
            "a comfortable trigger",
            "a sensitive trigger",
          ]
        ),
        new WeaponComponent(
          "grip",
          [
            "a comfortable grip",
            "a synthetic hide grip",
            "a biometric grip",
          ]
        ),
      ],
      [
        new WeaponEffect(
          "ammunition",
          [
            "fires light rounds",
            "fires heavy rounds",
            "fires armor-piercing rounds",
            "fires incendiary rounds",
          ]
        ),
        new WeaponEffect(
          "sound",
          [
            "is very quiet",
            "has a reverberating firing sound",
            "is loud when it fires",
          ]
        ),
        new WeaponEffect(
          "recoil",
          [
            "kicks hard",
            "has no recoil",
            "has a slight recoil",
          ]
        ),
        new WeaponEffect(
          "accuracy",
          [
            "has poor accuracy",
            "has excellent accuracy",
            "has good accuracy",
          ]
        ),
      ],
      "short",
      1,
      "projectile"
    ),
    new WeaponType(
      "rifle",
      [
        "This rifle",
        "This assault rifle",
        "This sniper rifle",
        "This assault carbine",
        "This carbine",
      ],
      [
        new WeaponComponent(
          "barrel",
          [
            "an extended barrel",
            "a short barrel",
            "a grooved barrel",
          ]
        ),
        new WeaponComponent(
          "scope",
          [
            "advanced sighting",
            "a long scope",
            "a nightvision scope",
            "a short scope",
          ]
        ),
        new WeaponComponent(
          "stock",
          [
            "a short stock",
            "a clever stock",
            "a comfortable stock",
            "an extended stock",
            "a collapsible stock",
          ]
        ),
        new WeaponComponent(
          "trigger",
          [
            "a hair trigger",
            "a double trigger",
            "a comfortable trigger",
          ]
        ),
      ],
      [
        new WeaponEffect(
          "ammunition",
          [
            "fires light rounds",
            "fires heavy rounds",
            "fires armor-piercing rounds",
            "fires anti-vehicular rounds",
            "fires incendiary rounds",
            "fires high explosive rounds",
          ]
        ),
        new WeaponEffect(
          "sound",
          [
            "sounds like a cannon",
            "has a high-pitched firing sound",
            "echoes when it fires",
          ]
        ),
        new WeaponEffect(
          "recoil",
          [
            "kicks hard",
            "has no recoil",
            "has a slight recoil",
          ]
        ),
        new WeaponEffect(
          "accuracy",
          [
            "has poor accuracy",
            "has excellent accuracy",
            "uses onboard AI to enhance accuracy",
            "has excellent accuracy",
          ]
        ),
      ],
      "long",
      2,
      "projectile"
    ),
  ];
}
