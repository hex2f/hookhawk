"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const log_1 = require("./log");
const fs_1 = __importDefault(require("fs"));
const child_process_1 = __importDefault(require("child_process"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const chalk_1 = __importDefault(require("chalk"));
const util_1 = require("util");
const exists = util_1.promisify(fs_1.default.exists);
const randomBytes = util_1.promisify(crypto_1.default.randomBytes);
const writeFile = util_1.promisify(fs_1.default.writeFile);
const exec = util_1.promisify(child_process_1.default.exec);
async function newApp(name, uri, branch) {
    const appPath = path_1.default.join(process.cwd(), name);
    if (await exists(appPath)) {
        return log_1.ui_error(`${name} already exists.`);
    }
    log_1.ui_info(`Cloning ${uri} into ${name}`);
    await exec(`git clone ${uri} ${name}`);
    let branchName = branch || (await exec(`git -C ${name} rev-parse --abbrev-ref HEAD`)).stdout.replace(/\W/g, '');
    log_1.ui_info(`Checking out ${branchName}`);
    await exec(`git -C ${name} checkout ${branchName}`);
    const secret = (await randomBytes(16)).toString('hex');
    await writeFile(path_1.default.join(appPath, '.hawkcfg'), [secret, `refs/heads/${branchName}`].join('\n'));
    log_1.ui_success(`Success!\n  Webhook Path: ${chalk_1.default.bold('/' + name)}\n  Secret: ${chalk_1.default.bold(secret)}`);
}
exports.default = newApp;
