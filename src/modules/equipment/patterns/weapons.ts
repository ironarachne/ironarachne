'use strict';

import type Pattern from './pattern';
import AxePattern from './weapons/axe';
import BowPattern from './weapons/bow';
import ClubPattern from './weapons/club';
import KnifePattern from './weapons/knife';
import MacePattern from './weapons/mace';
import SpearPattern from './weapons/spear';
import StaffPattern from './weapons/staff';
import SwordPattern from './weapons/sword';

export function all(): Pattern[] {
  return [
    new AxePattern('battleaxe', 1, '1d8', 1000),
    new AxePattern('greataxe', 1, '1d12', 3000),
    new AxePattern('handaxe', 1, '1d6', 500),
    new BowPattern('longbow', 2, '2d8', 5000),
    new BowPattern('shortbow', 2, '1d6', 2500),
    new ClubPattern('club', 1, '1d4', 10),
    new ClubPattern('greatclub', 2, '1d8', 20),
    new KnifePattern('dagger', 1, '1d4', 200),
    new KnifePattern('knife', 1, '1d4', 200),
    new KnifePattern('long knife', 1, '1d4', 200),
    new MacePattern('heavy mace', 2, '1d8', 200),
    new MacePattern('mace', 1, '1d6', 100),
    new MacePattern('morningstar', 1, '1d6', 100),
    new SpearPattern('spear', 2, '1d6', 100),
    new StaffPattern('quarterstaff', 2, '1d6', 20),
    new StaffPattern('staff', 2, '1d6', 20),
    new SwordPattern('great sword', 2, '2d6', 5000),
    new SwordPattern('long sword', 1, '1d8', 1500),
    new SwordPattern('rapier', 1, '1d8', 2500),
    new SwordPattern('scimitar', 1, '1d6', 2500),
    new SwordPattern('short sword', 1, '1d6', 1000),
  ];
}
