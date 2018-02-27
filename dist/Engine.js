"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _objectDestructuringEmpty(obj) { if (obj == null) throw new TypeError("Cannot destructure undefined"); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
    _objectDestructuringEmpty(_ref);

    _classCallCheck(this, Engine);

    this._plugins = {};
    this._flows = [];
    this._middleware = [];
    this._flowMiddleware = {};
  }

  _createClass(Engine, [{
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
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(yml) {
        var docs, flow, actions;
        return regeneratorRuntime.wrap(function _callee$(_context) {
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
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(flowFile) {
        var yml;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
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
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(flowDir) {
        var _this2 = this;

        var files, flowConfigs, flows;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return fs.readdir(flowDir);

              case 2:
                files = _context3.sent;
                _context3.next = 5;
                return Promise.all(files.map(function (file) {
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
      Object.assign(this._flowMiddleware, flatten(middleware));
    }
  }, {
    key: "addFlows",
    value: function () {
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(_ref5) {
        var flowDir = _ref5.flowDir,
            middleware = _ref5.middleware;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return Promise.all([this._addFlowsFromDir(flowDir), this._addFlowMiddleware(middleware)]);

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
          _action$type$split2 = _slicedToArray(_action$type$split, 2),
          actionPlugin = _action$type$split2[0],
          actionType = _action$type$split2[1];

      return this._plugins[actionPlugin] && this._plugins[actionPlugin].acceptors && this._plugins[actionPlugin].acceptors[actionType];
    }
  }, {
    key: "_processJsonPath",
    value: function _processJsonPath() {
      var spec = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var context = arguments[1];

      var obj = JSON.parse(JSON.stringify(spec));

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
      var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(stateAction, action, context) {
        var _stateAction$type$spl, _stateAction$type$spl2, pluginName, actionType, plugin;

        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _stateAction$type$spl = stateAction.type.split("."), _stateAction$type$spl2 = _slicedToArray(_stateAction$type$spl, 2), pluginName = _stateAction$type$spl2[0], actionType = _stateAction$type$spl2[1];
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
      var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(flow, action, context) {
        var _this3 = this;

        var actionAcceptor, next, actionMiddleware, acceptorState, nextState, actionMiddlewareFns;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
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
                return Promise.all(nextState.actions.map(function (stateAction) {
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
      var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(action) {
        var _this4 = this;

        var actionAcceptor, context;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
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
                return _context8.abrupt("return", Promise.all(this._flows.map(function () {
                  var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(flow) {
                    return regeneratorRuntime.wrap(function _callee7$(_context7) {
                      while (1) {
                        switch (_context7.prev = _context7.next) {
                          case 0:
                            return _context7.abrupt("return", _this4._dispatchToFlow(flow, action, Object.assign({}, context)));

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