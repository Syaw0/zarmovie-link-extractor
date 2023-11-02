const { workerData, parentPort } = require("worker_threads");
const { Builder, By } = require("selenium-webdriver");
const Chrome = require("selenium-webdriver/chrome");
const fs = require("fs");

const {
  WORKER_MAIN_DIR_PATH,
  WORKER_PROFILE_DIR_NAME,
  xpathMap,
  DEFAULT_PROFILE_PATH,
} = require("./config");

const {
  saveNewThreadConfig,
  saveNewThreadExpertData,
} = require("./tast_assigner");

// ------------------------------------------------------------------------

function log(message) {
  parentPort.postMessage({ type: "log", data: message });
}

class Worker {
  #isReady = false;
  #isComplete = false;
  #start = null;
  #end = null;
  #driver = null;
  #progress = 0;
  #workerId = null;
  movieData = {};
  #chromeOptions = new Chrome.Options()
    .windowSize({
      height: 5000,
      width: 5000,
    })
    .headless();

  constructor(task) {
    this.#progress = task.progress;
    this.#workerId = task.id;
    this.#start = task.start;
    this.#end = task.end;
    this.movieData = task.movieData;
  }

  async start() {
    if (!this.#isReady) {
      await this.#prepare();
    }
    return await this.#scrap();
  }

  async #scrap() {
    try {
      if (this.#progress === 0) {
        this.#progress = this.#start;
      }

      for (let n = this.#progress; n < this.#end + 1; n++) {
        // perform action of scrap...
      }
    } catch (err) {
      return { error: true, msg: err };
    } finally {
      log("Quit the driver");
      await this.#driver.quit();
    }
  }

  #addMovieData(link, expertData) {
    this.movieData[link] = expertData;
  }

  async #prepare() {
    this.#driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(this.#chromeOptions)
      .build();
  }
  get isComplete() {
    return this.#isComplete;
  }
  set isComplete(is) {
    this.#isComplete = is;
  }
}

(async function start_worker() {
  const worker = new Worker(workerData);
  while (!worker.isComplete) {
    const result = await worker.start();
    if (result?.error) {
      log(`Error Happen \n${result.msg}\nRestart the worker after 2000ms`);
      await sleep(2000);
    } else {
      worker.isComplete = true;
      parentPort.postMessage({
        type: "missionReport",
        complete: true,
        data: `Worker job is complete`,
      });
    }
  }
})();

// log(`
// name : ${name}
// field : ${field}
// degree : ${degree}
// membershipNumber : ${membershipNumber}
// initDate : ${expertInitDate}
// institute : ${instituteTel}
// phone : ${phoneTel}
//   fax : ${fax}
//   field : ${activityField}
//   email : ${email}
//   status: ${status}
// licenseDate :${licenseDate}
// lastLeave : ${lastLeaveDate}
// untilLeave : ${untilLeaveDate}
// address : ${address}
// description: ${description}
// image : ${imageSrc}

// `);
