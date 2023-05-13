import Node from '../node.js';

export default function Equals(id, riven, rect) {
  Node.call(this, id, riven, rect);

  this.glyph = 'M60,60 L60,60 L150,120 L240,120 M60,150 L60,150 L240,150 M60,240 L60,240 L150,180 L240,180';

  this.receive = function (q) {
    (this.signal(q) ? this.signal(q) : this.signal('else')).receive();
  };
}
