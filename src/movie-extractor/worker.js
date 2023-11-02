const { workerData, parentPort } = require("worker_threads");
const { Builder, By } = require("selenium-webdriver");
const Chrome = require("selenium-webdriver/chrome");
const fs = require("fs");
const dotenv = require("dotenv");

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

dotenv.config();

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

      const BASE_URl = process.env["BASE_URL"];

      const MOVIE_URL = process.env["MOVIE_LIST_URL"];

      const MOVIE_LIST_FULL_URL = `https://${BASE_URl}/${MOVIE_URL}`;

      const POST_NAME_REGEX = /\/([^\/]+)\/$/;

      const TOKEN_NAME = process.env["TOKEN_NAME"];

      const TOKEN_VALUE = process.env["TOKEN_VALUE"];

      const cookie = {
        name: TOKEN_NAME,
        value: TOKEN_VALUE,
        domain: `${BASE_URl}`,
      };

      const path = (p) => `${MOVIE_LIST_FULL_URL}/page/${p}`;

      await this.#driver.get(path(1));

      await this.#driver.manage().addCookie(cookie);

      await this.#driver.navigate().refresh();

      for (let n = this.#progress; n < this.#end + 1; n++) {
        log(`page --> ${n} from ${this.#end}`);
        await this.#driver.get(path(n));

        const paginationCon = await this.#driver.findElement(
          By.className("inner_dashboard_pageNavi")
        );
        const paginationItems = await paginationCon.findElements(
          By.className("page-numbers")
        );

        const postsCon = await this.#driver.findElement(
          By.className("posts_hoder_archive")
        );
        const posts = await postsCon.findElements(
          By.className("item_body_widget imabasi")
        );
        let postsLink = [];
        for await (const post of posts) {
          const anchor = await post.findElement(By.tagName("a"));
          const postLink = await anchor.getAttribute("href");
          const postName = postLink.match(POST_NAME_REGEX)[1];
          postsLink.push({ postLink, postName });
        }
        for (const link of postsLink) {
          await this.#driver.get(link.postLink);
          const dlBox = await this.#driver.findElement(
            By.className("dllink_movies")
          );
          const dlAnchorsEl = await dlBox.findElements(By.tagName("a"));
          const anchors = [];
          for await (const anchor of dlAnchorsEl) {
            const anchorLink = await anchor.getAttribute("href");
            anchors.push(anchorLink);
          }

          this.movieData[link.postName] = anchors;

          // save new expert data
          await saveNewThreadExpertData(this.#workerId, this.movieData);
          log(`${link.postName} - Saving to cache...`);
        }
        this.#progress += 1;
        const newConfig = {
          progress: this.#progress,
          start: this.#start,
          end: this.#end,
          id: this.#workerId,
        };
        await saveNewThreadConfig(this.#workerId, newConfig);
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

async function sleep(ms) {
  return new Promise((res) =>
    setTimeout(() => {
      res();
    }, ms)
  );
}
