import type { Page } from '@playwright/test';

type AiAssert = (prompt: string) => Promise<void>;
type AiWaitFor = (prompt: string) => Promise<void>;

export class HomePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitForLoaded(aiWaitFor: AiWaitFor) {
    await aiWaitFor('页面已跳转到用户个人工作台首页');
  }

  async expectConsoleVisible(aiAssert: AiAssert) {
    await aiAssert('页面右上角存在控制台文字');
  }
}
