"use strict";

import * as RND from "./random";

export function generate() {
  return getCSFront() +
    " " +
    getCSEntry() +
    " " +
    getCSProductDisplays() +
    " " +
    getCSCustomers() +
    " " +
    getCSBack();
}

function getCSFront() {
  let choices = [
    "Outside, a large neon sign proclaims the name of the shop, the brightness of the writing diffused by thick smog.",
    "A vagrant slumps against the wall next to the door of the shop. He clutches a brown paper bag in his good hand, the other hand a wreckage of cybernetics that no longer appear functional.",
    "The shop's dark exterior walls are offset by neon lights bordering the doorway, giving it the appearance of a portal into another world.",
  ];

  return RND.item(choices);
}

function getCSEntry() {
  let choices = [
    "As you go inside, you notice a handful of locals watch you with hard eyes, then turn away.",
    "You open the door to the shop, and a soft chime announces your entry.",
    "Entry to the shop sets off a soft chime to alert the staff.",
  ];

  return RND.item(choices);
}

function getCSProductDisplays() {
  let choices = [
    "The shop's wares are displayed on large screens placed throughout the front room.",
    "A handful of model cybernetics lay strewn haphazardly on shelves in the front room. Beside the shelves are a couple old displays, their screens flickering and dull.",
    "Each of the shop's offerings is shown on a screen that takes up an entire wall.",
    "A couple attendants in bright uniforms greet customers and answer questions about the shop's offerings.",
  ];

  return RND.item(choices);
}

function getCSCustomers() {
  let choices = [
    "A few customers silently shuffle through the displays or wait in the small lobby for patients.",
    "One or two people wait in the back for their turn under the knife.",
    "Several people are standing in front of the display screens, flipping curiously through the options. The chairs and benches in the patient lobby are all full.",
  ];

  return RND.item(choices);
}

function getCSBack() {
  let choices = [
    "The operating room is bright and clean. Two technicians in immaculate uniforms assist the cyberdoc.",
    "In the back, a single operating table sits in the center of the room surrounded by harsh white lights.",
    "In the back, the sole cyberdoc of the shop stands over an operating table. Tools of various types and sizes sit on shelves nearby.",
  ];

  return RND.item(choices);
}
