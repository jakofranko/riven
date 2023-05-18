import Node from '../node.js';

export default function Subtract(id, riven, rect) {
  Node.call(this, id, riven, rect);

  // this.glyph = 'M60,60 L60,60 L150,120 L240,120 M60,150 L60,150 L240,150 M60,240 L60,240 L150,180 L240,180';
  this.glyph = 'M60,150 L60,150 L240,150 M60,180 L60,180 L180,180 M60,120 L60,120 L180,120';

  this.subtract = function (initialValue = 0) {
    return Object.values(this.request()).reduce((acc, val) => { return acc - val; }, initialValue);
  };

  this.receive = function (payload) {
      // Don't pass anything beyond a string or number to `subtract`.
      // If the payload is a boolean, simply pass through, since
      // it is likely being initiated with a `bang` command.
      let p;
      if (typeof payload === 'boolean') {
          p = 0;
      } else if (typeof payload != 'number' && typeof payload != 'string') {
        p = null;
      } else {
        p = Number(payload);
      }

    if (Number.isNaN(p)) {
        console.error(`Recieved ${payload} to an Subtract node, which is not a number`);
        p = null;
    }

    this.send(this.subtract(p));
  };

  this.answer = function () {
    return this.subtract();
  };
}
