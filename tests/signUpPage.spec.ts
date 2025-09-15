import { test, expect, BrowserContext, Page } from '@playwright/test';

// Base URLs
const BASE_URL = 'https://aiaxio.com';
const SIGNUP_URL = `${BASE_URL}/signup/`;

test.describe.serial('SignUp page flow', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    // Use a fixed desktop viewport so navbar buttons are in view
    context = await browser.newContext({ viewport: { width: 1700, height: 900 } });
    page = await context.newPage();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test.beforeEach(async () => {
    if (page.isClosed()) page = await context.newPage();

    // Go straight to the Sign Up page (avoid flaky header click + networkidle)
    await page.goto(SIGNUP_URL, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('name-input')).toBeVisible({ timeout: 10000 });
  });

  test('SignUp page Navbar elements visibility', async () => {
    await expect(page.getByTestId('navbar-logo')).toBeVisible();

    const navTools = page.getByTestId('nav-link-Tools');
    await expect(navTools).toBeVisible();
    await expect(navTools).toHaveText('Tools');

    const navSubmitTools = page.getByTestId('nav-link-Submit Tool');
    await expect(navSubmitTools).toBeVisible();
    await expect(navSubmitTools).toHaveText('Submit Tool');

    const navSearch = page.getByTestId('nav-link-Search');
    await expect(navSearch).toBeVisible();
    await expect(navSearch).toHaveText('Search');

    const navbar = page.getByTestId('navbar-aiaxio');

    const navbarSignIn = navbar.locator('[data-testid="sign-in-button"]:visible');
    await expect(navbarSignIn).toBeVisible();
    await expect(navbarSignIn).toHaveAccessibleName('Sign In');

    const navbarSignUp = navbar.locator('[data-testid="sign-up-button"]:visible');
    await expect(navbarSignUp).toBeVisible();
    await expect(navbarSignUp).toHaveAccessibleName(/Sign Up/i);
  });

  test('SignUp with valid email and password', async () => {
    await page.getByTestId('name-input').fill('Tester');
    await page.getByTestId('email-input').fill('abcd@gmail.com');
    await page.getByTestId('password-input').fill('You123!!');
    await page.getByTestId('confirm-password-input').fill('You123!!');

    await Promise.all([
      page.waitForURL(/email-verification/i, { timeout: 15000 }),
      page.getByTestId('submit-button').click(),
    ]);

    // On verification page
    await expect(page.getByTestId('otp-input-0')).toBeVisible();
    await expect(page.getByTestId('otp-input-1')).toBeVisible();
    await expect(page.getByTestId('otp-input-2')).toBeVisible();
    await expect(page.getByTestId('otp-input-3')).toBeVisible();
    await expect(page.getByTestId('otp-input-4')).toBeVisible();
    await expect(page.getByTestId('otp-input-5')).toBeVisible();

    const verifyButton = page.getByTestId('verify-button');
    await expect(verifyButton).toBeVisible();
    await expect(verifyButton).toHaveText(/Verify Email/i);

    const resendOtp = page.locator("//span[@class='text-orange-500']");
    if (await resendOtp.isVisible()) {
      await resendOtp.click();
    }

    const verificationSignUpButton = page.getByTestId('back-to-signup-link');
    await expect(verificationSignUpButton).toBeVisible();
    await expect(verificationSignUpButton).toHaveText(/Sign Up/i);
  });

  test('Verification page Footer Elements visibility', async () => {
    // Ensure we are on the verification page (this test starts from /signup because of beforeEach)
    if (!/email-verification/i.test(page.url())) {
      await page.getByTestId('name-input').fill('Tester');
      await page.getByTestId('email-input').fill('abcd@gmail.com');
      await page.getByTestId('password-input').fill('You123!!');
      await page.getByTestId('confirm-password-input').fill('You123!!');
      await Promise.all([
        page.waitForURL(/email-verification/i, { timeout: 15000 }),
        page.getByTestId('submit-button').click(),
      ]);
    }

    // Scroll and verify footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    await expect(footer.locator("//a[normalize-space()='About Us']")).toBeVisible();
    await expect(footer.locator("//a[normalize-space()='Contact Us']")).toBeVisible();
    await expect(footer.locator("//a[normalize-space()='FAQ']")).toBeVisible();
    await expect(footer.locator("//a[normalize-space()='Terms of Service']")).toBeVisible();
    await expect(footer.locator("//a[normalize-space()='Privacy Policy']")).toBeVisible();
    await expect(footer.locator("//a[normalize-space()='Cookies Policy']")).toBeVisible();
    await expect(footer.locator("//a[normalize-space()='Disclaimer']")).toBeVisible();

    await expect(footer.locator("(//div[@class='flex items-center gap-4'])[1]")).toBeVisible();
    await expect(footer.locator("(//div[@class='flex gap-4'])[1]")).toBeVisible();
    //await expect(page.getByTestId('scroll-to-top-button')).toBeVisible();
  });
});
