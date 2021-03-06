const { FakeTimers, installCommonGlobals } = require("jest-util");
const { ModuleMocker } = require("jest-mock");
const { remote } = require("electron");

class ElectronEnvironment {
  setTimeout(timeout) {
    if (this.global.jasmine) {
      // eslint-disable-next-line no-underscore-dangle
      this.global.jasmine.DEFAULT_TIMEOUT_INTERVAL = timeout;
    } else {
      this.global[Symbol.for("TEST_TIMEOUT_SYMBOL")] = timeout;
    }
  }

  constructor(config) {
    const global = (this.global = window);
    // installCommonGlobals(global, config.globals);
    this.moduleMocker = new ModuleMocker(global);
    this._moduleMocker = new ModuleMocker(global);

    this.fakeTimers = new FakeTimers({
      global,
      moduleMocker: this.moduleMocker,
      config
    });
  }

  dispose() {
    if (this.fakeTimers) {
      this.fakeTimers.dispose();
    }
    this.fakeTimers = null;
  }
  async setup() {
    this.global.jestUtils = {
      debug: async () => {
        this.setTimeout(345600000);
        return new Promise(resolve => {
          console.log("Code is paused, press ctrl+enter to resume");
          function KeyPress(e) {
            // Ensure event is not null
            e = e || window.event;

            if ((e.which == 13 || e.keyCode == 13) && e.ctrlKey) {
              resolve();
              console.log("\n\n🕵️‍  Code is resumed");
              document.removeEventListener("keydown", KeyPress);
            }
          }
          document.addEventListener("keydown", KeyPress);
        });
      }
    };
  }

  async teardown() {}
  runScript(script) {
    return script.runInThisContext();
  }
}

module.exports = ElectronEnvironment;
