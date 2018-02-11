"use strict";

const levelup = require("levelup"),
    leveldown = require("leveldown");

module.exports = () => levelup(leveldown(".db"));
