export default class BasePage {
  constructor(page) {
    if (!page) {
      throw new Error(
        'A Playwright "page" object must be provided to BasePage.'
      );
    }
    this.page = page;
  }

  /**
   * Navigate and wait for a key selector to confirm page load
   * @param {string} url
   * @param {string} selector - element expected to appear
   * @param {number} timeout
   */
  async navigateAndWait(url, selector, timeout = 5000) {
    await this.page.goto(url);
    await this.page.waitForSelector(selector, { timeout });
  }

  /**
   * Wait for a selector to appear on the page
   */
  async waitForElement(selector) {
    await this.page.waitForSelector(selector, { state: "visible" });
  }

  /**
   * Assert that a list or NodeList is not empty
   * (for reusable error handling)
   */
  async assertNonEmpty(items, message) {
    if (!items || items.length === 0) {
      throw new Error(message);
    }
  }

  // In a larger framework, we could integrate a structured logger here
}
