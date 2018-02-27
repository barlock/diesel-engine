"use strict";

const compose = require("koa-compose"),
    fs = require("fs-extra"),
    path = require("path"),
    yaml = require("js-yaml"),
    flatten = require('flat'),
    traverse = require('traverse'),
    jp = require('jsonpath'),
    uid = require("uid-safe"),
    _ = require("lodash"),
    Flow = require("./Flow");

const JSON_PATH_PATTERN = /^\$\./;

class Engine {
    constructor ({ }) {
        this._plugins = {};
        this._flows = [];
        this._middleware = [];
        this._flowMiddleware = {};
    }

    plugin (name, plugin) {
        this._plugins[name] = plugin;

      (plugin.middleware || []).forEach(middleware => {
        this.use(middleware);
      })
    }

    async _parseFlowYaml (yml) {
      const docs = await yaml.safeLoadAll(yml),
        flow = docs.find(doc => doc.states),
        actions = _(docs)
          .filter(doc => doc.action)
          .keyBy("name")
          .value();

      // Map named actions to action definitions
      _(flow.states)
        .filter(state => state.actions)
        .each(state => state.actions
          .forEach((action, index) => {
            state.actions[index] = typeof action === "string" ? actions[action].action : action;
        }));

      return flow;
    }

    async _getFlowFromDisk(flowFile) {
      const yml = await fs.readFile(flowFile, "utf8");

      return this._parseFlowYaml(yml);
    }

    async _addFlowsFromDir (flowDir) {
      const files = await fs.readdir(flowDir);
      const flowConfigs = await Promise.all(
        files.map(file => this._getFlowFromDisk(path.join(flowDir, file))));

      const flows = flowConfigs.map(config => new Flow(config));

      this._flows = this._flows.concat(flows);
    }

    _addFlowMiddleware (middleware) {
      Object.assign(this._flowMiddleware, flatten(middleware));
    }

    async addFlows ({flowDir, middleware}) {
      await Promise.all([
        this._addFlowsFromDir(flowDir),
        this._addFlowMiddleware(middleware)
      ]);
    }

    use (middleware) {
        this._middleware.push(middleware);
    }

    _getActionAcceptor (action) {
        const [ actionPlugin, actionType ] = action.type.split(".");

        return this._plugins[actionPlugin] &&
            this._plugins[actionPlugin].acceptors &&
            this._plugins[actionPlugin].acceptors[actionType]
    }

    _processJsonPath(spec, context) {
      const obj = JSON.parse(JSON.stringify(spec));

      traverse(obj)
        .forEach(function (value) {
          if (typeof value === "string" && value.match(JSON_PATH_PATTERN)) {
            console.log(value);
            this.update(jp.query(context, value));
          }
        });

      return obj;
    }

    async _act (stateAction, action, context) {
      const [ pluginName , actionType ] = stateAction.type.split(".");
      const plugin = this._plugins[pluginName];

      if (!(plugin.actions && plugin.actions[actionType])) {
          console.error(`Can't act, ${action.type} doesn't exist`);
          return;
      }

      console.log("StateAction", stateAction);

      await plugin.actions[actionType](
        this._processJsonPath(stateAction.spec, context),
        action,
        context
      )
    }

    async _dispatchToFlow(flow, action, context) {
      const actionAcceptor = flow
        .startAcceptors(action)
        .find(acceptor =>
          action.acceptor(this._processJsonPath(acceptor.spec, context)));

      if (!actionAcceptor) {
        console.log(`${flow.name} has no acceptor for ${action.type}, skipping`);
        return;
      }

      const {
        next,
        middleware: actionMiddleware,
        parentState: acceptorState
      } = actionAcceptor;
      const nextState = flow.state(next);

      if (!nextState) {
        console.error(`Can't process flow "${flow.name}". ` +
          `"${acceptorState.name}" state with action "${action.type}" ` +
          "doesn't have a `next`");
        return;
      }

      const actionMiddlewareFns = actionMiddleware
        .map(name => {
          const middlewareFn = this._flowMiddleware[name];

          if (!middlewareFn) {
            throw new Error(`Missing flow middleware ${name}. Add it with engine.addFlow`);
          }

          return middlewareFn;
        });

      await compose(actionMiddlewareFns)({ action, context });

      await Promise.all(nextState.actions.map(stateAction =>
        this._act(stateAction, action, context)));
    }

    async dispatch (action) {
      const actionAcceptor = this._getActionAcceptor(action);
      const context = {};

      if (!actionAcceptor) {
          console.log(`No plugin acceptor to process ${action.type}`);
          return;
      }

      action.acceptor = actionAcceptor.bind(null, action);

      await compose(this._middleware)({ action, context });

      return Promise.all(this._flows.map(async flow =>
        this._dispatchToFlow(flow, action, Object.assign({}, context))));
    }
}

module.exports = Engine;
