// tests/login.spec.ts
import { test, expect, BrowserContext, Page } from '@playwright/test';

const BASE_URL = 'https://aiaxio.com';

test.describe.serial('Login Page Validation', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    // One window for the whole file
    context = await browser.newContext({ viewport: null });
    // One tab reused by all tests
    page = await context.newPage();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test.beforeEach(async () => {
    await page.goto(BASE_URL);
  });

  test('Navigation Bar visibility', async () => {
    const navbar = page.getByTestId('navbar-aiaxio'); // scope (optional but safer)

    const navbarLogo = page.getByTestId('navbar-logo');
    await expect(navbarLogo).toBeVisible();

    const navbarHome = page.getByTestId('nav-link-Tools');
    await expect(navbarHome).toBeVisible();
    await expect(navbarHome).toHaveText('Tools');

    const navbarSubmitTools = page.getByTestId('nav-link-Submit Tool');
    await expect(navbarSubmitTools).toBeVisible();
    await expect(navbarSubmitTools).toHaveText('Submit Tool');

    const navbarSearch = page.getByTestId('nav-link-Search');
    await expect(navbarSearch).toBeVisible();
    await expect(navbarSearch).toHaveText('Search');

    // Use role + exact name; scoped to navbar to avoid duplicates
    const navbarSignIn = navbar.getByRole('button', { name: /^Sign In$/ });
    await expect(navbarSignIn).toBeVisible();
    await expect(navbarSignIn).toHaveAccessibleName('Sign In');

    const navbarSignUp = navbar.getByRole('button', { name: /^Sign Up$/ });
    await expect(navbarSignUp).toBeVisible();
    await expect(navbarSignUp).toHaveAccessibleName('Sign Up');
  });

  test('Navbar logo functionality check', async () => {
    const navbarLogo = page.getByTestId('navbar-logo');
    await navbarLogo.click();
    await expect(page).toHaveURL(new RegExp(`^${BASE_URL}/?$`));
  });

  test('Navbar Tools link functionality check', async () => {
    const navbarTools = page.getByTestId('nav-link-Tools');
    await navbarTools.click();
    await expect(page).toHaveURL(`${BASE_URL}/tools/`);
  });

  test('Navbar Submit Tool link functionality check', async () => {
    const navbarSubmitTool = page.getByTestId('nav-link-Submit Tool');
    await navbarSubmitTool.click();
    await expect(page).toHaveURL(`${BASE_URL}/submit/`);
  });

  test('Navbar Search link functionality check', async () => {
    const navbarSearch = page.getByTestId('nav-link-Search');
    await navbarSearch.click();
    await expect(page).toHaveURL(`${BASE_URL}/search/`);
  });

  test('Navbar Sign In button functionality check', async () => {
    const navbar = page.getByTestId('navbar-aiaxio');
    const navbarSignIn = navbar.getByRole('button', { name: /^Sign In$/ });
    await navbarSignIn.click();

    // Adjust this if your real path differs
    await expect(page).toHaveURL(/\/(signin|sign-in|login)\/?/i);
  });

  test('Navbar Sign Up button functionality check', async () => {
    const navbar = page.getByTestId('navbar-aiaxio');
    const navbarSignUp = navbar.getByRole('button', { name: /^Sign Up$/ });
    await navbarSignUp.click();
    await expect(page).toHaveURL(`${BASE_URL}/signup/`);
  });

  test('Home page heading part visibility', async () => {
    await expect(page).toHaveTitle(/AI Tools/i);

    // (Keep your existing locators; swap to role-based when convenient)
    const homePageH1 = page.locator('xpath=/html[1]/body[1]/div[1]/div[1]/div[1]/div[1]/h1[1]');
    await expect(homePageH1).toBeVisible();
    await expect(homePageH1).toHaveText(/AIAXIO-AI Matched To Your Need/i);

    const homepageParagraph = page.locator('xpath=/html[1]/body[1]/div[1]/div[1]/div[1]/div[1]/p[1]');
    await expect(homepageParagraph).toBeVisible();

    const homePageSearchBox = page.getByTestId('tool-search-input');
    await expect(homePageSearchBox).toBeVisible();

    const homepageJustLanded = page.getByTestId('filter-link-just-landed');
    await expect(homepageJustLanded).toBeVisible();
    await expect(homepageJustLanded).toHaveText('Just Landed');

    const homepageMostPopular = page.getByTestId('filter-link-popular');
    await expect(homepageMostPopular).toBeVisible();
    await expect(homepageMostPopular).toHaveText('Popular');

    const homepageFreemium = page.getByTestId('filter-link-freemium');
    await expect(homepageFreemium).toBeVisible();
    await expect(homepageFreemium).toHaveText('Freemium');

    const homepageFree = page.getByTestId('filter-link-free');
    await expect(homepageFree).toBeVisible();
    await expect(homepageFree).toHaveText('Free');

    const homepageTrending = page.getByTestId('filter-link-trending');
    await expect(homepageTrending).toBeVisible();
    await expect(homepageTrending).toHaveText('Trending');
  });

  test('Latest AI Tools section visibility', async () => {
    const latestAIToolsTitle = page.locator("xpath=//h2[normalize-space()='Latest AI Tools']");
    await expect(latestAIToolsTitle).toBeVisible();

    const latestAIToolsViewAll = page.getByTestId('view-all-newly-released-tools');
    await expect(latestAIToolsViewAll).toBeVisible();

    const latestAIToolsCards = page.getByTestId('new-release-tools-grid');
    await expect(latestAIToolsCards).toBeVisible();
  });

  test('AI for Education section visibility', async () => {
    const aiEducationTitle = page.locator("xpath=//h2[normalize-space()='AI for Education']");
    await expect(aiEducationTitle).toBeVisible();

    const aiEducationViewAll = page.getByTestId('view-tools-education');
    await expect(aiEducationViewAll).toBeVisible();

    const aiEducationCards = page.getByTestId('tools-grid-education');
    await expect(aiEducationCards).toBeVisible();
  });

  test('AI writing Assistant section visibility', async () => {
    const aiWritingAssistantTitle = page.locator("xpath=//h2[normalize-space()='AI Writing Assistants']");
    await expect(aiWritingAssistantTitle).toBeVisible();

    const aiWritingAssistantViewAll = page.getByTestId('view-tools-writing');
    await expect(aiWritingAssistantViewAll).toBeVisible();

    const aiWritingAssistantCards = page.getByTestId('tools-grid-writing');
    await expect(aiWritingAssistantCards).toBeVisible();
  });

  test('AI Coding Tools section visibility', async () => {
    const aiCodingToolsTitle = page.locator("xpath=//h2[normalize-space()='AI Coding Tools']");
    await expect(aiCodingToolsTitle).toBeVisible();

    const aiCodingToolsViewAll = page.getByTestId('view-tools-coding');
    await expect(aiCodingToolsViewAll).toBeVisible();

    const aiCodingToolsCards = page.getByTestId('tools-grid-coding');
    await expect(aiCodingToolsCards).toBeVisible();
  });

  test('Home page Footer Elements visibility', async () => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const homepagefooter = page.locator('footer');
    await expect(homepagefooter).toBeVisible();

    const footerLinksAboutUs = homepagefooter.locator("//a[normalize-space()='About Us']");
    await expect(footerLinksAboutUs).toBeVisible();

    const footerLinksContactUs = homepagefooter.locator("//a[normalize-space()='Contact Us']");
    await expect(footerLinksContactUs).toBeVisible();

    const footerLinksfaq = homepagefooter.locator("//a[normalize-space()='FAQ']");
    await expect(footerLinksfaq).toBeVisible();

    const footerTermsOfService = homepagefooter.locator("//a[normalize-space()='Terms of Service']");
    await expect(footerTermsOfService).toBeVisible();

    const footerPrivacyPolicy = homepagefooter.locator("//a[normalize-space()='Privacy Policy']");
    await expect(footerPrivacyPolicy).toBeVisible();

    const footerCookiesPolicy = homepagefooter.locator("//a[normalize-space()='Cookies Policy']");
    await expect(footerCookiesPolicy).toBeVisible();

    const footerDisclaimer = homepagefooter.locator("//a[normalize-space()='Disclaimer']");
    await expect(footerDisclaimer).toBeVisible();

    const footerLogo = homepagefooter.locator("(//div[@class='flex items-center gap-4'])[1]");
    await expect(footerLogo).toBeVisible();

    const footerSocialMedia = homepagefooter.locator("(//div[@class='flex gap-4'])[1]");
    await expect(footerSocialMedia).toBeVisible();

    const scrollToTopButton = page.getByTestId('scroll-to-top-button');
    await expect(scrollToTopButton).toBeVisible();
  });
});
