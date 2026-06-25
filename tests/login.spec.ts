import { test, expect } from '@playwright/test';
import { PlaywrightAiFixture, type PlayWrightAiFixtureType } from '@midscene/web/playwright';

const aiTest = test.extend<PlayWrightAiFixtureType>(PlaywrightAiFixture());

aiTest.describe('天元智算 - 登录功能', () => {
  aiTest('输入账号密码并登录，验证跳转到商城首页', async ({ page, aiAssert, aiWaitFor }) => {
    // 1. 打开登录页面
    await page.goto('/platform/home');
    await page.waitForLoadState('networkidle');

    // 2. 输入账号（Playwright 原生操作，快速可靠）
    await page.getByPlaceholder('请输入手机号').fill('13777777777');

    // 3. 输入密码（Playwright 原生操作，避免 AI 对含特殊字符密码的误判）
    await page.getByPlaceholder('Password').fill('1qaz!QAZ');

    // 4. 点击登录按钮（Playwright 原生点击，页面按钮文字是 "Sign In"）
    await page.getByRole('button', { name: 'Sign In' }).click();

    // 5. 等待页面跳转完成（Midscene AI 智能判断）
    await aiWaitFor('页面已跳转到用户个人工作台首页');

    // // 6. 断言 URL 已跳转到商城能力中心
    // await expect(page).toHaveURL(/uat-mall\.denovox\.com:8262\/platform/, { timeout: 15000 });

    // 7. 断言右上角出现"控制台"文字（Midscene AI 智能断言）
    await aiAssert('页面右上角存在"控制台"文字');
  });
});
