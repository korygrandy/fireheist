import { Page, Locator } from '@playwright/test';

export class LandingPage {
  readonly page: Page;
  readonly header: Locator;
  readonly resumeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.getByRole('heading', { level: 1 });
    this.resumeButton = page.getByRole('link', { name: 'Download Resume' });
  }

  async navigate() {
    await this.page.goto('/');
  }

  async clickResumeButton() {
    await this.resumeButton.click();
  }
}
