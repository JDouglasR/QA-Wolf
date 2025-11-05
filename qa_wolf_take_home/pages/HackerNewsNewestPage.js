import BasePage from "./BasePage.js";

export default class HackerNewsNewestPage extends BasePage {
  // ** Private locator fields **
  #articleRows;
  #moreButton;

  constructor(page) {
    super(page);
    this.#articleRows = page.locator("tr.athing.submission, tr.athing");
    this.#moreButton = page.locator("a.morelink");
  }

  // ** Navigation **
  async goToNewestArticles() {
    await this.navigateAndWait(
      "https://news.ycombinator.com/newest",
      "tr.athing"
    );
  }

  // ** Actions **
  async getFirst100ArticleDates() {
    const articleDates = [];

    while (articleDates.length < 100) {
      const rows = await this.#articleRows.elementHandles();
      await this.assertNonEmpty(rows, "No articles found on the page.");

      // Evaluate all timestamps on current page
      const timestamps = await this.page.evaluate(() => {
        const results = [];
        const articles = document.querySelectorAll(
          "tr.athing.submission, tr.athing"
        );
        for (const article of articles) {
          const ageSpan = article.nextElementSibling?.querySelector("span.age");
          const titleAttr = ageSpan?.getAttribute("title");
          if (titleAttr) results.push(titleAttr);
        }
        return results;
      });

      await this.assertNonEmpty(
        timestamps,
        "No valid timestamps found on this page."
      );

      // Convert strings to  Date objects
      for (const titleAttr of timestamps) {
        const isoPart = titleAttr.split(" ")[0];
        const articleDate = new Date(isoPart);

        if (isNaN(articleDate.getTime())) {
          throw new Error(`Invalid date found: ${titleAttr}`);
        }

        articleDates.push(articleDate);
        if (articleDates.length >= 100) break;
      }

      // Stop if we have enough
      if (articleDates.length >= 100) break;

      // Handle pagination
      const hasMore = await this.#moreButton.isVisible();
      if (!hasMore) {
        throw new Error(
          `Reached end of pages — only found ${articleDates.length} articles.`
        );
      }

      await Promise.all([
        this.page.waitForNavigation({ waitUntil: "load" }),
        this.#moreButton.click(),
      ]);

      await this.waitForElement("tr.athing");
    }

    return articleDates.slice(0, 100);
  }

  // ** Validations **
  async areFirst100ArticlesSortedDesc() {
    const articleDates = await this.getFirst100ArticleDates();

    if (articleDates.length !== 100) {
      throw new Error(`Expected 100 articles, got ${articleDates.length}.`);
    }

    // Check descending order (newest to oldest)
    return articleDates.every(
      (date, index) =>
        index === 0 || date.getTime() <= articleDates[index - 1].getTime()
    );
  }
}
