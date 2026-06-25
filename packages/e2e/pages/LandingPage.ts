import { BasePage } from './BasePage';

export class LandingPage extends BasePage {
  async open() {
    await this.goto('/');
    await this.waitForLoad();
  }

  async getHeading() {
    return this.page.textContent('h1');
  }
}
