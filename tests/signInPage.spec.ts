import{test,expect, BrowserContext, Page} from '@playwright/test';
//@ts-check
const BASE_URL = 'https://aiaxio.com/signin/';

test.describe('SignIn Page Flow', () => {

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

  test('Sign In page Navbar elements visibility', async () => {
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

test('Sign in with valid email and password', async () => {
  const emailInput = page.getByTestId('email-input');
  await emailInput.fill('abc@gmail.com');

  const passwordInput = page.getByTestId('password-input');
  await passwordInput.fill('You123!!');

  const signInButton = page.getByTestId("submit-button");
  await signInButton.click();
  await page.waitForLoadState('networkidle');
  await expect(page.getByTestId('user-profile-link')).toBeVisible();
});

test('Sign in with invalid email and valid password', async () => {
  const emailInput = page.getByTestId('email-input');
  await emailInput.fill('invalid_email@gmail.com');

  const passwordInput = page.getByTestId('password-input');
  await passwordInput.fill('You123!!');

  const signInButton = page.getByTestId("submit-button");
  await signInButton.click();
  await page.waitForLoadState('networkidle');

  const errorMessage = page.locator("(//div[@class='p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4'])[1]");
  await expect(errorMessage).toBeVisible();
  await expect(errorMessage).toHaveText("User not found");
});

test('Sign in with valid email and invalid password', async () => {
  const emailInput = page.getByTestId('email-input');
  await emailInput.fill('abc@gmail.com');

  const passwordInput = page.getByTestId('password-input');
  await passwordInput.fill('You1234!!');

  const signInButton = page.getByTestId("submit-button");
  await signInButton.click();
  await page.waitForLoadState('networkidle');

  const errorMessage = page.locator("xpath=(//div[@class='p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4'])[1]");
  await expect(errorMessage).toBeVisible();
  await expect(errorMessage).toHaveText("Invalid password");
});

test('Sign in with invalid emails (popup vs inline error)', async () => {
  const invalidEmails = [
    { value: 'plainaddress', type: 'popup' },        // no @ → popup
    { value: 'abc.com', type: 'popup' },             // no @ → popup
    { value: 'user@', type: 'popup' },               // missing domain → popup
    { value: 'user@example', type: 'popup' },        // missing TLD (.com) → popup
    { value: 'user@example.', type: 'popup' },       // incomplete domain → popup
    { value: 'user@.com', type: 'popup' },           // domain starts with dot → popup
    { value: '', type: 'popup' },                    // empty → popup
    { value: '   ', type: 'popup' },                 // only spaces → popup
  ];

  for (const { value, type } of invalidEmails) {
    console.log(` Testing email: "${value}" (expected: ${type})`);

    const emailInput = page.getByTestId('email-input');
    await emailInput.fill(value);

    const passwordInput = page.getByTestId('password-input');
    await passwordInput.fill('ValidPass123!'); // valid password

    const signInButton = page.getByTestId("submit-button");

    if (type === 'popup') {
      page.once('dialog', async (dialog) => {
        expect(dialog.message()).toContain('Must be a valid email address');
        await dialog.dismiss();
      });
      await signInButton.click();
    } else {
      await signInButton.click();
      await page.waitForLoadState('networkidle');

      const errorMessage = page.locator(
        "(//div[@class='p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4'])[1]"
      );
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toHaveText("Must be a valid email address");
    }

    // Reset inputs before next loop
    await emailInput.fill('');
    await passwordInput.fill('');
  }
});

test('Password length validation', async () => {

  const emailInput = page.getByTestId('email-input');
  const passwordInput = page.getByTestId('password-input');
  const submitButton = page.getByTestId('submit-button');

  await emailInput.fill('abc@gmail.com');

  const shortPasswords = ['1245A', 'a', '12345', 'Abc12', 'Abc1234'];

  for (const password of shortPasswords) {
    console.log(`Testing password: "${password}"`);

    await passwordInput.click();      // focus
    await passwordInput.fill('');     // clear first
    await passwordInput.type(password); // type instead of fill

    // Trigger validation
    await passwordInput.blur();
    if (await submitButton.isEnabled()) {
      await submitButton.click();
    }

    // Wait for error message
    const errorMessage = page.locator('p.text-red-500'); 
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
    await expect(errorMessage).toContainText(/at least 8 characters/i);

    // Clear for next iteration
    await passwordInput.fill('');
  }
});

test('Sign In Footer Elements visibility', async () => {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  
  const homepagefooter = page.locator("footer");
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

  // Scroll to the bottom of the page to make the scroll-to-top button visible
  
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const scrollToTopButton = page.getByTestId("scroll-to-top-button");
  await expect(scrollToTopButton).toBeVisible();
});

});