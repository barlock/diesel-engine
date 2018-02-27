"use strict";

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _objectDestructuringEmpty2 = require("babel-runtime/helpers/objectDestructuringEmpty");

var _objectDestructuringEmpty3 = _interopRequireDefault(_objectDestructuringEmpty2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var compose = require("koa-compose"),
    fs = require("fs-extra"),
    path = require("path"),
    yaml = require("js-yaml"),
    flatten = require('flat'),
    traverse = require('traverse'),
    jp = require('jsonpath'),
    uid = require("uid-safe"),
    _ = require("lodash"),
    Flow = require("./Flow");

var JSON_PATH_PATTERN = /^\$\./;

var Engine = function () {
  function Engine(_ref) {
    (0, _objectDestructuringEmpty3.default)(_ref);
    (0, _classCallCheck3.default)(this, Engine);

    this._plugins = {};
    this._flows = [];
    this._middleware = [];
    this._flowMiddleware = {};
  }

  (0, _createClass3.default)(Engine, [{
    key: "plugin",
    value: function plugin(name, _plugin) {
      var _this = this;

      this._plugins[name] = _plugin;

      (_plugin.middleware || []).forEach(function (middleware) {
        _this.use(middleware);
      });
    }
  }, {
    key: "_parseFlowYaml",
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(yml) {
        var docs, flow, actions;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return yaml.safeLoadAll(yml);

              case 2:
                docs = _context.sent;
                flow = docs.find(function (doc) {
                  return doc.states;
                });
                actions = _(docs).filter(function (doc) {
                  return doc.action;
                }).keyBy("name").value();


                // Map named actions to action definitions
                _(flow.states).filter(function (state) {
                  return state.actions;
                }).each(function (state) {
                  return state.actions.forEach(function (action, index) {
                    state.actions[index] = typeof action === "string" ? actions[action].action : action;
                  });
                });

                return _context.abrupt("return", flow);

              case 7:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function _parseFlowYaml(_x) {
        return _ref2.apply(this, arguments);
      }

      return _parseFlowYaml;
    }()
  }, {
    key: "_getFlowFromDisk",
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(flowFile) {
        var yml;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return fs.readFile(flowFile, "utf8");

              case 2:
                yml = _context2.sent;
                return _context2.abrupt("return", this._parseFlowYaml(yml));

              case 4:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function _getFlowFromDisk(_x2) {
        return _ref3.apply(this, arguments);
      }

      return _getFlowFromDisk;
    }()
  }, {
    key: "_addFlowsFromDir",
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(flowDir) {
        var _this2 = this;

        var files, flowConfigs, flows;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return fs.readdir(flowDir);

              case 2:
                files = _context3.sent;
                _context3.next = 5;
                return _promise2.default.all(files.map(function (file) {
                  return _this2._getFlowFromDisk(path.join(flowDir, file));
                }));

              case 5:
                flowConfigs = _context3.sent;
                flows = flowConfigs.map(function (config) {
                  return new Flow(config);
                });


                this._flows = this._flows.concat(flows);

              case 8:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function _addFlowsFromDir(_x3) {
        return _ref4.apply(this, arguments);
      }

      return _addFlowsFromDir;
    }()
  }, {
    key: "_addFlowMiddleware",
    value: function _addFlowMiddleware(middleware) {
      (0, _assign2.default)(this._flowMiddleware, flatten(middleware));
    }
  }, {
    key: "addFlows",
    value: function () {
      var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(_ref5) {
        var flowDir = _ref5.flowDir,
            middleware = _ref5.middleware;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return _promise2.default.all([this._addFlowsFromDir(flowDir), this._addFlowMiddleware(middleware)]);

              case 2:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function addFlows(_x4) {
        return _ref6.apply(this, arguments);
      }

      return addFlows;
    }()
  }, {
    key: "use",
    value: function use(middleware) {
      this._middleware.push(middleware);
    }
  }, {
    key: "_getActionAcceptor",
    value: function _getActionAcceptor(action) {
      var _action$type$split = action.type.split("."),
          _action$type$split2 = (0, _slicedToArray3.default)(_action$type$split, 2),
          actionPlugin = _action$type$split2[0],
          actionType = _action$type$split2[1];

      return this._plugins[actionPlugin] && this._plugins[actionPlugin].acceptors && this._plugins[actionPlugin].acceptors[actionType];
    }
  }, {
    key: "_processJsonPath",
    value: function _processJsonPath() {
      var spec = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var context = arguments[1];

      var obj = JSON.parse((0, _stringify2.default)(spec));

      traverse(obj).forEach(function (value) {
        if (typeof value === "string" && value.match(JSON_PATH_PATTERN)) {
          this.update(jp.query(context, value));
        }
      });

      return obj;
    }
  }, {
    key: "_act",
    value: function () {
      var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(stateAction, action, context) {
        var _stateAction$type$spl, _stateAction$type$spl2, pluginName, actionType, plugin;

        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _stateAction$type$spl = stateAction.type.split("."), _stateAction$type$spl2 = (0, _slicedToArray3.default)(_stateAction$type$spl, 2), pluginName = _stateAction$type$spl2[0], actionType = _stateAction$type$spl2[1];
                plugin = this._plugins[pluginName];

                if (plugin.actions && plugin.actions[actionType]) {
                  _context5.next = 5;
                  break;
                }

                console.error("Can't act, " + action.type + " doesn't exist");
                return _context5.abrupt("return");

              case 5:
                _context5.next = 7;
                return plugin.actions[actionType](this._processJsonPath(stateAction.spec, context), action, context);

              case 7:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function _act(_x6, _x7, _x8) {
        return _ref7.apply(this, arguments);
      }

      return _act;
    }()
  }, {
    key: "_dispatchToFlow",
    value: function () {
      var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(flow, action, context) {
        var _this3 = this;

        var actionAcceptor, next, actionMiddleware, acceptorState, nextState, actionMiddlewareFns;
        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                actionAcceptor = flow.startAcceptors(action).find(function (acceptor) {
                  return action.acceptor(_this3._processJsonPath(acceptor.spec, context));
                });

                if (actionAcceptor) {
                  _context6.next = 4;
                  break;
                }

                console.log(flow.name + " has no acceptor for " + action.type + ", skipping");
                return _context6.abrupt("return");

              case 4:
                next = actionAcceptor.next, actionMiddleware = actionAcceptor.middleware, acceptorState = actionAcceptor.parentState;
                nextState = flow.state(next);

                if (nextState) {
                  _context6.next = 9;
                  break;
                }

                console.error("Can't process flow \"" + flow.name + "\". " + ("\"" + acceptorState.name + "\" state with action \"" + action.type + "\" ") + "doesn't have a `next`");
                return _context6.abrupt("return");

              case 9:
                actionMiddlewareFns = actionMiddleware.map(function (name) {
                  var middlewareFn = _this3._flowMiddleware[name];

                  if (!middlewareFn) {
                    throw new Error("Missing flow middleware " + name + ". Add it with engine.addFlow");
                  }

                  return middlewareFn;
                });
                _context6.next = 12;
                return compose(actionMiddlewareFns)({ action: action, context: context });

              case 12:
                _context6.next = 14;
                return _promise2.default.all(nextState.actions.map(function (stateAction) {
                  return _this3._act(stateAction, action, context);
                }));

              case 14:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function _dispatchToFlow(_x9, _x10, _x11) {
        return _ref8.apply(this, arguments);
      }

      return _dispatchToFlow;
    }()
  }, {
    key: "dispatch",
    value: function () {
      var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(action) {
        var _this4 = this;

        var actionAcceptor, context;
        return _regenerator2.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                actionAcceptor = this._getActionAcceptor(action);
                context = {};

                if (actionAcceptor) {
                  _context8.next = 5;
                  break;
                }

                console.log("No plugin acceptor to process " + action.type);
                return _context8.abrupt("return");

              case 5:

                action.acceptor = actionAcceptor.bind(null, action);

                _context8.next = 8;
                return compose(this._middleware)({ action: action, context: context });

              case 8:
                return _context8.abrupt("return", _promise2.default.all(this._flows.map(function () {
                  var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(flow) {
                    return _regenerator2.default.wrap(function _callee7$(_context7) {
                      while (1) {
                        switch (_context7.prev = _context7.next) {
                          case 0:
                            return _context7.abrupt("return", _this4._dispatchToFlow(flow, action, (0, _assign2.default)({}, context)));

                          case 1:
                          case "end":
                            return _context7.stop();
                        }
                      }
                    }, _callee7, _this4);
                  }));

                  return function (_x13) {
                    return _ref10.apply(this, arguments);
                  };
                }())));

              case 9:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function dispatch(_x12) {
        return _ref9.apply(this, arguments);
      }

      return dispatch;
    }()
  }]);
  return Engine;
}();

module.exports = Engine;