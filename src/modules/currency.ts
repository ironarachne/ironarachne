"use strict";

export function convertCopper(amount: number) {
  let copper = 0;
  let silver = 0;
  let gold = 0;
  let platinum = 0;
  let remaining = 0;

  remaining += amount;

  while (remaining > 0) {
    if (remaining >= 1000) {
      platinum++;
      remaining -= 1000;
    } else if (remaining >= 100) {
      gold++;
      remaining -= 100;
    } else if (remaining >= 10) {
      silver++;
      remaining -= 10;
    } else {
      copper = remaining;
      break;
    }
  }

  let result = "";

  if (platinum > 0) {
    result += platinum + " pp ";
  }

  if (gold > 0) {
    result += gold + " gp ";
  }

  if (silver > 0) {
    result += silver + " sp ";
  }

  if (copper > 0) {
    result += copper + " cp ";
  }

  return result.trim();
}

export function convertFarthings(amount: number) {
  let farthings = 0;
  let pence = 0;
  let shillings = 0;
  let crowns = 0;
  let pounds = 0;
  let remaining = 0;

  remaining += amount;

  while (remaining > 0) {
    if (remaining >= 960) {
      pounds++;
      remaining -= 960;
    } else if (remaining >= 240) {
      crowns++;
      remaining -= 240;
    } else if (remaining >= 48) {
      shillings++;
      remaining -= 48;
    } else if (remaining >= 4) {
      pence++;
      remaining -= 4;
    } else {
      farthings = remaining;
      break;
    }
  }

  let result = "";

  if (pounds > 0) {
    result += "£" + pounds + " ";
  }

  if (crowns > 0) {
    result += crowns + " c ";
  }

  if (shillings > 0) {
    result += shillings + " s ";
  }

  if (pence > 0) {
    result += pence + " d ";
  }

  if (farthings > 0) {
    result += farthings + " f ";
  }

  return result.trim();
}
