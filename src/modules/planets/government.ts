import * as RND from "../random";

export function generate(): string {
  const governmentTypes = [
    [
      "feudal theocracy",
      "autocratic theocracy",
      "totalitarian theocracy",
    ],
    [
      "representative democracy",
      "direct democracy",
      "republic",
      "parliamentary republic",
    ],
    [
      "corporatocracy",
      "feudal technocracy",
      "technocratic republic",
    ],
    [
      "absolute monarchy",
      "monarchy",
      "constitutional monarchy",
      "feudal monarchy",
    ],
  ];

  return RND.item(RND.item(governmentTypes));
}
