import { test } from '@playwright/test';
import { PlaywrightAiFixture, type PlayWrightAiFixtureType } from '@midscene/web/playwright';

export const aiTest = test.extend<PlayWrightAiFixtureType>(PlaywrightAiFixture());
export { expect } from '@playwright/test';
