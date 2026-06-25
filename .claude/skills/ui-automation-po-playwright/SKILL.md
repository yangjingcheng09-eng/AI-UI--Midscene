---
name: ui-automation-po-playwright
description: Use this skill when creating, refactoring, or reviewing UI automation tests in this project. It enforces the project's Page Object (PO/POM) + Playwright + Midscene testing framework conventions, including where to place page objects, fixtures, test specs, selectors, assertions, test data, and how AI-generated test code should be structured.
---

# UI 自动化测试框架规范：PO 层 + Playwright + Midscene

本 skill 用于约束本项目中 AI 生成的 UI 自动化测试代码。凡是新增、修改、重构或评审 UI 自动化测试，都必须遵循本规范。

## 技术栈与基本原则

- 测试框架：Playwright Test。
- AI 能力：Midscene Playwright fixture，只用于语义等待、视觉/语义断言、难以稳定定位的页面状态判断。
- 设计模式：Page Object Model（PO/POM）。
- 测试代码必须保持“用例只描述业务流程，页面操作封装在 PO 层”。
- 优先使用 Playwright 原生 locator 和断言；不要把稳定的输入、点击、下拉选择全部交给 AI。
- 不要在 spec 文件中散落选择器、账号密码、复杂等待逻辑。
- 不要使用固定 sleep，例如 `page.waitForTimeout()`，除非明确说明不可替代且时间很短。

## 推荐目录结构

在项目根目录下按以下结构组织代码：

```text
tests/
  specs/
    login.spec.ts
  pages/
    base.page.ts
    login.page.ts
    home.page.ts
  fixtures/
    ai-test.fixture.ts
  test-data/
    users.ts
  utils/
    env.ts
```

现有项目如果已有 `tests/login.spec.ts`，新增测试时优先迁移到 `tests/specs/`。迁移前先确认是否会影响现有执行命令。

## 分层职责

### spec 层：业务场景编排

spec 文件只做这些事情：

- 引入统一 test fixture。
- 创建/使用 PO 对象。
- 编排业务步骤。
- 写业务级断言。

spec 文件不应该：

- 直接写大量 `page.getBy...()`、`locator()`。
- 直接保存账号密码等测试数据。
- 直接实现登录、退出、搜索等可复用流程。
- 包含复杂条件判断或等待细节。

示例：

```ts
import { expect } from '@playwright/test';
import { aiTest } from '../fixtures/ai-test.fixture';
import { LoginPage } from '../pages/login.page';
import { HomePage } from '../pages/home.page';
import { testUsers } from '../test-data/users';

aiTest.describe('天元智算 - 登录功能', () => {
  aiTest('输入账号密码并登录，验证跳转到工作台首页', async ({ page, aiWaitFor, aiAssert }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);

    await loginPage.goto();
    await loginPage.login(testUsers.valid.mobile, testUsers.valid.password);

    await homePage.waitForLoaded(aiWaitFor);
    await expect(page).toHaveURL(/\/platform/);
    await homePage.expectConsoleVisible(aiAssert);
  });
});
```

### PO 层：页面元素与页面行为

每个页面一个 PO 类，文件名使用 `*.page.ts`，类名使用 `XxxPage`。

PO 层负责：

- 定义页面上的 locator。
- 封装页面动作，例如 `goto()`、`login()`、`search()`、`submit()`。
- 封装页面级等待和页面级断言辅助方法。

PO 层不应该：

- 调用 `test()` 或 `describe()`。
- 包含跨多个页面的完整业务用例，跨页面流程应由 spec 或 flow/service 层编排。
- 硬编码敏感账号密码。

示例：

```ts
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
```

## fixture 规范

统一在 `tests/fixtures/ai-test.fixture.ts` 中封装 Midscene fixture，spec 文件不要重复写 `test.extend`。

```ts
import { test } from '@playwright/test';
import { PlaywrightAiFixture, type PlayWrightAiFixtureType } from '@midscene/web/playwright';

export const aiTest = test.extend<PlayWrightAiFixtureType>(PlaywrightAiFixture());
export { expect } from '@playwright/test';
```

