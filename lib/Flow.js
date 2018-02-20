"use strict";

const _ = require("lodash");

class Flow {
    constructor (config) {
      this._config = config;

      this._acceptors = _(config.states)
        .filter(state => state.accepts)
        .flatMap(state => state.accepts
          .map(acceptor => Object.assign({}, acceptor, {
            parentState: state,
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

    state (state) {
      return this._config.states.find(flowState => flowState.name === state);
    }

    acceptors (action) {
      return this._acceptors
        .filter(acceptors => acceptors.type === action.type)
    }

    startAcceptors (action) {
      return this.acceptors(action)
        .filter(acceptor => acceptor.parentState.start)
    }
}

module.exports = Flow;


