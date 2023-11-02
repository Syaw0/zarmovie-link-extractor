const fs = require("fs/promises");

const {
  WORKER_MAIN_DIR_PATH,
  WORKER_CONFIG_FILE_NAME,
  WORKER_MOVIE_DATA_FILE_NAME,
  WORKER_PROFILE_DIR_NAME,
} = require("./config");

// ------------------------------------------------------------------------

class Task_Assigner {
  #tasks = [];
  #threadNumber = 5;
  #movies_list_number = 850;

  async start() {
    console.log("Assigning Tasks...");
    await this.#prepare();
    return this.#tasks;
  }

  async #prepare() {
    await this.#createMainWorkerDir();

    const workload = Math.floor(this.#movies_list_number / this.#threadNumber);

    for (let n = 0; n != this.#threadNumber; n++) {
      const start = n * workload + 1;
      const end = (n + 1) * workload;

      this.#tasks.push(await this.#getThreadsData(n, { start, end }));
    }
  }

  async #getThreadsData(threadId, threadData) {
    await this.#createWorkerIdDir(threadId);
    await this.#createWorkerIdProfileDir(threadId);
    const threadConfig = await this.#getThreadConfig(threadId, threadData);
    const threadMovieData = await this.#getThreadMovieData(threadId);
    return { ...threadConfig, movieData: threadMovieData };
  }

  async #createWorkerIdDir(id) {
    const PATH = `${WORKER_MAIN_DIR_PATH}/${id}`;
    try {
      await fs.access(PATH);
    } catch (err) {
      if (err.code === "ENOENT") {
        await fs.mkdir(PATH);
      }
    }
  }

  async #createWorkerIdProfileDir(id) {
    const PATH = `${WORKER_MAIN_DIR_PATH}/${id}/${WORKER_PROFILE_DIR_NAME}`;
    try {
      await fs.access(PATH);
    } catch (err) {
      if (err.code === "ENOENT") {
        await fs.mkdir(PATH);
      }
    }
  }

  async #getThreadMovieData(id) {
    const PATH = `${WORKER_MAIN_DIR_PATH}/${id}/${WORKER_MOVIE_DATA_FILE_NAME}`;
    try {
      const configs = await fs.readFile(PATH);
      return JSON.parse(configs.toString());
    } catch (err) {
      if (err.code === "ENOENT") {
        return await this.#createDefaultThreadMovieDataFile(id);
      }
    }
  }

  async #createDefaultThreadMovieDataFile(id) {
    const PATH = `${WORKER_MAIN_DIR_PATH}/${id}/${WORKER_MOVIE_DATA_FILE_NAME}`;
    const data = {};
    await fs.writeFile(PATH, JSON.stringify(data));
    return data;
  }

  async #getThreadConfig(id, threadData) {
    const PATH = `${WORKER_MAIN_DIR_PATH}/${id}/${WORKER_CONFIG_FILE_NAME}`;
    try {
      const configs = await fs.readFile(PATH);
      return JSON.parse(configs.toString());
    } catch (err) {
      if (err.code === "ENOENT") {
        return await this.#createDefaultThreadConfigFile(id, threadData);
      }
    }
  }

  async #createDefaultThreadConfigFile(id, threadData) {
    const PATH = `${WORKER_MAIN_DIR_PATH}/${id}/${WORKER_CONFIG_FILE_NAME}`;
    const config = {
      ...threadData,
      progress: 0,
      id,
    };
    await fs.writeFile(PATH, JSON.stringify(config));
    return config;
  }

  async #createMainWorkerDir() {
    try {
      await fs.access(WORKER_MAIN_DIR_PATH);
    } catch (err) {
      if (err.code === "ENOENT") {
        await fs.mkdir(WORKER_MAIN_DIR_PATH);
      }
    }
  }
}

// (async function () {
//   const t = new Task_Assigner();
//   x = await t.start();
//   console.log(x);
// })();
