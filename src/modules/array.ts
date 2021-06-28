"use strict";

export function remove(element: any, sourceArray: any[]) {
  return sourceArray.filter(function (element, value) {
    return element !== value;
  });
}
