import { test, expect, BrowserContext, Page } from "@playwright/test";
//@ts-check
const BASE_URL = "https://aiaxio.com/signin/";

test.describe("After sign in Page Flow", () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    // One window for the whole file
    context = await browser.newContext({ viewport: null });
    // One tab reused by all tests
    page = await context.newPage();
    await page.waitForLoadState("networkidle");
  });

  test.afterAll(async () => {
    await context.close();
  });

  test.beforeEach(async () => {
    await page.goto(BASE_URL);
    const emailInput = page.getByTestId("email-input");
    await emailInput.fill("abc@gmail.com");

    const passwordInput = page.getByTestId("password-input");
    await passwordInput.fill("You123!!");

    const signInButton = page.getByTestId("submit-button");

    // Click + wait for the post-login network to settle
    await Promise.all([
      page.waitForLoadState("networkidle"),
      signInButton.click(),
    ]);
  });

  test("Sign In page Navbar elements visibility", async () => {
    const navbarLogo = page.getByTestId("navbar-logo");
    await expect(navbarLogo).toBeVisible();

    const navbarHome = page.getByTestId("nav-link-Tools");
    await expect(navbarHome).toBeVisible();
    await expect(navbarHome).toHaveText("Tools");

    const navbarSubmitTools = page.getByTestId("nav-link-Submit Tool");
    await expect(navbarSubmitTools).toBeVisible();
    await expect(navbarSubmitTools).toHaveText("Submit Tool");

    const navbarSearch = page.getByTestId("nav-link-Search");
    await expect(navbarSearch).toBeVisible();
    await expect(navbarSearch).toHaveText("Search");

    const userProfileLink = page.getByTestId('user-profile-link');
    await expect(userProfileLink).toBeVisible({ timeout: 15000 });
  });


test('User profile link visibility after sign in', async ({  }) => {
  const page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });

});
});
