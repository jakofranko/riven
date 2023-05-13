import Node from '../node.js';

export default function Add(id, riven, rect) {
  Node.call(this, id, riven, rect);

  this.glyph = 'M60,60 L60,60 L150,120 L240,120 M60,150 L60,150 L240,150 M60,240 L60,240 L150,180 L240,180';

  this.add = function () {
    return Object.values(this.request()).reduce((acc, val) => { return acc + val; }, 0);
  };

  this.receive = function () {
    this.send(this.add());
  };

  this.answer = function () {
    return this.add();
  };
}
