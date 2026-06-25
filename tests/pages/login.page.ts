import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get mobileInput() {
    return this.page.getByPlaceholder('请输入手机号');
  }

  get passwordInput() {
    return this.page.getByPlaceholder('Password');
  }

  get signInButton() {
    return this.page.getByRole('button', { name: 'Sign In' });
  }

  async goto() {
    await this.page.goto('/platform/home');
    await this.page.waitForLoadState('networkidle');
  }

  async login(mobile: string, password: string) {
    await this.mobileInput.fill(mobile);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  async expectVisible() {
    await expect(this.mobileInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
  }
}
