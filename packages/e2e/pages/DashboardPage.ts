import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  async open() {
    await this.goto('/dashboard');
    await this.waitForLoad();
  }

  async isAuthenticated() {
    return this.page.locator('[data-testid="dashboard-content"]').isVisible();
  }
}
