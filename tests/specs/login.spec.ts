import { aiTest, expect } from '../fixtures/ai-test.fixture';
import { HomePage } from '../pages/home.page';
import { LoginPage } from '../pages/login.page';
import { testUsers } from '../test-data/users';

aiTest.describe('天元智算 - 登录功能', () => {
  aiTest('输入账号密码并登录，验证跳转到商城首页', async ({ page, aiAssert, aiWaitFor }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);

    await loginPage.goto();
    await loginPage.expectVisible();
    await loginPage.login(testUsers.valid.mobile, testUsers.valid.password);

    await homePage.waitForLoaded(aiWaitFor);
    await expect(page).toHaveURL(/\/platform/, { timeout: 15000 });
    await homePage.expectConsoleVisible(aiAssert);
  });
});
