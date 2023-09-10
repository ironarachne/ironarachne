import * as RND from "@ironarachne/rng";

import Tincture from "./tincture.js";

export function all() {
  return colors().concat(metals()).concat(furs()).concat(stains());
}

export function byName(name: string) {
  let tinctures = all();

  for (let i = 0; i < tinctures.length; i++) {
    if (tinctures[i].name == name) {
      return tinctures[i];
    }
  }

  console.error(`failed to find tincture ${name}`);
}

export function colors() {
  return [
    new Tincture(
      "azure",
      "#0731BA",
      `<pattern id="azure" x="0" y="0" width="1" height="1" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="1" height="1" fill="#0731BA"/></pattern>`,
      "color",
      "dark",
      20,
    ),
    new Tincture(
      "gules",
      "#D40D02",
      `<pattern id="gules" x="0" y="0" width="1" height="1" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="1" height="1" fill="#D40D02"/></pattern>`,
      "color",
      "dark",
      20,
    ),
    new Tincture(
      "vert",
      "#0B731B",
      `<pattern id="vert" x="0" y="0" width="1" height="1" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="1" height="1" fill="#0B731B"/></pattern>`,
      "color",
      "dark",
      20,
    ),
    new Tincture(
      "sable",
      "#000000",
      `<pattern id="sable" x="0" y="0" width="1" height="1" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="1" height="1" fill="#000000"/></pattern>`,
      "color",
      "dark",
      20,
    ),
    new Tincture(
      "purpure",
      "#6131B5",
      `<pattern id="purpure" x="0" y="0" width="1" height="1" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="1" height="1" fill="#6131B5"/></pattern>`,
      "color",
      "dark",
      20,
    ),
  ];
}

