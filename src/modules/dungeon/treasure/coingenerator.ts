'use strict';

import BagOfCoins from './bagofcoins';
import * as Dice from '../../dice';
import * as RND from '../../random';
import * as Words from '../../words';
import type TreasureGenerator from './treasuregenerator';

export default class CoinGenerator implements TreasureGenerator {
  cp: string;
  sp: string;
  ep: string;
  gp: string;
  pp: string;

  constructor(cp: string, sp: string, ep: string, gp: string, pp: string) {
    this.cp = cp;
    this.sp = sp;
    this.ep = ep;
    this.gp = gp;
    this.pp = pp;
  }

  generate(): BagOfCoins {
    let bag = new BagOfCoins();
    let cp = 0;
    let sp = 0;
    let ep = 0;
    let gp = 0;
    let pp = 0;

    if (this.cp != '') {
      cp = Dice.roll(this.cp);
    }

    if (this.sp != '') {
      sp = Dice.roll(this.sp);
    }

    if (this.ep != '') {
      ep = Dice.roll(this.ep);
    }

    if (this.gp != '') {
      gp = Dice.roll(this.gp);
    }

    if (this.pp != '') {
      pp = Dice.roll(this.pp);
    }

    bag.value = cp + sp * 10 + ep * 50 + gp * 100 + pp * 1000;

    let coinCount = cp + sp + ep + gp + pp;
    let container = RND.item(['bag', 'pouch', 'purse']);

    // TODO: pull the container out into its own class, and have a library that generates an appropriate description
    // maybe also figure out how to have multiple types of things in a container... perhaps treasure has a property
    // like "needsContainer" and "containerSize" or something

    if (coinCount > 1000) {
      container = RND.item(['chest', 'large chest']);
    } else if (coinCount > 250) {
      container = RND.item(['chest', 'satchel']);
    } else if (coinCount > 100) {
      container = RND.item(['sack', 'box']);
    }

    bag.name = `a ${container} of coins`;

    bag.description =
      'a ' + container + ' of coins ' + RND.item(['containing', 'holding', 'with']) + ' ';

    let moneys = [];

    if (cp > 0) {
      moneys.push(`${new Intl.NumberFormat().format(cp)} cp`);
    }

    if (sp > 0) {
      moneys.push(`${new Intl.NumberFormat().format(sp)} sp`);
    }

    if (ep > 0) {
      moneys.push(`${new Intl.NumberFormat().format(ep)} ep`);
    }

    if (gp > 0) {
      moneys.push(`${new Intl.NumberFormat().format(gp)} gp`);
    }

    if (pp > 0) {
      moneys.push(`${new Intl.NumberFormat().format(pp)} pp`);
    }

    bag.description += Words.arrayToPhrase(moneys);

    return bag;
  }
}
