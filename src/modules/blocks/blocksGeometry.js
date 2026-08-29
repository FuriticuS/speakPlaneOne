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

// Разбор строки bbox "x1,y1,x2,y2" в массив чисел.
export const parseBbox = (bbox) => (bbox ? bbox.split(',').map(Number) : null);