export function furs() {
  const erminePattern =
    `<pattern id="ermine" x="0" y="0" width="230" height="200" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="230" height="200" fill="#ffffff"/><path class="st3" d="m 28.011168,1.1896638 c 7.00002,8.788467 -12.59999,12.2666752 -2,20.5058592 4.50002,2.83795 15.09883,-3.295919 5.79883,-10.802734 -1.20001,-0.640826 4.20119,-5.0342502 -3.79883,-9.7031252 z m 115.298832,0 c 6.99996,8.788467 -12.59997,12.2666752 -2,20.5058592 4.50001,2.83795 15.09889,-3.295919 5.79883,-10.802734 -1.20004,-0.640826 4.20121,-5.0342502 -3.79883,-9.7031252 z M 39.809998,21.879117 c -1.8,0.183085 -3.49961,1.282909 -5.09961,4.029297 -2,4.668875 6.79883,12.724915 12.79883,2.837891 0.4,-1.190111 6.39961,2.653501 9.59961,-5.494141 -5.6,5.858975 -11.39962,-1.09841 -16.59961,-1.373047 z m 115.298832,0 c -1.8001,0.183085 -3.49761,1.282909 -5.09766,4.029297 -1.99996,4.668875 6.79885,12.724915 12.79883,2.837891 0.40001,-1.190111 6.29963,2.653501 9.59961,-5.494141 -5.59997,5.858975 -11.29994,-1.09841 -16.5,-1.373047 z m -137.097662,0.0918 c -5.19999,0.274636 -10.8999996,7.323574 -16.4999996,1.373047 3.3,8.147642 9.1976596,4.212489 9.5976596,5.49414 5.89999,9.887025 14.80078,1.830985 12.80078,-2.83789 -1.9,-3.112577 -3.89844,-4.12085 -5.89844,-4.029297 z m 115.298832,0 c -5.20005,0.274636 -10.90188,7.323574 -16.50195,1.373047 3.30008,8.147642 9.20118,4.212489 9.70117,5.49414 5.9,9.887025 14.70113,1.830985 12.70117,-2.83789 -1.89999,-3.112577 -3.80045,-4.12085 -5.90039,-4.029297 z M 29.708438,27.646695 c -4.6,20.872616 -13.09845,35.613022 -22.3984396,46.232422 3.8999896,-1.09856 8.1984396,-4.02873 12.3984396,-6.68359 -2.6,5.4928 -5.09922,10.1617 -7.69922,15.01367 1.5,-0.54928 6.40195,-5.40234 13.00195,-12.54297 1.00002,9.79548 2.39805,14.46554 4.49805,21.14844 1.70002,-6.6829 2.90117,-11.17013 4.20117,-21.24024 4,4.48577 7.79922,9.06325 13.19922,12.90821 l -7.5,-15.56055 c 3.9,2.47177 8.20078,5.76548 12.30078,7.13867 -9.7,-11.16868 -18.00195,-25.541456 -22.00195,-46.414062 z m 115.300782,0 c -4.59999,20.872616 -13.09849,35.613022 -22.39844,46.232422 3.90004,-1.09856 8.19846,-4.02873 12.39844,-6.68359 -2.59993,5.4928 -5.19927,10.1617 -7.69922,15.01367 1.49997,-0.54928 6.40006,-5.40234 13,-12.54297 0.99999,9.79548 2.39996,14.46554 4.5,21.14844 1.69992,-6.6829 2.90126,-11.17013 4.20117,-21.24024 4.00002,4.48577 7.79726,9.06325 13.19727,12.90821 l -7.49805,-15.56055 c 3.90004,2.47177 8.20042,5.76548 12.40039,7.13867 -9.79994,-11.16868 -18.10154,-25.541456 -22.10156,-46.414062 z M 85.710388,110.6467 c 6.99997,8.78847 -12.6,12.26667 -2,20.50586 4.49999,2.83794 15.10074,-3.29592 5.80078,-10.80274 -1.30003,-0.64083 4.19917,-5.03424 -3.80078,-9.70312 z m 115.298832,0 c 6.99996,8.78847 -12.59997,12.26667 -2,20.50586 4.50001,2.83794 15.10074,-3.29592 5.80078,-10.80274 -1.20003,-0.64083 4.19926,-5.03424 -3.80078,-9.70312 z M 98.210388,131.33615 c 0,0.19995 -0.4988,-0.002 -0.79883,0.0898 -1.80001,0.18309 -3.50151,1.28094 -5.10156,4.02734 -1.99996,4.66887 6.8008,12.72662 12.800782,2.74805 0.40002,-1.19011 6.29964,2.65545 9.59961,-5.49219 -5.59997,5.85897 -16.500002,-6.58036 -16.500002,-1.37305 z m 115.400392,0 c 0,0.29994 -0.60072,-0.002 -0.80078,0.0898 -1.8,0.18309 -3.49957,1.28094 -5.09961,4.02734 -1.99996,4.66887 6.8007,12.72662 12.80078,2.74805 0.40001,-1.19011 6.29964,2.65545 9.59961,-5.49219 -5.59997,5.85897 -16.5,-6.58036 -16.5,-1.37305 z m -137.900392,0.0898 c -5.2,0.27464 -10.90001,7.23396 -16.5,1.375 3.29999,8.14763 9.1996,4.21054 9.59961,5.49218 5.9,9.88706 14.79883,1.92084 12.79883,-2.74804 -1.89999,-3.20411 -3.89844,-4.21068 -5.89844,-4.11914 z m 115.298832,0 c -5.20006,0.27464 -10.89994,7.23396 -16.5,1.375 3.30007,8.14763 9.20118,4.21054 9.70117,5.49218 5.90001,9.88706 14.70113,1.92084 12.70117,-2.74804 -1.89998,-3.20411 -3.90238,-4.21068 -5.90234,-4.11914 z m -103.599612,5.67579 c -1.4,6.22517 -3.70117,12.54136 -5.70117,17.66796 -4.5,10.98558 -10.69922,20.24168 -16.69922,27.19922 3.89999,-1.09856 8.2004,-4.02875 12.40039,-6.68359 -2.59999,5.49279 -5.19922,10.16171 -7.69922,15.01367 1.5,-0.54928 6.39805,-5.40038 12.99805,-12.54101 1,9.79548 2.40194,14.46359 4.50195,21.14648 1.70004,-6.68289 2.8992,-11.16842 4.19922,-21.33008 3.99992,4.48578 7.80116,9.06327 13.201172,12.90821 l -7.500002,-15.56446 c 3.900052,2.47176 8.198832,5.76938 12.298832,7.14258 -6.39999,-7.23217 -12.700052,-16.39698 -17.000002,-27.29102 -1.90009,-5.1266 -3.8,-11.44279 -5,-17.66796 z m 115.300782,0 c -1.4,6.22517 -3.99994,12.72715 -6,17.94531 -4.50001,10.98558 -10.40041,20.05588 -16.40039,26.92187 3.89994,-1.09856 8.20042,-4.02875 12.40039,-6.68359 -2.59992,5.49279 -5.0993,10.16171 -7.69922,15.01367 1.49997,-0.54928 6.3981,-5.40038 12.99805,-12.54101 0.99998,9.79548 2.40191,14.46359 4.50195,21.14648 1.69993,-6.68289 2.89725,-11.16842 4.19727,-21.33008 4.00002,4.48578 7.80116,9.06327 13.20117,12.90821 l -7.5,-15.56446 c 3.89995,2.47176 8.20041,5.76938 12.40039,7.14258 -6.4,-7.23217 -12.90122,-16.39698 -17.20117,-27.29102 -1.89998,-5.1266 -3.69851,-11.44279 -4.89844,-17.66796 z" fill="#000000" stroke="#000000" /></pattern>`;

  return [
    new Tincture("ermine", "", erminePattern, "fur", "dark", 2),
    new Tincture(
      "ermines",
      "",
      erminePattern
        .replaceAll("#ffffff", "#333333")
        .replaceAll("#000000", "#ffffff")
        .replaceAll("#333333", "#000000")
        .replaceAll("ermine", "ermines"),
      "fur",
      "dark",
      2,
    ),
    new Tincture(
      "erminois",
      "",
      erminePattern.replaceAll("#ffffff", "#F0D41F").replaceAll("ermine", "erminois"),
      "fur",
      "light",
      2,
    ),
    new Tincture(
      "pean",
      "",
      erminePattern
        .replaceAll("#000000", "#F0D41F")
        .replaceAll("#ffffff", "#000000")
        .replaceAll("ermine", "pean"),
      "fur",
      "dark",
      1,
    ),
  ];
}

