import { test as base, expect } from "@playwright/test";

export const googleAnalyticsRequest = /(?:googletagmanager\.com\/gtag|google-analytics\.com|analytics\.google\.com|\/g\/collect)/i;

export const test = base.extend({
  context: async ({ context }, runFixture) => {
    await context.route(googleAnalyticsRequest, (route) => route.abort("blockedbyclient"));
    await runFixture(context);
  },
});
export { expect };
export type { Page, TestInfo, Locator } from "@playwright/test";
