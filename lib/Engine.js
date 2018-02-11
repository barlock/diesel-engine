"use strict";

const compose = require("koa-compose"),
    fs = require("fs-extra"),
    path = require("path"),
    yaml = require("js-yaml"),
    uid = require("uid-safe"),
    _ = require("lodash"),
    Flow = require("./Flow"),
    localStore = require("./local-store");

class Engine {
    constructor ({ store = localStore()}) {
        this._store = store;

        this._plugins = {};
        this._flows = [];
        this._middleware = [];

        this.use(this._addEngineMiddleware)
    }

    plugin (name, plugin) {
        this._plugins[name] = plugin;
    }

    _addEngineMiddleware ({ action, state }, next) {

    }

    async addFlows (flowDir) {
        const flows = await fs.readdir(flowDir)
            .then(files => Promise.all(
                files.map(file => fs.readFile(path.join(flowDir, file), "utf8"))))
            .then(yml => yaml.safeLoad(yml))
            .then(flowConfig => new Flow(flowConfig));

        this._flows = this._flows.concat(flows);
    }

    use (middleware) {
        this._middleware.push(middleware);
    }

    _getActionReceiver (action) {
        const [ actionPlugin, actionType ] = action.type.split(".");

        return this._plugins[actionPlugin] &&
            this._plugins[actionPlugin].receiver &&
            this._plugins[actionPlugin].receiver[actionType]
    }

    async _act (action, nodeName, node, state = {}) {
        const [ pluginName , nodeType ] = node.type.split(".");
        const plugin = this._plugins[pluginName];

        if (!plugin.node && plugin.node[nodeType]) {
            console.error(`Can't act, ${node.type} doesn't exist`);
            return;
        }

        await plugin.node[nodeType](nodeName, node.spec, action, state)
    }

    _dispatchToFlow(flow, action) {
        flow.startReceivers(action)
            .filter(flowReceiver => action.receiver(action, flowReceiver.spec))
            .forEach(flowReceiver => {
                const { next, parentFlow: flow } = flowReceiver;

                next.forEach(async nodeName => {
                    const node = flow.nodes[nodeName];

                    if (!node) {
                        console.error(`Couldn't process ${action.type} as ${nodeName} doesn't exist in ${flow.name}`);
                    } else {
                        await this._act(action, nodeName, flow.nodes[nodeName]);
                    }
                })
            });
    }

    async dispatch (action) {
        action.receiver = this._getActionReceiver(action);

        if (!action.receiver) {
            console.log(`No plugin receiver to process ${action.type}`);
            return;
        }

        await compose(this._middleware)({ action, state: {} });

        return Promise.all(this._flows
            .map(async flow => this._dispatchToFlow(flow, action)));
    }
}

module.exports = Engine;
