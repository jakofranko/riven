import Node from '../node.js';

export default function Value(id, riven, rect, val) {
  Node.call(this, id, riven, rect);

  this.glyph = 'M60,60 L60,60 L240,60 L240,240 L60,240 Z M240,150 L240,150 L150,150 L150,240';

  this.label = val ? `${this.id}=${val}` : this.id;

  this.answer = function () {
    return val;
  };
}