export function metals() {
  return [
    new Tincture(
      "argent",
      "#ffffff",
      `<pattern id="argent" x="0" y="0" width="1" height="1" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="1" height="1" fill="#ffffff"/></pattern>`,
      "metal",
      "light",
      10,
    ),
    new Tincture(
      "Or",
      "#F0D41F",
      `<pattern id="Or" x="0" y="0" width="1" height="1" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="1" height="1" fill="#F0D41F"/></pattern>`,
      "metal",
      "light",
      10,
    ),
  ];
}

export function stains() {
  return [
    new Tincture(
      "murrey",
      "#8b004b",
      `<pattern id="murrey" x="0" y="0" width="1" height="1" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="1" height="1" fill="#8b004b"/></pattern>`,
      "stain",
      "dark",
      2,
    ),
    new Tincture(
      "sanguine",
      "#8f1c14",
      `<pattern id="sanguine" x="0" y="0" width="1" height="1" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="1" height="1" fill="#8f1c14"/></pattern>`,
      "stain",
      "dark",
      2,
    ),
    new Tincture(
      "tenné",
      "#c67000",
      `<pattern id="tenné" x="0" y="0" width="1" height="1" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="1" height="1" fill="#c67000"/></pattern>`,
      "stain",
      "dark",
      2,
    ),
  ];
}

