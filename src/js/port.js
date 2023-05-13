import { PORT_TYPES } from './constants.js';

// PORT prototype
// A port has a host node, an ID and type,
// and a list of routes. Routes are other ports.
// When a Node is connected to another node, the node's
// connection method will invoke the appropriate input port's
// connect method, passing the appropriate output port from
// the other node as the parameter: Node A{input port} -> Node B{output port}
// Node's don't ever interact directly, everything happens through their ports.
//
// Example: When a Node `send`s a payload, it loops through its output port's routes,
// and sends the payload to every output route's host node's `recieve` method.
export default function Port(host, id, type = PORT_TYPES.default) {
    this.host = host;
    this.id = id;
    this.type = type;
    this.routes = [];

    this.connect = function(port) {
        if (!port) {
            console.warn(`Unknown port from: ${this.host.id}`);
            return;
        }
        this.routes.push(port);
    };
}
