"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
const { ELECTRON_RUNNER_DEBUG } = process.env;
function runTests(msg) {
    let runner = new electron_1.BrowserWindow({
        title: "Jest",
        show: !!ELECTRON_RUNNER_DEBUG,
        webPreferences: {
            nodeIntegration: true
        },
        width: 1200,
        height: 800
    });
    function open() {
        runner.loadURL(`file://${path_1.default.join(__dirname, "..", "index.html")}`);
    }
    if (ELECTRON_RUNNER_DEBUG) {
        runner.webContents.toggleDevTools();
        runner.webContents.on("devtools-opened", () => {
            open();
        });
    }
    else {
        open();
    }
    runner.webContents.on("did-finish-load", () => {
        runner.webContents.send("run", msg);
    });
}
function run() {
    new electron_1.BrowserWindow({
        title: "Jest",
        show: false,
        webPreferences: {
            nodeIntegration: true
        },
        width: 1200,
        height: 800
    });
    process.on("message", msg => {
        if (msg.type === "run-test") {
            runTests(msg);
        }
    });
    process.send({ type: "ready" });
}
process.on("exit", () => {
    electron_1.app.quit();
});
electron_1.app.on("ready", run);
electron_1.app.on("window-all-closed", function () {
    electron_1.app.quit();
    process.send({ type: "error", data: "closed" });
});
process.on("disconnect", () => {
    electron_1.app.quit();
    process.exit(0);
});
//# sourceMappingURL=server.js.map