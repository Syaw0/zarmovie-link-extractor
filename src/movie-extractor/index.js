const { Builder, By } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const dotenv = require("dotenv");

// ------------------------------------------------------------------------

class Movie_Extractor {
  #threadNumber = 5;

  start() {
    console.clear();
    console.log(
      `Starting The Movie Scrapper With ${this.#threadNumber} instances`
    );
    this.#prepare();
  }

  #prepare() {}
}

// const BASE_URl = process.env["BASE_URL"];

// const MOVIE_URL = process.env["MOVIE_LIST_URL"];

// const MOVIE_LIST_FULL_URL = `https://${BASE_URl}/${MOVIE_URL}`;

// const POST_NAME_REGEX = /\/([^\/]+)\/$/;

// const TOKEN_NAME = process.env["TOKEN_NAME"];

// const TOKEN_VALUE = process.env["TOKEN_VALUE"];

// const cookie = {
//   name: TOKEN_NAME,
//   value: TOKEN_VALUE,
//   domain: `${BASE_URl}`,
// };

// const path = (p) => `https://${BASE_URl}/${p}`;

// (async function init() {
//   const options = new chrome.Options().headless();
//   let driver = await new Builder()
//     .forBrowser("chrome")
//     .setChromeOptions(options)
//     .build();

//   await driver.get(MOVIE_LIST_FULL_URL);

//   await driver.manage().addCookie(cookie);

//   await driver.navigate().refresh();

//   const paginationCon = await driver.findElement(
//     By.className("inner_dashboard_pageNavi")
//   );
//   const paginationItems = await paginationCon.findElements(
//     By.className("page-numbers")
//   );
//   const maxPageNumber = await paginationItems[
//     paginationItems.length - 2
//   ].getText();

//   console.log(maxPageNumber);

//   const postsCon = await driver.findElement(
//     By.className("posts_hoder_archive")
//   );
//   const posts = await postsCon.findElements(
//     By.className("item_body_widget imabasi")
//   );

//   let postsLink = [];
//   for await (const post of posts) {
//     const anchor = await post.findElement(By.tagName("a"));
//     const postLink = await anchor.getAttribute("href");
//     const postName = postLink.match(POST_NAME_REGEX)[1];
//     postsLink.push(postLink);
//   }

//   for (const link of postsLink) {
//     await driver.get(link);

//     const dlBox = await driver.findElement(By.className("dllink_movies"));

//     const dlAnchorsEl = await dlBox.findElements(By.tagName("a"));

//     for await (const anchor of dlAnchorsEl) {
//       const anchorLink = await anchor.getAttribute("href");
//       console.log(anchorLink);
//     }
//   }
// })();