如果后续新增项目级 fixture，例如自动登录、测试数据、API 客户端，也在该目录扩展，避免散落在 spec 中。

## 测试数据与敏感信息

- 测试账号、密码、环境 URL 等放到 `tests/test-data/` 或从环境变量读取。
- 不要在 spec 或 PO 中硬编码真实敏感信息。
- 当前示例账号如果只是测试账号，可以临时放在 `tests/test-data/users.ts`；如果是敏感账号，应改为读取 `.env`。
- `.env` 不应提交；`.env.example` 只保留变量名和示例值。

示例：

```ts
export const testUsers = {
  valid: {
    mobile: process.env.TEST_USER_MOBILE ?? '13777777777',
    password: process.env.TEST_USER_PASSWORD ?? '1qaz!QAZ',
  },
};
```

## 选择器策略

优先级从高到低：

1. `getByRole()`：按钮、链接、弹窗、输入框等可访问元素。
2. `getByLabel()` / `getByPlaceholder()`：表单输入。
3. `getByText()`：稳定且唯一的文本。
4. `getByTestId()`：需要时建议业务前端补充稳定 test id。
5. CSS/XPath：仅在无语义选择器可用时使用，并封装在 PO 层。

要求：

- 所有 locator 必须放在 PO 类中，除非是一次性调试代码。
- 不要在 spec 文件里直接写 CSS/XPath。
- 对动态文案、国际化文案，优先找稳定属性或 test id。

## 等待与断言策略

优先使用 Playwright 自动等待与 web-first assertions：

- `await expect(locator).toBeVisible()`
- `await expect(page).toHaveURL(...)`
- `await expect(locator).toHaveText(...)`
- `await locator.click()` 自带 actionability 等待

Midscene 使用边界：

- 可以使用 `aiWaitFor` 判断复杂页面已进入某个业务状态。
- 可以使用 `aiAssert` 做用户视角的语义/视觉断言。
- 不要用 AI 替代稳定的输入、点击和常规 DOM 断言。

## 命名规范

- spec 文件：`*.spec.ts`。
- PO 文件：`*.page.ts`。
- fixture 文件：`*.fixture.ts`。
- 类名：`LoginPage`、`HomePage`。
- 页面动作：动词开头，例如 `goto`、`login`、`submit`、`openUserMenu`。
- 断言辅助：`expect...`，例如 `expectVisible`、`expectConsoleVisible`。
- 等待辅助：`waitFor...`，例如 `waitForLoaded`。

## AI 生成代码时的执行清单

生成或修改测试前，先检查：

1. 是否已有对应页面的 PO 类；有则复用和扩展，不重复创建。
2. 是否已有统一 fixture；有则从 fixture 引入 `aiTest`。
3. 新的选择器是否放在 PO 层。
4. 测试数据是否放在 `tests/test-data/` 或环境变量中。
5. spec 是否只保留业务流程，不包含底层页面细节。
6. 是否优先使用 Playwright 原生操作和断言，只在合适场景使用 Midscene。
7. 是否需要更新或新增 README/说明，以便团队成员理解新结构。

## 禁止事项

- 禁止把所有测试步骤都写在一个 spec 文件里。
- 禁止每个 spec 重复声明 Midscene fixture。
- 禁止在多个测试中复制粘贴同一套登录步骤。
- 禁止在 spec 中硬编码 CSS/XPath 选择器。
- 禁止提交真实敏感账号、密码、token。
- 禁止为了等待页面稳定大量使用 `waitForTimeout()`。

## 对当前项目的特别约定

- 当前 Playwright 配置的 `testDir` 是 `./tests`，所以 `tests/specs/**/*.spec.ts` 会被 Playwright 自动发现。
- 当前项目使用 CommonJS package type，但 Playwright 配置和测试文件是 TypeScript ESM 写法；新增测试文件沿用现有 TS import/export 风格。
- 当前登录场景可先抽象为 `LoginPage` 和 `HomePage`，再把 `tests/login.spec.ts` 中的直接页面操作迁移到 PO 层。
