"use strict";
function getMessage(a,b) {
  switch (typeof(a)) {
    case "boolean":
      if (a) {
        return  "Переданное GIF-изображение анимировано и содержит" + " " + b + " " + "кадров";
      }
      else
        return "Переданное GIF-изображение не анимировано";
      break;
    case  "number":
      return  "Переданное SVG-изображение содержит" + " " + a + " " + "объектов и" + " " + (b * 4) + " " + "аттрибутов";
      break;
    case "object":
      if (typeof(b) === "object") {
        return "test";
      }
      else {
        var sum = 0;
        for(var i =0; i < a.length; i++) {
          sum += a[i];
        }
        return "Количество красных точек во всех строчках изображения:" + " " + sum;
      }
      break;
    default:
      return "hello" + b;
  }
}
