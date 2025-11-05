import { test, expect } from "@playwright/test";
import HackerNewsNewestPage from "../pages/HackerNewsNewestPage.js";

test.describe("Hacker News articles sorted by newest", () => {
  let hackerNewsNewestPage;

  test.beforeEach(async ({ page }) => {
    hackerNewsNewestPage = new HackerNewsNewestPage(page);
    await hackerNewsNewestPage.goToNewestArticles();
  });

  test("Verify first 100 articles are sorted in descending order by date", async () => {
    const isSortedDesc =
      await hackerNewsNewestPage.areFirst100ArticlesSortedDesc();

    expect(
      isSortedDesc,
      "Articles should be sorted newest to oldest"
    ).toBeTruthy();
  });
});
