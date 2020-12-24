"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pm2_1 = __importDefault(require("pm2"));
const log_1 = require("./log");
class StatusPage {
    constructor(io) {
        this.state = [];
        this.lastStateTime = 0;
        this.pm2Ready = false;
        this.io = io;
        this.io.on('connection', (socket) => {
            socket.on('getStates', () => {
                if (Date.now() - this.lastStateTime > 2000) {
                    this.lastStateTime = Date.now();
                    this.update();
                }
                else {
                    socket.emit('stateChange', this.state);
                }
            });
        });
        this.connectpm2();
    }
    connectpm2() {
        pm2_1.default.connect(err => {
            if (err)
                return log_1.error(err);
            this.pm2Ready = true;
        });
    }
    update() {
        if (this.pm2Ready) {
            pm2_1.default.list((err, list) => {
                if (err) {
                    this.connectpm2();
                    return log_1.error(err);
                }
                this.state = list.map(proc => ({
                    name: proc.name || 'unknown',
                    status: proc.pm2_env.status || 'stopped',
                    uptime: Date.now() - (proc.pm2_env.pm_uptime || Date.now()),
                    memory: proc.monit.memory || 0,
                    cpu: proc.monit.cpu || 0,
                }));
                this.io.emit('stateChange', this.state);
            });
        }
    }
}
exports.default = StatusPage;
