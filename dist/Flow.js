"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ = require("lodash");

var Flow = function () {
  function Flow(config) {
    var _this = this;

    _classCallCheck(this, Flow);

    this._config = config;

    this._acceptors = _(config.states).filter(function (state) {
      return state.accepts;
    }).flatMap(function (state) {
      return state.accepts.map(function (acceptor) {
        return Object.assign({}, acceptor, {
          parentState: state,
          parentFlow: _this
        });
      });
    }).value();
  }

  _createClass(Flow, [{
    key: "state",
    value: function state(_state) {
      return this._config.states.find(function (flowState) {
        return flowState.name === _state;
      });
    }
  }, {
    key: "acceptors",
    value: function acceptors(action) {
      return this._acceptors.filter(function (acceptors) {
        return acceptors.type === action.type;
      });
    }
  }, {
    key: "startAcceptors",
    value: function startAcceptors(action) {
      return this.acceptors(action).filter(function (acceptor) {
        return acceptor.parentState.start;
      });
    }
  }, {
    key: "name",
    get: function get() {
      return this._config.name;
    }
  }, {
    key: "nodes",
    get: function get() {
      return this._config.nodes;
    }
  }]);

  return Flow;
}();

module.exports = Flow;