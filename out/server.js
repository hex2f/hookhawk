"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = __importDefault(require("child_process"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const util_1 = require("util");
const log_1 = require("./log");
const exists = util_1.promisify(fs_1.default.exists);
const readFile = util_1.promisify(fs_1.default.readFile);
const exec = util_1.promisify(child_process_1.default.exec);
function signData(secret, data) {
    return 'sha256=' + crypto_1.default.createHmac('sha256', secret).update(data).digest('hex');
}
function verifySignature(secret, data, signature) {
    return Buffer.from(signature).compare(Buffer.from(signData(secret, data))) != 0;
}
function start(appsPath, port) {
    log_1.info(`Creating server on :${port} in ${appsPath}`);
    const app = express_1.default();
    app.use(express_1.default.json());
    app.post('/:app', async (req, res) => {
        const { appName } = req.params;
        log_1.info(`Webhook called for "${appName}"`);
        const appPath = path_1.default.resolve(appsPath, appName);
        if (!await exists(appPath)) {
            log_1.info(`[${appName}] Hook does not exist`);
            return res.sendStatus(404);
        }
        const hawkcfgPath = path_1.default.join(appPath, '.hawkcfg');
        if (!await exists(hawkcfgPath)) {
            log_1.error(`[${appName}] No .hawkcfg found, please remove ${chalk_1.default.italic(appPath)} then reinitialize using ${chalk_1.default.bold(`hookhawk new-app ${appName} <git uri>`)}`);
            return res.sendStatus(404);
        }
        const signature = req.headers['x-hub-signature'];
        if (!signature) {
            log_1.error(`[${appName}] No signature provided`);
        }
        const secret = await readFile(hawkcfgPath, 'utf-8');
        log_1.info(`[${appName}] secret: ${secret}, signature: ${signature}`);
        if (!verifySignature(secret, JSON.stringify(req.body), signature)) {
            log_1.error(`[${appName}] Invalid signature`);
        }
        else {
            log_1.info(`[${appName}] Signature validated`);
        }
        const prehawkPath = path_1.default.join(appPath, 'prehawk.sh');
        const hawkPath = path_1.default.join(appPath, 'hawk.sh');
        if (await exists(prehawkPath)) {
            log_1.info(`[${appName}] Running prehawk script`);
            await exec(prehawkPath);
        }
        log_1.info(`[${appName}] Pulling updates`);
        await exec(`git -C "${appPath}" pull`);
        if (await exists(hawkPath)) {
            log_1.info(`[${appName}] Running hawk script`);
            await exec(prehawkPath);
        }
        res.sendStatus(200);
    });
    app.listen(port, () => log_1.info(`Listening on :${port}`));
}
exports.default = start;
