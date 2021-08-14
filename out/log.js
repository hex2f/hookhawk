"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usageError = exports.ui_error = exports.error = exports.ui_warn = exports.warn = exports.ui_info = exports.info = exports.ui_success = exports.success = void 0;
const chalk_1 = __importDefault(require("chalk"));
function time() {
    return chalk_1.default.gray(`[${Date().toString()}]`);
}
function success(...a) {
    console.log(chalk_1.default.green(`[Success]`), time(), ...a);
}
exports.success = success;
function ui_success(...a) {
    console.log(chalk_1.default.green(`⬢`), ...a);
}
exports.ui_success = ui_success;
function info(...a) {
    console.log(chalk_1.default.blue(`[Info]`), time(), ...a);
}
exports.info = info;
function ui_info(...a) {
    console.log(chalk_1.default.blue(`⬢`), ...a);
}
exports.ui_info = ui_info;
function warn(...a) {
    console.warn(chalk_1.default.yellow(`[Warn]`), time(), ...a);
}
exports.warn = warn;
function ui_warn(...a) {
    console.log(chalk_1.default.yellow(`⬢`), ...a);
}
exports.ui_warn = ui_warn;
function error(...a) {
    console.error(chalk_1.default.red(`[Error]`), time(), ...a);
}
exports.error = error;
function ui_error(...a) {
    console.log(chalk_1.default.red(`⬢`), ...a);
}
exports.ui_error = ui_error;
function usageError() {
    console.log('Usage: hookhawk <command>\n');
    console.log('Available commands:');
    console.log('  hookhawk start <?port> - Starts the webhook server on an optional port (8081 by default)');
    console.log('  hookhawk add <name> <git uri> <?branch> - Clones and sets up a new app from the provided git uri');
}
exports.usageError = usageError;
