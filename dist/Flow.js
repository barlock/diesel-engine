"use strict";

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _ = require("lodash");

var Flow = function () {
  function Flow(config) {
    var _this = this;

    (0, _classCallCheck3.default)(this, Flow);

    this._config = config;

    this._acceptors = _(config.states).filter(function (state) {
      return state.accepts;
    }).flatMap(function (state) {
      return state.accepts.map(function (acceptor) {
        return (0, _assign2.default)({}, acceptor, {
          parentState: state,
          parentFlow: _this
        });
      });
    }).value();
  }

  (0, _createClass3.default)(Flow, [{
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