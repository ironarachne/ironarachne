import * as RND from "@ironarachne/rng";

export function generate() {
  return `${getCSFront()} ${getCSEntry()} ${getCSProductDisplays()} ${getCSCustomers()} ${getCSBack()}`;
}

function getCSFront() {
  const choices = [
    "Outside, a large neon sign proclaims the name of the shop, the brightness of the writing diffused by thick smog.",
    "A vagrant slumps against the wall next to the door of the shop. He clutches a brown paper bag in his good hand, the other hand a wreckage of cybernetics that no longer appear functional.",
    "The shop's dark exterior walls are offset by neon lights bordering the doorway, giving it the appearance of a portal into another world.",
    "An automated sentry drone hovers in front of the entrance, scanning each person who approaches with its red, glowing eyes.",
    "A group of shady-looking individuals loiter near the entrance, smoking synthetic cigarettes and eyeing newcomers with suspicion.",
    "A pair of heavily augmented bouncers stand guard outside the shop, their bulging muscles and implants suggesting they're more machine than man.",
    "A holographic projection of the shop's logo hovers above the entrance, flickering slightly in the rain.",
    "The entrance is flanked by two imposing statues, their metal bodies twisted into menacing poses. Their glowing eyes seem to follow you as you approach.",
    "A colorful graffiti mural covers the entire front of the building, depicting a variety of cyborgs and tech-enhanced creatures engaged in battle.",
  ];

  return RND.item(choices);
}

function getCSEntry() {
  const choices = [
    "As you go inside, you notice a handful of locals watch you with hard eyes, then turn away.",
    "You open the door to the shop, and a soft chime announces your entry.",
    "Entry to the shop sets off a soft chime to alert the staff.",
    "The door slides open with a hiss of compressed air, revealing a dimly lit interior that smells of ozone and lubricant.",
    "As you step inside, you're greeted by a robotic voice that welcomes you to the shop and asks if you need assistance.",
    "The shop's entrance is guarded by a biometric scanner that scans your DNA and implants before allowing you to enter.",
    "The entrance leads into a narrow hallway, its walls lined with posters advertising the latest cybernetic enhancements.",
    "A burly bouncer stationed at the entrance eyes you suspiciously before nodding you through.",
    "The shop's entrance is disguised as a run-down convenience store, complete with shelves stocked with junk food and old magazines.",
    "The entrance is hidden behind a false wall, which slides open to reveal the shop's interior.",
  ];

  return RND.item(choices);
}

function getCSProductDisplays() {
  const displayScreens = [
    "Each of the shop's offerings is shown on a screen that takes up an entire wall. The screens are so bright and high definition that the cybernetic enhancements seem almost real.",
    "An enormous display dominates the center of the room. It rotates slowly, displaying different cybernetic upgrades from different angles. It's hard to tell whether they're real or just simulations.",
    "The shop's wares are displayed on large screens placed throughout the front room. Each screen is accompanied by a brief description of the product, its features, and its cost.",
    "In the center of the front room stands a circular pedestal, on which rests a holographic model of the human body. A technician stands nearby, gesturing to different parts of the model and explaining the different cybernetic upgrades that can be applied.",
    "A row of large, glass cabinets lines one wall of the room. Each cabinet contains a different type of cybernetic enhancement, from basic limb replacements to advanced neural implants.",
    "Several virtual reality pods are arranged around the room. Each pod simulates a different cybernetic enhancement, allowing customers to experience the upgrade before they buy it.",
    "The front room is dominated by a massive wall of screens, each displaying a different cybernetic enhancement. A couple attendants in bright uniforms stand nearby, answering questions and offering advice.",
    "In the back of the room, a massive machine hums quietly. A sign above it reads: 'Custom Cybernetics Fabricator'. The machine can be programmed to create custom cybernetic enhancements on demand.",
  ];

  const modelCybernetics = [
    "A handful of model cybernetics lay strewn haphazardly on shelves in the front room. Beside the shelves are a couple old displays, their screens flickering and dull.",
    "An assortment of cybernetic enhancements are displayed on a series of shelves that line the walls of the room. Some of the enhancements are missing pieces, others are covered in dust.",
    'A small table in the center of the room holds several model cybernetic enhancements. A sign beside the table reads: "Ask us how we can turn these models into reality."',
    "The front room is cluttered with various cybernetic upgrades, ranging from simple limb replacements to advanced neural implants. The upgrades are displayed on shelves, on pedestals, and even on the floor.",
    "Several mannequins stand in the center of the room, each wearing a different cybernetic enhancement. The mannequins are surrounded by spotlights, giving them an almost lifelike appearance.",
  ];

  const attendants = [
    "A couple attendants in bright uniforms greet customers and answer questions about the shop's offerings.",
    "Several attendants mill about the room, offering assistance and advice to customers. They wear bright, colorful uniforms that contrast sharply with the dark surroundings.",
    "The attendants in the shop wear matching jumpsuits emblazoned with the shop's logo. They seem to be constantly in motion, moving from one customer to another and offering advice on the various cybernetic upgrades.",
    "As you enter the shop, a group of attendants rush forward to greet you. They each wear a different color jumpsuit, but all have the same eager expression.",
    "The attendants in the shop are all wearing augmented reality glasses, which display information about the various cybernetic upgrades as they move through the room.",
  ];

  const choices = [...displayScreens, ...modelCybernetics, ...attendants];

  return RND.item(choices);
}

function getCSCustomers() {
  const choices = [
    "A few customers silently shuffle through the displays or wait in the small lobby for patients.",
    "One or two people wait in the back for their turn under the knife.",
    "Several people are standing in front of the display screens, flipping curiously through the options. The chairs and benches in the patient lobby are all full.",
    "The waiting room is packed with customers, some impatiently pacing back and forth, while others sit quietly reading magazines or staring at their cybernetic enhancements.",
    "A group of customers huddle together in the corner, whispering excitedly about the latest cybernetic enhancements available at the shop.",
    "A lone customer sits in the corner, lost in thought as they consider their options for upgrading their body with cybernetic enhancements.",
    "A line of customers stretches out the door and around the block, all eager to experience the latest in cybernetic technology.",
    "A few customers argue loudly with the attendants over the cost of the enhancements, while others look on in annoyance.",
    "A pair of customers stand at the counter, haggling with the attendant over the price of a particularly expensive enhancement.",
    "A group of customers sit around a table in the corner, sharing stories about their cybernetic upgrades and comparing notes on their experiences.",
  ];

  return RND.item(choices);
}

function getCSBack() {
  const rooms = [
    "operating room",
    "cyberlab",
    "research and development area",
    "operation facility",
  ];
  const roomChoice = RND.item(rooms);

  const tools = [
    "microscalpels",
    "precision drills",
    "laser scalpels",
    "cybernetic grafting tools",
  ];
  const toolChoice = RND.item(tools);

  const technicians = [
    "Two technicians in immaculate uniforms",
    "A team of cyber specialists",
    "A group of cyberpunk techies",
    "An experienced team of surgeons",
  ];
  const technicianChoice = RND.item(technicians);

  const roomDescription = `The ${roomChoice} is dimly lit and filled with the hum of electronic equipment. `;
  const toolDescription = `Rows of ${toolChoice} line the walls, ready to be used at a moment's notice. `;
  const technicianDescription = ` ${technicianChoice} stand ready to assist the cyberdoc in any way necessary.`;

  return roomDescription + toolDescription + technicianDescription;
}
