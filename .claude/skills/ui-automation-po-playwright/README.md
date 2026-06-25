# ui-automation-po-playwright

项目级 Claude Code skill：约束本项目 UI 自动化测试代码遵循 PO 层 + Playwright + Midscene 的框架规范。

## 何时触发

当你让 AI 新增、修改、重构或评审 UI 自动化测试时，可以直接说：

- 使用 `ui-automation-po-playwright` skill 新增登录测试
- 按项目的 PO + Playwright 框架重构测试
- 新增一个页面对象和对应 spec
- 检查当前测试是否符合 PO 分层规范

也可以显式输入：

```text
/ui-automation-po-playwright
```

## 核心约束

- spec 只写业务流程。
- 页面元素和页面行为放到 `tests/pages/*.page.ts`。
- Midscene fixture 统一放到 `tests/fixtures/ai-test.fixture.ts`。
- 测试数据放到 `tests/test-data/` 或环境变量。
- 优先 Playwright 原生 locator/assertion，Midscene 只用于语义等待和视觉/语义断言。
