import random from "random";

export function distributePoints(skillList, extraPoints: number) {
  while (extraPoints > 0) {
    let skillIndex = random.int(0, skillList.length - 1);
    let skill = skillList[skillIndex];
    if (skill.points < 30) {
      let cap = 30 - skill.points > 30 ? 30 : 30 - skill.points;
      let points = random.int(1, cap);
      skill.points += points;
      extraPoints -= points;
    }
  }

  return skillList;
}

export function modifyForDexterity(skillList, dexterity: number) {
  let dexterityAdjustments = {
    9: {
      "Pick Pockets": -15,
      "Open Locks": -10,
      "Find/Remove Traps": -10,
      "Move Silently": -20,
      "Hide in Shadows": -10,
      "Detect Noise": 0,
      "Climb Walls": 0,
      "Read Languages": 0,
    },
    10: {
      "Pick Pockets": -10,
      "Open Locks": -5,
      "Find/Remove Traps": -10,
      "Move Silently": -15,
      "Hide in Shadows": -5,
      "Detect Noise": 0,
      "Climb Walls": 0,
      "Read Languages": 0,
    },
    11: {
      "Pick Pockets": -5,
      "Open Locks": 0,
      "Find/Remove Traps": -5,
      "Move Silently": -10,
      "Hide in Shadows": 0,
      "Detect Noise": 0,
      "Climb Walls": 0,
      "Read Languages": 0,
    },
    12: {
      "Pick Pockets": 0,
      "Open Locks": 0,
      "Find/Remove Traps": 0,
      "Move Silently": -5,
      "Hide in Shadows": 0,
      "Detect Noise": 0,
      "Climb Walls": 0,
      "Read Languages": 0,
    },
    13: {
      "Pick Pockets": 0,
      "Open Locks": 0,
      "Find/Remove Traps": 0,
      "Move Silently": 0,
      "Hide in Shadows": 0,
      "Detect Noise": 0,
      "Climb Walls": 0,
      "Read Languages": 0,
    },
    14: {
      "Pick Pockets": 0,
      "Open Locks": 0,
      "Find/Remove Traps": 0,
      "Move Silently": 0,
      "Hide in Shadows": 0,
      "Detect Noise": 0,
      "Climb Walls": 0,
      "Read Languages": 0,
    },
    15: {
      "Pick Pockets": 0,
      "Open Locks": 0,
      "Find/Remove Traps": 0,
      "Move Silently": 0,
      "Hide in Shadows": 0,
      "Detect Noise": 0,
      "Climb Walls": 0,
      "Read Languages": 0,
    },
    16: {
      "Pick Pockets": 0,
      "Open Locks": 5,
      "Find/Remove Traps": 0,
      "Move Silently": 0,
      "Hide in Shadows": 0,
      "Detect Noise": 0,
      "Climb Walls": 0,
      "Read Languages": 0,
    },
    17: {
      "Pick Pockets": 5,
      "Open Locks": 10,
      "Find/Remove Traps": 0,
      "Move Silently": 5,
      "Hide in Shadows": 5,
      "Detect Noise": 0,
      "Climb Walls": 0,
      "Read Languages": 0,
    },
    18: {
      "Pick Pockets": 10,
      "Open Locks": 15,
      "Find/Remove Traps": 5,
      "Move Silently": 10,
      "Hide in Shadows": 10,
      "Detect Noise": 0,
      "Climb Walls": 0,
      "Read Languages": 0,
    },
    19: {
      "Pick Pockets": 15,
      "Open Locks": 20,
      "Find/Remove Traps": 10,
      "Move Silently": 15,
      "Hide in Shadows": 15,
      "Detect Noise": 0,
      "Climb Walls": 0,
      "Read Languages": 0,
    },
  };

  for (let i = 0; i < skillList.length; i++) {
    skillList[i].value += dexterityAdjustments[dexterity][skillList[i].name];
  }

  return skillList;
}

export function modifyForRace(skillList, raceName: string) {
  let racialAdjustments = {
    dwarf: {
      "Pick Pockets": 0,
      "Open Locks": 10,
      "Find/Remove Traps": 15,
      "Move Silently": 0,
      "Hide in Shadows": 0,
      "Detect Noise": 0,
      "Climb Walls": -10,
      "Read Languages": -5,
    },
    elf: {
      "Pick Pockets": 5,
      "Open Locks": -5,
      "Find/Remove Traps": 0,
      "Move Silently": 5,
      "Hide in Shadows": 10,
      "Detect Noise": 5,
      "Climb Walls": 0,
      "Read Languages": 0,
    },
    gnome: {
      "Pick Pockets": 0,
      "Open Locks": 5,
      "Find/Remove Traps": 10,
      "Move Silently": 5,
      "Hide in Shadows": 5,
      "Detect Noise": 10,
      "Climb Walls": -15,
      "Read Languages": 0,
    },
    halfling: {
      "Pick Pockets": 5,
      "Open Locks": 5,
      "Find/Remove Traps": 5,
      "Move Silently": 10,
      "Hide in Shadows": 15,
      "Detect Noise": 5,
      "Climb Walls": -15,
      "Read Languages": -5,
    },
    "half-elf": {
      "Pick Pockets": 10,
      "Open Locks": 0,
      "Find/Remove Traps": 0,
      "Move Silently": 0,
      "Hide in Shadows": 5,
      "Detect Noise": 0,
      "Climb Walls": 0,
      "Read Languages": 0,
    },
    human: {
      "Pick Pockets": 0,
      "Open Locks": 0,
      "Find/Remove Traps": 0,
      "Move Silently": 0,
      "Hide in Shadows": 0,
      "Detect Noise": 0,
      "Climb Walls": 0,
      "Read Languages": 0,
    },
  };

  for (let i = 0; i < skillList.length; i++) {
    skillList[i].value += racialAdjustments[raceName][skillList[i].name];
  }

  return skillList;
}
