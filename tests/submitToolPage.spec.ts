import { test, expect, BrowserContext, Page } from "@playwright/test";
//@ts-check
const BASE_URL = "https://aiaxio.com/signin/";

test.describe("SignIn Page Flow", () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    // One window for the whole file
    context = await browser.newContext({
      viewport: { width: 1700, height: 800 },
    });
    // One tab reused by all tests
    page = await context.newPage();
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
    await signInButton.click();
    await page.waitForTimeout(2000);
    await page.goto("https://aiaxio.com/submit/");
  });

  test("Submit tool page NavBar visibility", async () => {
    const navbar = page.getByTestId("navbar-aiaxio"); // scope (optional but safer)

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
  });

  test("Submit tool page User profile dropdown links navigate correctly", async ({}, testInfo) => {
    const userProfileLink = page.getByTestId("user-profile-link");

    // Items we expect to see in the dropdown + target URLs
    const cases: { label: string; testId: string; url: RegExp }[] = [
      {
        label: "Dashboard",
        testId: "profile-dropdown-Dashboard",
        url: /dashboard/,
      },
      { label: "Tools", testId: "profile-dropdown-Tools", url: /tools/ },
      { label: "Tasks", testId: "profile-dropdown-Tasks", url: /tasks/ },
      {
        label: "Bookmarks",
        testId: "profile-dropdown-Bookmarks",
        url: /bookmarks/,
      },
      {
        label: "Recommendations",
        testId: "profile-dropdown-Recommendations",
        url: /recommendations/,
      },
      {
        label: "Settings",
        testId: "profile-dropdown-Settings",
        url: /settings/i,
      },
    ];

    // Helper: open the profile menu robustly.
    const openProfileMenu = async () => {
      const anyMenuItem = page
        .locator('[data-testid^="profile-dropdown-"]')
        .first();

      for (let attempt = 0; attempt < 3; attempt++) {
        // 1) Try hover
        await userProfileLink.hover();
        if (await anyMenuItem.isVisible().catch(() => false)) return;

        // 2) Try click
        await userProfileLink.click({ delay: 50 });
        if (await anyMenuItem.isVisible().catch(() => false)) return;

        // 3) Tiny pause for animations
        await page.waitForTimeout(200);
      }

      // If still not open, throw with diagnostics
      const headerHtml = await page
        .locator("header")
        .first()
        .innerHTML()
        .catch(() => "(no header)");
      console.log("DEBUG header HTML:", headerHtml.slice(0, 500));
      const bodyTestIds = await page
        .locator("[data-testid]")
        .evaluateAll((els) => els.map((e) => e.getAttribute("data-testid")));
      console.log("DEBUG testids on page:", bodyTestIds);
      throw new Error("Profile dropdown did not open.");
    };

    // Helper: find a menu item by test id, falling back to role/text if needed
    const getMenuItem = async (label: string, testId: string) => {
      const byId = page.getByTestId(testId);
      if (await byId.count()) return byId;

      const byRole = page.getByRole("menuitem", { name: label, exact: true });
      if (await byRole.count()) return byRole;

      // Fallback: visible text (avoid hidden elements)
      const byText = page
        .locator(`text="${label}"`)
        .filter({ hasNot: page.locator('[aria-hidden="true"]') });
      return byText.first();
    };

    for (const c of cases) {
      await openProfileMenu();

      const item = await getMenuItem(c.label, c.testId);

      // Assert it exists & is visible (print diagnostics if not)
      if (!(await item.isVisible().catch(() => false))) {
        const allItems = await page
          .locator('[data-testid^="profile-dropdown-"]')
          .allTextContents();
        console.log("DEBUG dropdown entries (by testid^):", allItems);
        const menuDump = await page
          .locator('[role="menu"], .dropdown-menu, [data-testid*="dropdown"]')
          .first()
          .innerText()
          .catch(() => "(no menu dump)");
        console.log("DEBUG menu text dump:", menuDump);
      }
      await expect(item, `Menu item "${c.label}" not visible`).toBeVisible({
        timeout: 10000,
      });

      // Navigate and assert URL
      await Promise.all([
        page.waitForURL(c.url, { timeout: 15000 }),
        item.click(),
      ]);
      await expect(page).toHaveURL(c.url);
      // Next iteration: we reopen the menu on the new page.
    }
  });

  test("Submit tool header text visibility", async () => {
    const headerText = page.locator(
      "(//h1[normalize-space()='Launch Your AI Tool to Millions of Targeted Users'])[1]"
    );
    await expect(headerText).toBeVisible();
    await expect(headerText).toHaveText(
      "Launch Your AI Tool to Millions of Targeted Users"
    );
  });

  test.only("Header functionality check", async () => {
    //Submit Your Tool button functionality check
    const submitYourToolButton = page.locator("//button[normalize-space()='Submit Your Tool']");
    await expect(submitYourToolButton).toBeVisible();
    await expect(submitYourToolButton).toHaveText("Submit Your Tool");
    await submitYourToolButton.click();
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL("https://aiaxio.com/submit/add-tool/");
    await page.waitForTimeout(2000);
    await page.goBack();

    //Explore AI Tools button functionality check
    const exploreAIToolButton = page.locator(
      "//button[normalize-space()='Explore AI Tools']"
    );
    await expect(exploreAIToolButton).toBeVisible();
    await expect(exploreAIToolButton).toHaveText("Explore AI Tools");
    await exploreAIToolButton.click();
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL("https://aiaxio.com/tools/");
    await page.goBack();
  });

  test("Submit Tool page Footer Elements visibility", async () => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const homepagefooter = page.locator("footer");
    await expect(homepagefooter).toBeVisible();

    const footerLinksAboutUs = homepagefooter.locator(
      "//a[normalize-space()='About Us']"
    );
    await expect(footerLinksAboutUs).toBeVisible();

    const footerLinksContactUs = homepagefooter.locator(
      "//a[normalize-space()='Contact Us']"
    );
    await expect(footerLinksContactUs).toBeVisible();

    const footerLinksfaq = homepagefooter.locator(
      "//a[normalize-space()='FAQ']"
    );
    await expect(footerLinksfaq).toBeVisible();

    const footerTermsOfService = homepagefooter.locator(
      "//a[normalize-space()='Terms of Service']"
    );
    await expect(footerTermsOfService).toBeVisible();

    const footerPrivacyPolicy = homepagefooter.locator(
      "//a[normalize-space()='Privacy Policy']"
    );
    await expect(footerPrivacyPolicy).toBeVisible();

    const footerCookiesPolicy = homepagefooter.locator(
      "//a[normalize-space()='Cookies Policy']"
    );
    await expect(footerCookiesPolicy).toBeVisible();

    const footerDisclaimer = homepagefooter.locator(
      "//a[normalize-space()='Disclaimer']"
    );
    await expect(footerDisclaimer).toBeVisible();

    const footerLogo = homepagefooter.locator(
      "(//div[@class='flex items-center gap-4'])[1]"
    );
    await expect(footerLogo).toBeVisible();

    const footerSocialMedia = homepagefooter.locator(
      "(//div[@class='flex gap-4'])[1]"
    );
    await expect(footerSocialMedia).toBeVisible();

    // Scroll to the bottom of the page to make the scroll-to-top button visible

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const scrollToTopButton = page.getByTestId("scroll-to-top-button");
    await expect(scrollToTopButton).toBeVisible();
  });
});
