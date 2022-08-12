'use strict';

import OSEAbility from './ability';
import OSEClass from './class';

export function all(): OSEClass[] {
  return [acrobat()];
}

function acrobat(): OSEClass {
  let acrobat = new OSEClass();

  acrobat.name = 'Acrobat';
  acrobat.hitDice = '1d8';
  acrobat.maximumLevel = 14;
  acrobat.skills.push(
    new OSEAbility(
      'Acrobat Skills',
      "Acrobats can use the following skills with the chance of success shown opposite.\n\n * **Climb sheer surfaces (CS):** A roll is required for each 100' to be climbed. If the roll fails, the acrobat falls at the half-way point, suffering falling damage.\n * **Falling (FA):** When able to tumble, acrobats suffer no damage from the first 10' of any fall. Damage due to falling from a greater height is reduced by the listed percentage (rounding fractions down).\n * **Hide in shadows (HS):** The acrobat must be motionless &em; attacking or moving while hiding is not possible.\n * **Move silently (MS):** An acrobat may attempt to sneak past enemies unnoticed.\n * **TIghtrope walking (TW):** Acrobats can walk along tightropes, narrow beams, and ledges at up to half their normal movement rate. A roll is required every 60'. Failure indicates that the acrobat falls and suffers falling damage. Windy conditions may reduce the chance of success by up to 20%. HOlding a balance pole increases the chance of success by 10%.",
    ),
  );
  acrobat.skills.push(
    new OSEAbility(
      'Evasion',
      "When retreating from melee, an acrobat's ability to tumble negates the opponent's usual +2 bonus to hit.",
    ),
  );
  acrobat.skills.push(
    new OSEAbility(
      'Jumping',
      "With a 20' run-up, an acrobat can jump across a 10' wide pit or chasm (or 20' wide when aided by the use of a pole). Also when using a pole, an acrobat can jump over a 10' high wall or onto a 10' high ledge. Suitable poles for jumping include: 10' poles, pole arms, spears, staves.",
    ),
  );
  acrobat.skills.push(
    new OSEAbility(
      'Tumbling Attack',
      'Using the falling or jumping abilities, an acrobat can make a tumbling melee attack. The attack inflicts double damage if successful. Against an unaware opponent, the acrobat also gains a +4 bonus to hit.',
    ),
  );

  return acrobat;
}
