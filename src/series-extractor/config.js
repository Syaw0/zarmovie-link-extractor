const config = {
  EXPERT_LINKS_PATH: "src/links.js",
  LOG_FILE_PATH: "src/assets/logs.log",
  EXPERT_SIZE: 3713,
  WORKER_MAIN_DIR_PATH: "public/series/worker_data",
  WORKER_CONFIG_FILE_NAME: "config.json",
  WORKER_SERIES_DATA_FILE_NAME: "series_data.json",
  WORKER_SCRIPT_FILE_PATH: process.cwd() + "/src/series-extractor/worker.js",
  WORKER_PROFILE_DIR_NAME: "profile",
  SCRAP_PACKED_FILE_PATH: "src/packed_data",
  SCRAP_PACKED_PROFILE_FILE_PATH: "src/packed_data/profiles",
  DEFAULT_PROFILE_PATH: "src/assets/default.png",
};

module.exports = { ...config };
