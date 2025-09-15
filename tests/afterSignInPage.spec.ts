import { test, expect, BrowserContext, Page } from "@playwright/test";

const SIGNIN_URL = "https://aiaxio.com/signin/";
const BASE_URL = "https://aiaxio.com";

test.describe("After sign in Page Flow", () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({ viewport: { width: 1700, height: 900 } });
    page = await context.newPage();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test.beforeEach(async () => {
    await page.goto(SIGNIN_URL, { waitUntil: "domcontentloaded" });
    await page.getByTestId("email-input").fill("abc@gmail.com");
    await page.getByTestId("password-input").fill("You123!!");

    await Promise.all([
      page.waitForURL(/aiaxio\.com/i, { timeout: 15000 }),
      page.getByTestId("submit-button").click(),
    ]);

    await expect(page.getByTestId("user-profile-link")).toBeVisible({ timeout: 20000 });
  });

  test('Navbar functionality check', async () => {

    //Navbar logo functionality check
      const navbarLogo = page.getByTestId('navbar-logo');
      await navbarLogo.click();
      await expect(page).toHaveURL(new RegExp(`^${BASE_URL}/?$`));
      //await page.goBack();

      //Navbar Tools link functionality check
      const navbarTools = page.getByTestId('nav-link-Tools');
      await navbarTools.click();
      await expect(page).toHaveURL(`${BASE_URL}/tools/`);
      await page.goBack();

      //Navbar Submit Tool link functionality check
      const navbarSubmitTool = page.getByTestId('nav-link-Submit Tool');
      await navbarSubmitTool.click();
      await expect(page).toHaveURL(`${BASE_URL}/submit/`);  
      await page.goBack();

      //Navbar Search link functionality check
      const navbarSearch = page.getByTestId('nav-link-Search');
      await navbarSearch.click();
      await expect(page).toHaveURL(`${BASE_URL}/search/`);
      await page.goBack();
    });

  
  test('Header button functionality check', async () => {
        const headerJustLanded = page.getByTestId('filter-link-just-landed');
        await expect(headerJustLanded).toBeVisible();
        await expect(headerJustLanded).toHaveText('Just Landed');
        await headerJustLanded.click();
        await expect(page).toHaveURL(new RegExp(`^${BASE_URL}/tools/\\?sortBy=date&sortOrder=desc$`));
        await page.goto(BASE_URL); // Reset to home for next tests
    
        const headerMostPopular = page.getByTestId('filter-link-popular');
        await expect(headerMostPopular).toBeVisible();
        await expect(headerMostPopular).toHaveText('Popular');
        await headerMostPopular.click();
        await expect(page).toHaveURL(new RegExp(`^${BASE_URL}/tools/\\?sortBy=rating&sortOrder=desc$`));
        await page.goto(BASE_URL); // Reset to home for next tests
    
        const headerFreemium = page.getByTestId('filter-link-freemium');
        await expect(headerFreemium).toBeVisible();
        await expect(headerFreemium).toHaveText('Freemium');
        await headerFreemium.click();
        await expect(page).toHaveURL(new RegExp(`^${BASE_URL}/tools/\\?pricingType=freemium$`));
        await page.goto(BASE_URL);
        
        const headerFree = page.getByTestId('filter-link-free');
        await expect(headerFree).toBeVisible();
        await expect(headerFree).toHaveText('Free');
        await headerFree.click();
        await expect(page).toHaveURL(new RegExp(`^${BASE_URL}/tools/\\?pricingType=free$`));
        await page.goto(BASE_URL); // Reset to home for next tests
    
        const headerTrending = page.getByTestId('filter-link-trending');
        await expect(headerTrending).toBeVisible();
        await expect(headerTrending).toHaveText('Trending');
        await headerTrending.click();
        await expect(page).toHaveURL(new RegExp(`^${BASE_URL}/trending/$`));
        await page.goto(BASE_URL); // Reset to home for next tests
    
      });

  test("User profile dropdown links navigate correctly", async ({}, testInfo) => {
    const userProfileLink = page.getByTestId("user-profile-link");

    // Items we expect to see in the dropdown + target URLs
    const cases: { label: string; testId: string; url: RegExp }[] = [
      { label: "Dashboard",       testId: "profile-dropdown-Dashboard",        url: /dashboard/ },
      { label: "Tools",           testId: "profile-dropdown-Tools",            url: /tools/ },
      { label: "Tasks",           testId: "profile-dropdown-Tasks",            url: /tasks/ },
      { label: "Bookmarks",       testId: "profile-dropdown-Bookmarks",        url: /bookmarks/ },
      { label: "Recommendations", testId: "profile-dropdown-Recommendations",  url: /recommendations/ },
      { label: "Settings",        testId: "profile-dropdown-Settings",         url: /settings/i },
    ];

    // Helper: open the profile menu robustly.
    const openProfileMenu = async () => {
      const anyMenuItem = page.locator('[data-testid^="profile-dropdown-"]').first();

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
      const headerHtml = await page.locator("header").first().innerHTML().catch(() => "(no header)");
      console.log("DEBUG header HTML:", headerHtml.slice(0, 500));
      const bodyTestIds = await page.locator("[data-testid]").evaluateAll(els => els.map(e => e.getAttribute("data-testid")));
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
      const byText = page.locator(`text="${label}"`).filter({ hasNot: page.locator('[aria-hidden="true"]') });
      return byText.first();
    };

    for (const c of cases) {
      await openProfileMenu();

      const item = await getMenuItem(c.label, c.testId);

      // Assert it exists & is visible (print diagnostics if not)
      if (!(await item.isVisible().catch(() => false))) {
        const allItems = await page.locator('[data-testid^="profile-dropdown-"]').allTextContents();
        console.log("DEBUG dropdown entries (by testid^):", allItems);
        const menuDump = await page.locator('[role="menu"], .dropdown-menu, [data-testid*="dropdown"]').first().innerText().catch(() => "(no menu dump)");
        console.log("DEBUG menu text dump:", menuDump);
      }
      await expect(item, `Menu item "${c.label}" not visible`).toBeVisible({ timeout: 10000 });

      // Navigate and assert URL
      await Promise.all([
        page.waitForURL(c.url, { timeout: 15000 }),
        item.click(),
      ]);
      await expect(page).toHaveURL(c.url);
      // Next iteration: we reopen the menu on the new page.
    }
  });
});
