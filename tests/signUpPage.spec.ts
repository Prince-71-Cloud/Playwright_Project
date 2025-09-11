import { test, expect, BrowserContext, Page } from '@playwright/test';

//@ts-check
const BASE_URL = 'https://aiaxio.com';

test.describe.serial('SignUp page flow', () => {
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
    const navbarSignUpBtn = page.getByRole('button', { name: 'Sign Up' });
    await navbarSignUpBtn.click();
    await page.waitForLoadState('networkidle');
  });

  test('SignUp page Navbar elements visibility', async () => {
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

    const navbar = page.getByTestId('navbar-aiaxio');
    const navbarSignIn = navbar.locator('[data-testid="sign-in-button"]:visible');
    await expect(navbarSignIn).toBeVisible();
    await expect(navbarSignIn).toHaveAccessibleName('Sign In');

    const navbarSignUp = navbar.locator('[data-testid="sign-up-button"]:visible');
    await expect(navbarSignUp).toBeVisible();
    await expect(navbarSignUp).toHaveAccessibleName(/Sign Up/i);
  });

  test('SignUp with valid email and password', async () => {
    const nameInput = page.getByTestId('name-input');
    await nameInput.fill('Tester');

    const emailInput = page.getByTestId('email-input');
    await emailInput.fill('abcd@gmail.com');

    const passwordInput = page.getByTestId('password-input');
    await passwordInput.fill('You123!!');

    const confirmPasswordInput = page.getByTestId('confirm-password-input');
    await confirmPasswordInput.fill('You123!!');

    const signInButton = page.getByTestId('submit-button');
    await signInButton.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/email-verification/i);
    await page.waitForLoadState('networkidle');

    const varificationOTP01 = page.getByTestId('otp-input-0');
    await expect(varificationOTP01).toBeVisible();

    const varificationOTP02 = page.getByTestId('otp-input-1');
    await expect(varificationOTP02).toBeVisible();

    const varificationOTP03 = page.getByTestId('otp-input-2');
    await expect(varificationOTP03).toBeVisible();

    const varificationOTP04 = page.getByTestId('otp-input-3');
    await expect(varificationOTP04).toBeVisible();

    const varificationOTP05 = page.getByTestId('otp-input-4');
    await expect(varificationOTP05).toBeVisible();

    const varificationOTP06 = page.getByTestId('otp-input-5');
    await expect(varificationOTP06).toBeVisible();

    const verifyButton = page.getByTestId('verify-button');
    await expect(verifyButton).toBeVisible();
    await expect(verifyButton).toHaveText(/Verify Email/i);

    const resendOtp = page.locator("//span[@class='text-orange-500']");
    await expect(resendOtp).toBeVisible();
    await resendOtp.click();

    const verificationSignUpButton = page.getByTestId('back-to-signup-link');
    await expect(verificationSignUpButton).toBeVisible();
    await expect(verificationSignUpButton).toHaveText(/Sign Up/i);
  });

  test('Verification page Footer Elements visibility', async () => {
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
