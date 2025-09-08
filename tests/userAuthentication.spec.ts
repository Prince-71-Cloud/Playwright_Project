import{test,expect} from '@playwright/test';
//@ts-check
test('User Authentication Dropdown', async ({ page }) => {
  await page.goto('https://practice.qabrains.com/');

  // User Authentication Dropdown
    const userAuthDropdown = page.locator('text=User Authentication');
    await expect(userAuthDropdown).toBeVisible();
    await userAuthDropdown.click();

    // Click Registration 
    const registrationOption = page.locator('text=Registration');
    await expect(registrationOption).toBeVisible();
    await registrationOption.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('https://practice.qabrains.com/registration');

    // Click Forgot Password 
    const forgotPasswordDropdownOption = page.locator('text=Forgot Password');
    await expect(forgotPasswordDropdownOption).toBeVisible();
    await forgotPasswordDropdownOption.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('https://practice.qabrains.com/forgot-password');

    await page.close();
});