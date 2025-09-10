import{test,expect} from '@playwright/test';
//@ts-check
const BASE_URL = 'https://aiaxio.com';

test.describe('Sign In Page Validation', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    const navbarSignIn = page.getByRole('button', { name: 'Sign In' });
    await navbarSignIn.click();
    await page.waitForLoadState('networkidle');
  });

test('Sign in with valid email and password', async ({ page }) => {
  const emailInput = page.getByTestId('email-input');
  await emailInput.fill('abc@gmail.com');

  const passwordInput = page.getByTestId('password-input');
  await passwordInput.fill('You123!!');

  const signInButton = page.getByTestId("submit-button");
  await signInButton.click();
  await page.waitForLoadState('networkidle');
  await expect(page.getByTestId('user-profile-link')).toBeVisible();
});

test('Sign in with invalid email and valid password', async ({ page }) => {
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

test('Sign in with valid email and invalid password', async ({ page }) => {
  const emailInput = page.getByTestId('email-input');
  await emailInput.fill('abc@gmail.com');

  const passwordInput = page.getByTestId('password-input');
  await passwordInput.fill('You1234!!');

  const signInButton = page.getByTestId("submit-button");
  await signInButton.click();
  await page.waitForLoadState('networkidle');

  const errorMessage = page.locator("(//div[@class='p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4'])[1]");
  await expect(errorMessage).toBeVisible();
  await expect(errorMessage).toHaveText("Invalid password");
});

test('Sign in with invalid emails (popup vs inline error)', async ({ page }) => {
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

test.only('Password length validation', async ({ page }) => {
  await page.goto('https://aiaxio.com/');
  await page.getByRole('button', { name: 'Sign In' }).click();

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



});