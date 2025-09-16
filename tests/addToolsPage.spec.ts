import { test, expect, BrowserContext, Page } from "@playwright/test";
import { randomInt } from "crypto";
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
    await page.waitForLoadState("networkidle");

    const submitToolLink = page.getByTestId("nav-link-Submit Tool");
    await submitToolLink.click();
    await page.waitForLoadState("networkidle");

    const submitYourToolButton = page.locator(
      "//button[normalize-space()='Submit Your Tool']"
    );
    await expect(submitYourToolButton).toBeVisible();
    await expect(submitYourToolButton).toHaveText("Submit Your Tool");
    await submitYourToolButton.click();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL("https://aiaxio.com/submit/add-tool/");
  });

  test("add tool page NavBar visibility", async () => {
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

  test("add tool page User profile dropdown links navigate correctly", async ({}, testInfo) => {
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

  //Basic Information form check
  test.only("Submit Tool page Basic Information form ", async () => {
    // Fill all required fields before interacting with the date picker
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const HH = String(now.getHours()).padStart(2, "0");
    const MM = String(now.getMinutes()).padStart(2, "0");
    const SS = String(now.getSeconds()).padStart(2, "0");

    const toolRandomName = `Test Tool Name ${yyyy}${mm}${dd}${HH}${MM}${SS}`;
    const toolName = page.getByTestId("input-toolName");
    await expect(toolName).toBeVisible();
    await toolName.fill(toolRandomName);

    const platformUrls = page.getByTestId("input-platformURLs.0.url");
    await expect(platformUrls).toBeVisible();
    await platformUrls.fill(
      `https://www.test${yyyy}${mm}${dd}${HH}${MM}${SS}.com`
    );

    const toolOverview = page.getByTestId("input-toolOverview");
    await expect(toolOverview).toBeVisible();
    await toolOverview.fill(
      `This is test tool overview for testing purpose.${yyyy}-${mm}-${dd} ${HH}:${MM}:${SS}`
    );

    const toolDescription = page.locator('div[data-testid="tool-description-editor"] [contenteditable="true"]');
    await expect(toolDescription).toBeVisible();
    await toolDescription.fill('This is your tool description text.');
    await page.waitForTimeout(2000); // wait for 1 second to ensure the text is entered properly

    // Select at least one input type
    const inputTypes = page.getByTestId("suggestion-text-inputTypes");
    await expect(inputTypes).toBeVisible();
    await inputTypes.click();

    // Select at least one output type
    const outputTypes = page.getByTestId("suggestion-image-outputTypes");
    await expect(outputTypes).toBeVisible();
    await outputTypes.click();

    // Select a pricing plan
    const pricingPlan = page.locator("//div[@role='radiogroup']//div[1]");
    await expect(pricingPlan).toBeVisible();
    await pricingPlan.click();

    // Fill version number
    const versionRelease1 = page.getByTestId("version-number-0");
    await expect(versionRelease1).toBeVisible();
    await versionRelease1.fill(`1.0.0`);

    // --- Open the picker ---
    const releaseDate1 = page.getByTestId("datetime-picker-button");
    await expect(releaseDate1).toBeVisible();
    await releaseDate1.click();

    // Calendar lives inside the datepicker dialog
    const dateDialog = page.getByRole("dialog");
    await expect(dateDialog).toBeVisible();

    // --- Pick a random MONTH ---
    const monthBtn = page.getByTestId("month-select");
    await expect(monthBtn).toBeVisible();
    await monthBtn.click();

    const monthListbox = page.getByRole("listbox");
    await expect(monthListbox).toBeVisible();
    const monthOptions = monthListbox.getByRole("option");
    await expect(monthOptions.first()).toBeVisible();

    const mCount = await monthOptions.count();
    await monthOptions.nth(randomInt(mCount)).click();

    // Ensure the month listbox is closed before moving on
    await expect(monthListbox).toBeHidden();

    // --- Pick a random YEAR ---
    const yearBtn = page.getByTestId("year-select");
    await expect(yearBtn).toBeVisible();
    await yearBtn.click();

    const yearListbox = page.getByRole("listbox");
    await expect(yearListbox).toBeVisible();
    const yearOptions = yearListbox.getByRole("option");
    await expect(yearOptions.first()).toBeVisible();

    const yCount = await yearOptions.count();
    await yearOptions.nth(randomInt(yCount)).click();

    // Ensure the year listbox closes and calendar is interactable again
    await expect(yearListbox).toBeHidden();

    // --- Pick a random DAY from the visible month ---
    const calendar = dateDialog.getByRole("grid"); // do not rely on month-year name
    await expect(calendar).toBeVisible();

    const dayButtons = calendar
      .getByRole("gridcell")
      .locator("button:not(:disabled)");
    await expect(dayButtons.first()).toBeVisible({ timeout: 10000 }); // allow re-render

    const dCount = await dayButtons.count();
    const dayIdx = randomInt(dCount);

    // Optional logging helps debugging
    console.log("Picked day:", await dayButtons.nth(dayIdx).innerText());

    await dayButtons.nth(dayIdx).click();

    //release Note
    const releaseNotesText = page.getByTestId("release-notes-editor-0");
    await expect(releaseNotesText).toBeVisible();
    await releaseNotesText.fill("This is release note for version 1.0.0");
    await page.waitForTimeout(1000); // wait for 1 second to ensure the text is entered properly

    //status
    const status = page.getByTestId("status-select-0");
    await expect(status).toBeVisible();
    await status.click();
    
    const statusActive = page.getByTestId("status-active-0");
    await expect(statusActive).toBeVisible();
    await statusActive.click();

    const statusbeta = page.getByTestId("status-beta-0");
    await expect(statusbeta).toBeVisible();
    await statusbeta.click();

    const statusAlpha = page.getByTestId("status-alpha-0");
    await expect(statusAlpha).toBeVisible();
    await statusAlpha.click();
    await page.waitForTimeout(2000); // wait for 1 second to ensure the text is entered properly

    const addMoreVersion = page.getByTestId("add-more-version-button");
    await expect(addMoreVersion).toBeVisible();
    await addMoreVersion.click();
    await page.waitForTimeout(2000); // wait for 1 second to ensure the text is entered properly
    
    const removeMoreVersion = page.getByTestId("remove-version-1");
    await expect(removeMoreVersion).toBeVisible();
    await removeMoreVersion.click();
    await page.waitForTimeout(2000); // wait for 1 second to ensure the text is entered properly  

    //next step button
    const nextStepButton = page.getByTestId("next-step-button");
    await expect(nextStepButton).toBeVisible();
    await nextStepButton.click();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL("https://aiaxio.com/submit/tool-categories/");
  }
  );

  test("add Tool page Footer Elements visibility", async () => {
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