export function contrasts(a: Tincture, b: Tincture) {
  if (a.category == "neutral" || b.category == "neutral") {
    return true;
  }

  return a.category != b.category;
}

export function exclude(tincture: Tincture, setOfTinctures: Tincture[]) {
  const result: Tincture[] = [];

  setOfTinctures.forEach(function(value) {
    if (value.name != tincture.name) {
      result.push(value);
    }
  });

  return result;
}

export function getContrasting(tincture: Tincture, tinctures: Tincture[]): Tincture[] {
  let result = [];

  for (let i = 0; i < tinctures.length; i++) {
    if (contrasts(tincture, tinctures[i])) {
      result.push(tinctures[i]);
    }
  }

  return result;
}

export function isIncludedIn(needle: Tincture, haystack: Tincture[]): Boolean {
  for (let i = 0; i < haystack.length; i++) {
    if (needle.name == haystack[i].name) {
      return true;
    }
  }

  return false;
}

export function getSetExcluding(
  tincturesToRemove: Tincture[],
  tincturesToCompare: Tincture[],
): Tincture[] {
  let result = [];

  for (let i = 0; i < tincturesToCompare.length; i++) {
    if (!isIncludedIn(tincturesToCompare[i], tincturesToRemove)) {
      result.push(tincturesToCompare[i]);
    }
  }

  return result;
}

export function ofTypes(types: string[]): Tincture[] {
  const tinctures = all();

  let matching = [];

  for (let i = 0; i < tinctures.length; i++) {
    if (types.includes(tinctures[i].type)) {
      matching.push(tinctures[i]);
    }
  }

  return matching;
}

export function random() {
  return RND.item(all());
}

export function randomChargeTincture(): Tincture {
  let options = ofTypes(["metal"]);

  const colorChance = RND.simple(100);

  if (colorChance > 70) {
    options = ofTypes(["metal", "color", "stain"]);
  }

  return RND.weighted(options);
}

export function randomContrasting(tincture: Tincture): Tincture {
  let result = randomColor();

  if (tincture.type == "color") {
    result = randomMetal();
  }

  return result;
}

export function randomExcluding(tincture: Tincture) {
  const allTinctures = all();

  const possible = exclude(tincture, allTinctures);

  return RND.item(possible);
}

export function randomFrom(tinctures: Tincture[]): Tincture {
  return RND.item(tinctures);
}

export function randomWeighted() {
  const tinctureType = randomWeightedType();

  if (tinctureType == "fur") {
    return randomFur();
  } else if (tinctureType == "color") {
    return randomColor();
  } else if (tinctureType == "stain") {
    return randomStain();
  } else {
    return randomMetal();
  }
}

export function randomWeightedExcluding(tincture: Tincture) {
  const tinctureType = randomWeightedType();

  let possible = [];

  if (tinctureType == "fur") {
    possible = exclude(tincture, furs());
  } else if (tinctureType == "color") {
    possible = exclude(tincture, colors());
  } else if (tinctureType == "stain") {
    possible = exclude(tincture, stains());
  } else {
    possible = exclude(tincture, metals());
  }

  return RND.item(possible);
}

export function randomWeightedType() {
  const weights = [
    { item: "fur", commonality: 5 },
    { item: "color", commonality: 25 },
    { item: "metal", commonality: 20 },
    { item: "stain", commonality: 6 },
  ];

  const tinctureType = RND.weighted(weights);

  return tinctureType.item;
}

export function randomMetal() {
  return RND.item(metals());
}

export function randomColor() {
  return RND.item(colors());
}

export function randomFur() {
  return RND.item(furs());
}

export function randomStain() {
  return RND.item(stains());
}

export function withoutFurs(tinctures: Tincture[]): Tincture[] {
  return getSetExcluding(furs(), tinctures);
}
