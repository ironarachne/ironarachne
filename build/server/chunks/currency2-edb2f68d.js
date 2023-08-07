import './sentry-release-injection-file-2a0756c4.js';

function convertCopper(amount, useElectrum, usePlatinum, enableExact = true) {
  let copper = 0;
  let silver = 0;
  let electrum = 0;
  let gold = 0;
  let platinum = 0;
  let remaining = 0;
  remaining += amount;
  while (remaining > 0) {
    if (remaining >= 1e3 && usePlatinum) {
      platinum++;
      remaining -= 1e3;
    } else if (remaining >= 100) {
      gold++;
      remaining -= 100;
    } else if (remaining >= 50 && useElectrum) {
      electrum++;
      remaining -= 50;
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
    if (!enableExact) {
      return result.trim();
    }
  }
  if (gold > 0) {
    result += gold + " gp ";
    if (!enableExact) {
      return result.trim();
    }
  }
  if (electrum > 0) {
    result += electrum + " ep ";
    if (!enableExact) {
      return result.trim();
    }
  }
  if (silver > 0) {
    result += silver + " sp ";
    if (!enableExact) {
      return result.trim();
    }
  }
  if (copper > 0) {
    result += copper + " cp ";
  }
  return result.trim();
}

export { convertCopper as c };
//# sourceMappingURL=currency2-edb2f68d.js.map
