import Node from '../node.js';

export default function Add(id, riven, rect) {
  Node.call(this, id, riven, rect);

  this.glyph = 'M60,60 L60,60 L150,120 L240,120 M60,150 L60,150 L240,150 M60,240 L60,240 L150,180 L240,180';

  this.add = function (initialValue = 0) {
    return Object.values(this.request()).reduce((acc, val) => { return acc + val; }, initialValue);
  };

  this.receive = function (payload) {
    // Don't pass anything beyond a string or number to `add`
    let p;
    if (typeof payload != 'number' && typeof payload != 'string') {
      p = null;
    } else {
      p = Number(payload);
    }

    if (Number.isNaN(p)) {
        console.error(`Recieved ${payload} to an Add node, which is not a number`);
        p = null;
    }

    this.send(this.add(p));
  };

  this.answer = function () {
    return this.add();
  };
}
