"use strict";

export default abstract class NameGenerator {
  name: string;
  patterns: string[];

  generate: Function;
}
