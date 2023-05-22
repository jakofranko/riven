// "Don't forget, the portal combination's in my journal."" — Catherine

import Node from './node.js';
import {
    Add,
    Subtract,
    Bang,
    Concat,
    Console,
    Equals,
    Mesh,
    Print,
    Value
} from './nodes';
import {
    GRID_SIZE,
    PORT_TYPES
} from './constants';

// Creates a new instance of Riven.
// An instance of Riven contains a library of default nodes, and the network of nodes,
// the selector function which will be the main touch point with Riven,
// and a graph function which can be used to visualize the instance network of nodes.
function Riven() {
    this.lib = {
        Node,
        Add,
        Subtract,
        Bang,
        Concat,
        Console,
        Equals,
        Mesh,
        Print,
        Value
    };
    this.network = {};

    const self = this;

    this.Ø = function(id) {
        const node = self.network[id];
        if (!node) {
            return new Node(id, self); // Passing `this` can allow the Node to be added to this instance of Riven
        }

        return node;
    };

    this.graph = function(parentId) {
        const { network, el } = self;

        if (!el) {
            self.el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            self.el.id = 'riven';
            parentId
                ? document.getElementById(parentId).appendChild(self.el)
                : document.body.appendChild(self.el);
        }

        const _routes = Object.keys(network).reduce((acc, val) => {
            return `${acc}${drawRoutes(network[val])}`;
        }, '');

        const _nodes = Object.keys(network).reduce((acc, val) => {
            return `${acc}${drawNode(network[val])}`;
        }, '');

        self.el.innerHTML = `<g id='viewport'><g id='routes'>${_routes}</g><g id='nodes'>${_nodes}</g></g>`;

        function drawRoutes(node) {
            let html = '';
            for (const id in node.ports) {
                const port = node.ports[id];
                for (const routeId in port.routes) {
                    const route = port.routes[routeId];
                    if (!route) {
                        continue;
                    }
                    html += route ? drawConnection(port, route) : ''; // ternary not needed, since !route will continue.
                }
            }
            return html;
        }

        function drawNode(node) {
            const rect = getRect(node);
            return `
        <g class='node ${node.name}' id='node_${node.id}'>
          <rect rx='2' ry='2' x=${rect.x} y=${rect.y - (GRID_SIZE / 2)} width="${rect.w}" height="${rect.h}" class='${node.children.length === 0 ? 'fill' : ''}'/>
          <text x="${rect.x + (rect.w / 2) + (GRID_SIZE * 0.3)}" y="${rect.y + rect.h + (GRID_SIZE * 0.2)}">${node.label}</text>
          ${drawPorts(node)}
          ${drawGlyph(node)}
        </g>`;
        }

        function drawPorts(node) {
            return Object.keys(node.ports).reduce((acc, val) => {
                return `${acc}${drawPort(node.ports[val])}`;
            }, '');
        }

        function drawGlyph(node) {
            const rect = getRect(node);
            return node.glyph ? `<path class='glyph' transform="translate(${rect.x + (GRID_SIZE / 4)},${rect.y - (GRID_SIZE / 4)}) scale(0.1)" d='${node.glyph}'/>` : '';
        }

        function drawPort(port) {
            const pos = port ? getPortPosition(port) : {
                x: 0,
                y: 0
            };
            const r = GRID_SIZE / 6;
            return `<g class='port ${port.id}' id='${port.host.id}_port_${port.id}'><path d='M${pos.x - (r)},${pos.y} L${pos.x},${pos.y - (r)} L${pos.x + (r)},${pos.y} L${pos.x},${pos.y + (r)} Z'/></g>`;
        }

        function drawConnection(a, b) {
            if (isBidirectional(a.host, b.host)) {
                return a.type !== PORT_TYPES.output ? drawConnectionBidirectional(a, b) : '';
            }
            if (a.type === PORT_TYPES.entry) {
                return drawConnectionEntry(a, b);
            }
            if (b.type === PORT_TYPES.exit) {
                return drawConnectionExit(a, b);
            }

            // I think self is a bug?
            return a.type === PORT_TYPES.output || a.type === PORT_TYPES.output ? drawConnectionOutput(a, b) : drawConnectionRequest(a, b);
        }

        function isBidirectional(a, b) {
            // Might be another bug; `b` is never referenced
            for (const id in a.ports.output.routes) {
                const routeA = a.ports.output.routes[id];
                for (const id in a.ports.request.routes) {
                    const routeB = a.ports.request.routes[id];
                    if (routeA.host.id === routeB.host.id) {
                        return true;
                    }
                }
            }
            return false;
        }

        function drawConnectionOutput(a, b) {
            const posA = getPortPosition(a);
            const posB = getPortPosition(b);
            const posM = middle(posA, posB);
            const posC1 = {
                x: (posM.x + (posA.x + GRID_SIZE)) / 2,
                y: posA.y
            };
            const posC2 = {
                x: (posM.x + (posB.x - GRID_SIZE)) / 2,
                y: posB.y
            };

            return `
        <path d="
          M${posA.x},${posA.y} L${posA.x + GRID_SIZE},${posA.y}
          Q${posC1.x},${posC1.y} ${posM.x},${posM.y}
          Q ${posC2.x},${posC2.y} ${posB.x - GRID_SIZE},${posB.y}
          L${posB.x},${posB.y}
        " class='route output'/>`;
        }

        function drawConnectionEntry(a, b) {
            const posA = getPortPosition(a);
            const posB = getPortPosition(b);

            return `
        <path d="
          M${posA.x},${posA.y} L${posA.x + GRID_SIZE},${posA.y}
          L${posA.x + GRID_SIZE},${posA.y}
          L${posA.x + GRID_SIZE},${posB.y}
          L${posB.x},${posB.y}
        " class='route entry'/>`;
        }

        function drawConnectionExit(a, b) {
            const posA = getPortPosition(a);
            const posB = getPortPosition(b);

            return `
        <path d="
          M${posA.x},${posA.y} L${posA.x + GRID_SIZE},${posA.y}
          L${posB.x - GRID_SIZE},${posA.y}
          L${posB.x - GRID_SIZE},${posB.y}
          L${posB.x},${posB.y}
        " class='route exit'/>`;
        }

        function drawConnectionRequest(a, b) {
            const posA = getPortPosition(a);
            const posB = getPortPosition(b);

            return `<path d="
          M${posA.x},${posA.y}
          L${posA.x},${posA.y + GRID_SIZE}
          L${posB.x},${posA.y + GRID_SIZE}
          L${posB.x},${posB.y}
        " class='route request'/>`;
        }

        function drawConnectionBidirectional(a, b) {
            const posA = getPortPosition(a);
            const posB = getPortPosition(b);
            const posM = middle(posA, posB);

            let path = '';

            path += `M${posA.x},${posA.y} L${posA.x},${posA.y + GRID_SIZE} `;
            path += `L${posA.x},${posM.y} L${posB.x},${posM.y}`;
            path += `L${posB.x},${posB.y - GRID_SIZE} L${posB.x},${posB.y}`;

            return `<path d="${path}" class='route bidirectional'/>`;
        }

        function getPortPosition(port) {
            const rect = getRect(port.host);
            let offset = {
                x: 0,
                y: 0
            };

            if (port.type === PORT_TYPES.output || port.type === PORT_TYPES.exit) {
                offset = {
                    x: rect.w,
                    y: (rect.h - (GRID_SIZE * 1.5))
                };
            } else if (port.type === PORT_TYPES.input || port.type === PORT_TYPES.entry) {
                offset = {
                    x: 0,
                    y: GRID_SIZE / 2
                };
            } else if (port.type === PORT_TYPES.answer) {
                offset = {
                    x: GRID_SIZE,
                    y: -GRID_SIZE * 0.5
                };
            } else if (port.type === PORT_TYPES.request) {
                offset = {
                    x: (rect.w - (GRID_SIZE)),
                    y: (rect.h - (GRID_SIZE / 2))
                };
            }
            return {
                x: rect.x + offset.x,
                y: rect.y + offset.y
            };
        }

        function getRect(node) {
            const w = node.rect.w * GRID_SIZE;
            const h = node.rect.h * GRID_SIZE;
            let x = node.rect.x * GRID_SIZE;
            let y = node.rect.y * GRID_SIZE;

            if (node.parent) {
                const offset = getRect(node.parent);
                x += offset.x;
                y += offset.y;
            }
            return {
                x: x + (2 * GRID_SIZE),
                y: y + (2 * GRID_SIZE),
                w: w,
                h: h
            };
        }

        function middle(a, b) {
            return {
                x: (a.x + b.x) / 2,
                y: (a.y + b.y) / 2
            };
        }

        // Cursor

        self.cursor = {
            host: null,
            el: document.createElement('cursor'),
            target: null,
            pos: {
                x: 0,
                y: 0
            },
            offset: {
                x: 0,
                y: 0
            },
            origin: null,
            install: function(host) {
                this.host = host;
                this.target = document.getElementById('viewport');
                self.el.appendChild(this.el);
                self.el.addEventListener('mousedown', (e) => {
                    this.touch({
                        x: e.clientX,
                        y: e.clientY
                    }, true);
                    e.preventDefault();
                });
                self.el.addEventListener('mousemove', (e) => {
                    this.touch({
                        x: e.clientX,
                        y: e.clientY
                    }, false);
                    e.preventDefault();
                });
                self.el.addEventListener('mouseup', (e) => {
                    this.touch({
                        x: e.clientX,
                        y: e.clientY
                    });
                    e.preventDefault();
                });
            },
            update: function() {
                this.target.style.transform = `translate(${parseInt(this.offset.x)}px,${parseInt(this.offset.y)}px)`;
                self.el.style.backgroundPosition = `${parseInt(this.offset.x * 0.75)}px ${parseInt(this.offset.y * 0.75)}px`;
            },
            touch: function(pos, click = null) {
                if (click === true) {
                    this.origin = pos;
                    return;
                }
                if (this.origin) {
                    this.offset.x += parseInt(pos.x - this.origin.x);
                    this.offset.y += parseInt(pos.y - this.origin.y);
                    this.update();
                    this.origin = pos;
                }
                if (click === null) {
                    this.origin = null;
                    return;
                }
                this.pos = pos;
            },
            magnet: function(val) {
                return (parseInt(val / GRID_SIZE) * GRID_SIZE) + (GRID_SIZE / 2);
            }
        };

        self.cursor.install(self);
    };
}

Riven.prototype.add = function(node) {
    this.network[node.id] = node;
};

globalThis.Riven = Riven;

export default Riven;
