import Port from './port.js';
import { PORT_TYPES } from './constants.js';

// NODE prototype
// A Node contains a set of ports, identifying data, and utilities for displaying the node on the graph.
// It also has a set of life cycle functions: create, request, answer, recieve, send etc.
export default function Node(
    id,
    riven,
    rect = { x: 0, y: 0, w: 2, h: 2 }
) {
    this.id = id;           // This is how the node will be queried
    this.rect = rect;       // Used when graphing the node
    this.riven = riven;     // The host riven network
    this.parent = null;
    this.children = [];
    this.label = id;        // Label text displayed when graphing the node
    this.name = this.constructor.name.toLowerCase();
    this.glyph = 'M155,65 A90,90 0 0,1 245,155 A90,90 0 0,1 155,245 A90,90 0 0,1 65,155 A90,90 0 0,1 155,65 Z';
    this.ports = {
        input: new Port(this, 'in', PORT_TYPES.input),
        output: new Port(this, 'out', PORT_TYPES.output),
        answer: new Port(this, 'answer', PORT_TYPES.answer),
        request: new Port(this, 'request', PORT_TYPES.request)
    };

    // Creating a Node will add it to the selector's network,
    // as well as define it's position (only used when graphing),
    // it's special Type (required for any functionality beyond pass thru),
    // and pass any other parameters to the new Type.
    this.create = function(
        pos = { x: 0, y: 0 },
        Type,
        ...params
    ) {
        if (!Type) {
            console.warn(`Unknown NodeType for #${this.id}`);
            return this;
        }

        // Assign the new x and y values to the rect for graphing
        this.rect = {
            ...this.rect,
            ...pos
        };

        const node = new Type(this.id, this.riven, this.rect, ...params);

        this.riven.add(node);
        return node;
    };

    // CONNECT

    this.connect = function(q, syphon) {
        if (q instanceof Array) {
            for (const id in q) {
                this.connect(q[id], syphon);
            }
        } else if (this.riven.selector(q)) {
            const port = syphon ? this.ports.request : this.ports.output;
            const target = syphon ? this.riven.selector(q).ports.answer : this.riven.selector(q).ports.input;

            if (!port) {
                console.warn(`Unknown: ${q}`);
                return;
            }

            port.connect(target);
        } else {
            console.warn(`Unknown ${q}`);
        }
    };

    this.syphon = function(q) {
        this.connect(q, true);
    };

    this.bind = function(q) {
        this.connect(q);
        this.syphon(q);
    };

    // SEND/RECEIVE
    // By default will pass payload,
    // a reference to this node,
    // and the current route to the route's host's recieve function.
    this.send = function(payload) {
        for (const routeId in this.ports.output.routes) {
            const route = this.ports.output.routes[routeId];
            if (!route) {
                continue;
            }
            route.host.receive(payload, this, route);
        }
    };

    // By default will pass q, origin, and route
    // to all output ports.
    this.receive = function(q, origin, route) {
        const port = this.ports.output;
        for (const routeId in port.routes) {
            const r = port.routes[routeId];
            if (r) {
                route.host.receive(q, origin, route);
            }
        }
    };

    this.bang = function() {
        this.send(true);
    };

    // REQUEST/ANSWER

    this.request = function(q) {
        const payload = {};
        for (const routeId in this.ports.request.routes) {
            const route = this.ports.request.routes[routeId];
            if (!route) {
                continue;
            }
            const answer = route.host.answer(q, this, route);
            if (!answer) {
                continue;
            }
            payload[route.host.id] = answer;
        }
        return payload;
    };

    // By default, this will also get passed the origin node
    // and the route from the origin node's request function.
    this.answer = function(q) {
        return this.request(q);
    };

    // Target

    this.signal = function(target) {
        for (const portId in this.ports) {
            const port = this.ports[portId];
            for (const routeId in port.routes) {
                const route = port.routes[routeId];
                if (!route || !route.host || route.host.id !== target.toLowerCase()) {
                    continue;
                }
                return route.host;
            }
        }
        return null;
    };
}
