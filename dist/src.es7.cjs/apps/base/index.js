"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const loggers_types_and_stubs_1 = require("@offirmo/loggers-types-and-stubs");
const defaultDependencies = {
    logger: loggers_types_and_stubs_1.serverLoggerToConsole,
};
function factory(dependencies = {}) {
    const { logger } = Object.assign({}, defaultDependencies, dependencies);
    logger.debug('Initializing the base webapp…');
    const app = express.Router();
    app.get('/', (req, res) => {
        res.send('This is not what you are looking for. Maybe you should check the instructions ?');
    });
    return app;
}
exports.factory = factory;
//# sourceMappingURL=index.js.map