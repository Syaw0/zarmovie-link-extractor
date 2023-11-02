const { Worker } = require("worker_threads");
const { WORKER_SCRIPT_FILE_PATH } = require("./config");
const { Task_Assigner } = require("./tast_assigner");

// ------------------------------------------------------------------------

class Series_Extractor {
  #threadNumber = 2;
  #tasks = [];

  async start() {
    console.clear();
    console.log(
      `Starting The Series Scrapper With ${this.#threadNumber} instances`
    );
    await this.#prepare();
    await this.#spawnInstances();
  }

  async #spawnInstances() {
    await Promise.all(this.#tasks.map(this.#createThread)).then((res) =>
      console.log(res)
    );
  }

  async #createThread(task) {
    return new Promise((res, rej) => {
      const thread = new Worker(WORKER_SCRIPT_FILE_PATH, { workerData: task });
      thread.on("message", (msg) => {
        if (msg.type == "log") {
          console.log(`Worker@${task.id} ->`, msg.data);
        } else if (msg.type == "missionReport") {
          console.log(
            console.log(`Worker@${task.id}(Mission Report) ->`),
            msg.data
          );
          res(msg);
        }
      });

      thread.on("error", (error) => {
        console.log(error);
        rej(error);
      });
    });
  }
  async #prepare() {
    const taskAssigner = new Task_Assigner(this.#threadNumber);
    this.#tasks = await taskAssigner.start();
  }
}

(async function () {
  const t = new Series_Extractor();
  await t.start();
})();
