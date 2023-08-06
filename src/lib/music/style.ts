"use strict";

export default class MusicStyle {
  rhythm: string;
  beat: string;
  dynamic: string;
  harmony: string;
  melody: string;
  pitch: string;
  key: string;
  timbre: string;
  description: string;

  constructor(
    rhythm: string,
    beat: string,
    dynamic: string,
    harmony: string,
    melody: string,
    pitch: string,
    key: string,
    timbre: string,
  ) {
    this.rhythm = rhythm;
    this.beat = beat;
    this.dynamic = dynamic;
    this.harmony = harmony;
    this.melody = melody;
    this.pitch = pitch;
    this.key = key;
    this.timbre = timbre;
    this.description = "";
  }
}
