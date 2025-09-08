import { test, expect } from '@playwright/test';

//@ts-check
test('has title', async ({ page }) => {
  await page.goto('https://practice.qabrains.com/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/QA Practice Site/);
});

test('Login with valid credentials and write feedback', async ({ page }) => {
  await page.goto('https://practice.qabrains.com/');

  // Fill in the login form.
  await page.fill('//input[@id="email"]', 'qa_testers@qabrains.com');
  await page.waitForTimeout(2000);
  await page.fill('//input[@id="password"]', 'Password123');
  await page.waitForTimeout(2000);

  //click login
  await page.click('//button[@type="submit"]');
  await page.waitForLoadState('networkidle');

  // check user is logged in
  const loginMessage = page.locator('div[class="toaster bg-white rounded-md shadow-lg inline-flex gap-2 items-center min-w-[220px] px-4 py-3"]');
  await expect(loginMessage).toHaveText('Login Successful');
  await page.waitForTimeout(2000);

  // // write Feedback
  // const feedback = page.locator("(//textarea[@placeholder='Write Comment...'])[1]");
  // await feedback.fill("This is a Feedback from Playwright script.");
  // await page.click("(//button[normalize-space()='Submit'])[1]");
  // await page.waitForTimeout(2000);

  // click logout
  await page.click("//button[normalize-space()='Logout']");
  await page.waitForTimeout(2000);
});

test('Login with both invalid credentials', async ({ page }) => {
  await page.goto('https://practice.qabrains.com/');

  // Fill in the login form.
  await page.fill('//input[@id="email"]', 'invalid_user@qabrains.com');
  await page.waitForTimeout(2000);
  await page.fill('//input[@id="password"]', 'InvalidPassword');
  await page.waitForTimeout(2000);

  // click login
  await page.click('//button[@type="submit"]');
  await page.waitForLoadState('networkidle');

  // check user is not logged in
  const errorMessage = page.locator('div[class="toaster bg-white rounded-md shadow-lg inline-flex gap-2 items-center min-w-[220px] px-4 py-3"]');
  await expect(errorMessage).toHaveText('Your email and password both are invalid!');
  await page.waitForTimeout(2000);
});

test('Login with invalid Email', async ({ page }) => {
  await page.goto('https://practice.qabrains.com/');

  // Fill in the login form.
  await page.fill('//input[@id="email"]', 'invaliduser@qabrains.com');
  await page.waitForTimeout(2000);
  await page.fill('//input[@id="password"]', 'Password123');
  await page.waitForTimeout(2000);

  // click login
  await page.click('//button[@type="submit"]');
  await page.waitForLoadState('networkidle');

  // check user is not logged in
  const errorMessage = page.locator('div[class="toaster bg-white rounded-md shadow-lg inline-flex gap-2 items-center min-w-[220px] px-4 py-3"]');
  await expect(errorMessage).toHaveText('Your email is invalid!');
  await page.waitForTimeout(2000);
});

test('Login with invalid Password', async ({ page }) => {
  await page.goto('https://practice.qabrains.com/');

  // Fill in the login form.
  await page.fill('//input[@id="email"]', 'qa_testers@qabrains.com');
  await page.waitForTimeout(2000);
  await page.fill('//input[@id="password"]', 'Password1234');
  await page.waitForTimeout(2000);

  // click login
  await page.click('//button[@type="submit"]');
  await page.waitForLoadState('networkidle');

  // check user is not logged in
  const errorMessage = page.locator('div[class="toaster bg-white rounded-md shadow-lg inline-flex gap-2 items-center min-w-[220px] px-4 py-3"]');
  await expect(errorMessage).toHaveText('Your password is invalid!');
  await page.waitForTimeout(2000);
});

test('Check Navbar Visibility', async ({ page }) => {
  await page.goto('https://practice.qabrains.com/');

  // check if navbar logo is visible
  const navLogo = page.locator("img[alt='Logo']");
  await expect(navLogo).toBeVisible();
  await page.waitForTimeout(2000);

   // check if navbar Home link is visible
  const navHomeLink = page.locator("(//a[normalize-space()='Home'])[1]");
  await expect(navHomeLink).toBeVisible();
  await page.waitForTimeout(2000);

   // check if navbar QA link is visible
  const navQALink = page.locator("(//a[normalize-space()='QA Topics'])[1]");
  await expect(navQALink).toBeVisible();
  await page.waitForTimeout(2000);

  // check if navbar Discussion link is visible
  const navDiscussion = page.locator("(//a[@class='inline-block'][normalize-space()='Discussion'])[1]");
  await expect(navDiscussion).toBeVisible();
  await page.waitForTimeout(2000);

  // check if navbar Tags link is visible
  const navTags = page.locator("(//a[normalize-space()='Tags'])[1]");
  await expect(navTags).toBeVisible();
  await page.waitForTimeout(2000);

   // check if navbar Jobs link is visible
  const navJobs = page.locator("(//a[normalize-space()='Jobs'])[1]");
  await expect(navJobs).toBeVisible();
  await page.waitForTimeout(2000);

  // check if navbar Practice Site link is visible
  const navPracticeSite = page.locator("(//a[normalize-space()='Practice Site'])[1]");
  await expect(navPracticeSite).toBeVisible();
  await page.waitForTimeout(2000);

  // check if navbar About Us link is visible
  const navAboutUs = page.locator("(//a[@class='inline-block'][normalize-space()='About Us'])[1]");
  await expect(navAboutUs).toBeVisible();
  await page.waitForTimeout(2000);

  // check if navbar Sign In link is visible
  const navSignIn = page.locator("(//a[normalize-space()='Sign In'])[1]");
  await expect(navSignIn).toBeVisible();
  await page.waitForTimeout(2000);

});