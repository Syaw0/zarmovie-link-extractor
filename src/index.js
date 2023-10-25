const { Builder } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

(async function init() {
  const options = new chrome.Options().headless();
  let driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  driver.get("https://www.google.com");
})();
