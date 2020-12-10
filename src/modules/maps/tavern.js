var _ = require("lodash");
const random = require("random");

export function generate() {
  let width = random.int(600, 800);
  let height = random.int(400, 600);

  let svg =
    '<svg width="900" height="700" xmlns="http://www.w3.org/2000/svg" version="1.1">';

  svg += "<style>.label { font-weight: 700;}</style>";

  svg += '<rect x="0" y="0" width="900" height="700" fill="white"/>';

  let done = false;
  let rooms = [{ x: 0, y: 0, width: width, height: height }];
  let minimumArea = Math.floor(width * height * 0.1);
  let numberOfSplits = 0;
  let roomCount = 0;

  while (!done) {
    let newRooms = [];
    let commonRoomCount = 0;
    for (let i = 0; i < rooms.length; i++) {
      let shouldSplit = false;
      let roomArea = rooms[i].width * rooms[i].height;

      if (commonRoomCount < 1) {
        shouldSplit = true;
      } else if (
        roomArea > minimumArea &&
        roomCount > 1 &&
        rooms[i].name != "common room"
      ) {
        shouldSplit = true;
      }

      if (shouldSplit) {
        let splitType = "horizontal";
        let splitAmount = random.float(0.25, 0.55);

        if (rooms[i].width > rooms[i].height) {
          splitType = "vertical";
        }

        if (commonRoomCount == 0) {
          splitAmount = random.float(0.7, 0.8);
        }

        if (splitType == "vertical") {
          let newX1 = rooms[i].x;
          let newY1 = rooms[i].y;
          let newWidth1 = Math.floor(rooms[i].width * splitAmount);
          let newHeight1 = rooms[i].height;

          let newRoom1 = {
            x: newX1,
            y: newY1,
            width: newWidth1,
            height: newHeight1,
            name: "",
          };

          if (commonRoomCount == 0) {
            commonRoomCount = 1;
            newRoom1.name = "common room";
          }

          newRooms.push(newRoom1);

          let newX2 = Math.floor(rooms[i].width * splitAmount) + rooms[i].x;
          let newY2 = rooms[i].y;
          let newWidth2 = rooms[i].width - newWidth1;
          let newHeight2 = rooms[i].height;
          let newRoom2 = {
            x: newX2,
            y: newY2,
            width: newWidth2,
            height: newHeight2,
            name: "",
          };

          if (commonRoomCount == 0) {
            commonRoomCount = 1;
            newRoom2.name = "common room";
          }

          newRooms.push(newRoom2);
        } else {
          let newX1 = rooms[i].x;
          let newY1 = rooms[i].y;
          let newWidth1 = rooms[i].width;
          let newHeight1 = Math.floor(rooms[i].height * splitAmount);
          let newRoom1 = {
            x: newX1,
            y: newY1,
            width: newWidth1,
            height: newHeight1,
            name: "",
          };

          if (commonRoomCount == 0) {
            commonRoomCount = 1;
            newRoom1.name = "common room";
          }

          newRooms.push(newRoom1);

          let newX2 = rooms[i].x;
          let newY2 = Math.floor(rooms[i].height * splitAmount) + rooms[i].y;
          let newWidth2 = rooms[i].width;
          let newHeight2 = rooms[i].height - newHeight1;
          let newRoom2 = {
            x: newX2,
            y: newY2,
            width: newWidth2,
            height: newHeight2,
            name: "",
          };

          if (commonRoomCount == 0) {
            commonRoomCount = 1;
            newRoom2.name = "common room";
          }

          newRooms.push(newRoom2);
        }
        numberOfSplits++;
      } else {
        newRooms.push(rooms[i]);
      }
    }

    rooms = _.cloneDeep(newRooms);
    roomCount = rooms.length;

    if (numberOfSplits >= 2 && commonRoomCount == 1) {
      done = true;
    }
  }

  svg += "<g>";

  let lastLabel = "";

  for (let i = 0; i < rooms.length; i++) {
    if (rooms[i].name != "common room") {
      if (lastLabel == "common room") {
        rooms[i].name = "bar";
      }
    }

    let roomSVG =
      '<rect x="' +
      rooms[i].x +
      '" y="' +
      rooms[i].y +
      '" width="' +
      rooms[i].width +
      '" height="' +
      rooms[i].height +
      '" stroke="black" fill="white"/>';

    if (rooms[i].name != "") {
      let labelX = rooms[i].x + rooms[i].width / 2;
      let labelY = rooms[i].y + rooms[i].height / 2;

      roomSVG +=
        '<text x="' +
        labelX +
        '" y="' +
        labelY +
        '" class="label" text-anchor="middle">' +
        rooms[i].name +
        "</text>";
    }

    svg += roomSVG;
    lastLabel = rooms[i].name;
    console.log(rooms[i]);
  }
  svg += "</g>";

  svg += "</svg>";

  return svg;
}
