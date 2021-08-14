"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./server"));
const new_app_1 = __importDefault(require("./new-app"));
const log_1 = require("./log");
switch (process.argv[2]) {
    case "start": {
        server_1.default(process.cwd(), parseInt(process.argv[3]) || 8081);
        break;
    }
    case "add": {
        if (!process.argv[3] || !process.argv[4]) {
            log_1.usageError();
            break;
        }
        new_app_1.default(process.argv[3].toLowerCase(), process.argv[4], process.argv[5]);
        break;
    }
    default: {
        log_1.usageError();
    }
}
