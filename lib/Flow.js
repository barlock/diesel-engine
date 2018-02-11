"use strict";

const _ = require("lodash");

class Flow {
    constructor (config) {
        this._config = config;

        this._recievers = _(config.nodes)
            .flatMap(node => node.recieve
                .map(receiver => Object.assign({}, receiver, {
                    parentNode: node,
                    parentFlow: this
                }))
            )
            .value()
    }

    get name () {
        return this._config.name;
    }

    get nodes () {
        return this._config.nodes;
    }

    receivers (action) {
        return this._recievers
            .filter(receiver => receiver.type === action.type)
    }

    startReceivers (action) {
        return this.receivers(action)
            .filter(receiver => receiver.parentNode.type === "start")
    }
}

module.exports = Flow;


