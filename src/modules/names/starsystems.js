import * as iarnd from "../random.js";

export function generate() {
  let prefixes = [
    "Ar",
    "Ab",
    "Al",
    "Meb",
    "Pher",
    "Sched",
    "Tay",
    "Ser",
    "San",
    "Dor",
    "Kan",
    "Kel",
    "Mep",
    "Frin",
    "Vuat",
    "Qin",
    "Zor",
  ];

  let suffixes = [
    "o",
    "ao",
    "an",
    "am",
    "un",
    "uy",
    "to",
    "va",
    "du",
    "ado",
    "ano",
    "ast",
    "est",
    "il",
    "gro",
    "shec",
    "sheb",
    "rep",
    "aab",
    "oic",
  ];

  return iarnd.item(prefixes) + iarnd.item(suffixes);
}
