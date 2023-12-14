import Blue from "./blue.frag";
import BlueWhite from "./blue_white.frag";
import Orange from "./orange.frag";
import Red from "./red.frag";
import White from "./white.frag";
import Yellow from "./yellow.frag";
import YellowWhite from "./yellow_white.frag";

export function all(): string[] {
  return [Red, Orange, Yellow, YellowWhite, White, BlueWhite, Blue];
}

export function getByName(name: string): string {
  switch (name) {
    case "red":
      return Red;
    case "orange":
      return Orange;
    case "yellow":
      return Yellow;
    case "yellow-white":
      return YellowWhite;
    case "white":
      return White;
    case "blue-white":
      return BlueWhite;
    case "blue":
      return Blue;
    default:
      return White;
  }
}
