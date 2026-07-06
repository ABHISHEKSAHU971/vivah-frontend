import { test, expect } from '@playwright/test';

test.describe('Catering Listing Creation & Master Menu Selection E2E Flow', () => {

  test.beforeEach(async ({ context }) => {
    // Clear cookies/localstorage to start fresh
    await context.clearCookies();
  });

  test('Caterer vendor should be able to authenticate, create a listing, search catalog dishes, add custom dishes, and verify the default package tier', async ({ page }) => {
    // Set higher timeout for turbopack compilation
    test.setTimeout(90000);
    // 1. Authenticate as a Vendor first
    await page.goto('/vendor/login');
    await expect(page.getByText('Vendor Console')).toBeVisible();

    // Fill registered vendor phone number
    await page.locator('#vendor-phone').fill('9999999999');

    // Trigger OTP send
    const sendOtpPromise = page.waitForResponse(response => 
      response.url().includes('/auth/send-otp/') && response.request().method() === 'POST'
    );
    await page.click('button:has-text("Send OTP")');
    const sendOtpResponse = await sendOtpPromise;
    const sendOtpJson = await sendOtpResponse.json();
    const devOtp = sendOtpJson.data?.dev_otp || sendOtpJson.dev_otp;

    expect(devOtp).toBeDefined();

    // Enter correct OTP and wait for verification response
    const verifyOtpPromise = page.waitForResponse(response => 
      response.url().includes('/auth/verify-otp/') && response.request().method() === 'POST'
    );
    await page.locator('#vendor-otp').fill(String(devOtp));
    await page.click('button:has-text("Verify & Login")');
    await verifyOtpPromise;

    // 2. Navigate directly to the add caterer listing wizard
    await page.goto('/vendor/listings/add/form?type=caterer');

    // --- STEP 1: Basic Info ---
    await page.locator('input[name="name"]').fill('Amelia E2E Caterers');
    await page.locator('textarea[name="description"]').fill('Professional E2E wedding caterers providing luxury food services.');
    await page.locator('input[name="address"]').fill('456 Food Plaza, MP Nagar');
    await page.locator('input[name="city"]').fill('Bhopal');
    await page.locator('input[name="state"]').fill('Madhya Pradesh');

    // Proceed to Step 2
    await page.click('button:has-text("Configure Details")');

    // --- STEP 2: Branch & Cuisine Settings ---
    // Wait for Step 2 header to load
    await expect(page.getByText('Business Profile & Branches')).toBeVisible();

    // Select a cuisine button (South Indian)
    await page.click('button:has-text("South Indian")');

    // Proceed to Step 3
    await page.click('button:has-text("Master Menu Library")');

    // --- STEP 3: Master Menu Library ---
    await expect(page.getByText('Master Menu Library')).toBeVisible();

    // Verify catalog dropdown is visible (since database is seeded)
    const catalogSelect = page.locator('#select-master-food');
    await expect(catalogSelect).toBeVisible();

    // Change course dropdown to "Soup"
    const courseSelect = page.locator('#new-dish-course');
    await courseSelect.selectOption('soup');

    // Select the first standard soup from the filtered catalog select
    await catalogSelect.selectOption({ index: 1 });

    // Click "+ Add Dish"
    await page.click('button:has-text("+ Add Dish")');

    // Verify it appeared in the library table
    await expect(page.locator('tbody tr')).toHaveCount(1);
    await expect(page.locator('tbody tr').first().locator('td').first()).toContainText('Soup');

    // Add a custom dish
    await courseSelect.selectOption('special_veg');
    await page.locator('#new-dish-name').fill('Custom Paneer E2E Special');
    await page.locator('#new-dish-desc').fill('Slow cooked cottage cheese in special E2E spices');
    
    // Add the custom dish
    await page.click('button:has-text("+ Add Dish")');

    // Verify the second dish is added
    await expect(page.locator('tbody tr')).toHaveCount(2);

    // Proceed to Step 4
    await page.click('button:has-text("Package Tiers")');

    // --- STEP 4: Package Tiers ---
    await expect(page.getByText('Package Tiers (Plans)')).toBeVisible();

    // Verify that the default "Reception Dinner Platinum" package is present and configured
    const packageNameInput = page.locator('input[placeholder="e.g. Silver Plan, Premium Gold Banquet"]');
    await expect(packageNameInput).toHaveValue('Reception Dinner Platinum');

    const pricePerPlateInput = page.locator('input[placeholder="e.g. 450"]');
    await expect(pricePerPlateInput).toHaveValue('1200');

    const minPlatesInput = page.locator('input[placeholder="e.g. 80"]');
    await expect(minPlatesInput).toHaveValue('100');

    const packageDescriptionTextarea = page.locator('textarea[placeholder*="Briefly describe what makes this plan unique"]');
    await expect(packageDescriptionTextarea).toContainText('Starters: Live Counters');
  });

});
