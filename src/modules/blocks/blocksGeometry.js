import { BLOCK } from '../../config/constants.js';

// Ёмкость текста блока: сколько символов влезает в прямоугольник.
export const capacity = (width, height) =>
  Math.floor((width * height) / (BLOCK.CHAR_WIDTH * BLOCK.LINE_HEIGHT));

// Позиция нового блока, приклеенного к грани `edge` родителя.
// Мировые координаты, ось Y направлена вниз (как на экране).
export const positionForEdge = (parent, edge, width, height) => {
  switch (edge) {
    case 'north':
      return { x: parent.x, y: parent.y - height };
    case 'south':
      return { x: parent.x, y: parent.y + parent.height };
    case 'east':
      return { x: parent.x + parent.width, y: parent.y };
    case 'west':
      return { x: parent.x - width, y: parent.y };
    default:
      return { x: parent.x, y: parent.y };
  }
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// Позиция нового блока, прижатого к грани `edge` родителя, но сдвинутого вдоль
// этой грани как можно ближе к точке клика (px, py). Благодаря сдвигу блок может
// лечь в пустоту между несколькими соседями и «примагнититься» сразу к нескольким
// блокам, а не только к одной свободной грани одного родителя.
export const positionAdjacent = (parent, edge, width, height, px, py) => {
  switch (edge) {
    case 'north':
      return {
        x: clamp(px - width / 2, parent.x - width, parent.x + parent.width),
        y: parent.y - height,
      };
    case 'south':
      return {
        x: clamp(px - width / 2, parent.x - width, parent.x + parent.width),
        y: parent.y + parent.height,
      };
    case 'east':
      return {
        x: parent.x + parent.width,
        y: clamp(py - height / 2, parent.y - height, parent.y + parent.height),
      };
    case 'west':
      return {
        x: parent.x - width,
        y: clamp(py - height / 2, parent.y - height, parent.y + parent.height),
      };
    default:
      return { x: parent.x, y: parent.y };
  }
};

// Разбор строки bbox "x1,y1,x2,y2" в массив чисел.
export const parseBbox = (bbox) => (bbox ? bbox.split(',').map(Number) : null);
