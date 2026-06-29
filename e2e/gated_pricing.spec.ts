import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';

test.describe('Gated Pricing E2E Flow', () => {
  
  test.beforeEach(async ({ context }) => {
    // Clear cookies & state to force anonymous state
    await context.clearCookies();
  });

  test('Anonymous user should see locked pricing, enter invalid info, complete OTP verify, tweak customizer, and submit inquiry', async ({ page }) => {
    
    // 1. Access listing -> navigate to detail -> verify pricing is locked
    await page.goto('/');
    
    // Locate the first link to Jonty Garden (id: 1) and click it
    const jontyGardenLink = page.locator('a[href="/venues/1"]').first();
    await jontyGardenLink.click();
    
    await page.waitForURL('**/venues/1');
    
    // Verify pricing is locked
    await expect(page.getByText('Pricing Locked')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Unlock Quote' })).toBeVisible();

    // 2. Click "Unlock Quote" and test invalid phone/OTP validator alerts
    await page.click('button:has-text("Unlock Quote")');
    
    // Step 1: details modal should be visible
    await expect(page.getByText('Unlock Detailed Quote')).toBeVisible();
    
    // Fill Name but invalid phone to check validation alert
    await page.locator('input[placeholder="John Doe"]').fill('E2E Tester');
    await page.locator('input[placeholder="98765 43210"]').fill('99999');
    await page.click('button:has-text("Request OTP to Unlock Quote")');
    await expect(page.getByText('Please enter a valid 10-digit mobile number.')).toBeVisible();
    
    // Fill invalid phone (e.g. 5 digits)
    await page.locator('input[placeholder="98765 43210"]').fill('99999');
    await page.click('button:has-text("Request OTP to Unlock Quote")');
    await expect(page.getByText('Please enter a valid 10-digit mobile number.')).toBeVisible();
    
    // Fill valid phone but missing date/guests
    await page.locator('input[placeholder="98765 43210"]').fill('9999933333');
    await page.click('button:has-text("Request OTP to Unlock Quote")');
    await expect(page.getByText('Please enter a valid guest count.')).toBeVisible();
    
    // Fill guests but missing date
    await page.locator('input[placeholder="e.g. 150"]').fill('200');
    await page.click('button:has-text("Request OTP to Unlock Quote")');
    await expect(page.getByText('Please select your event date.')).toBeVisible();
    
    // Fill date
    await page.locator('input[type="date"]').fill('2026-11-20');
    
    // Now trigger OTP send mutation
    // We start listening to the OTP send network call to extract the dev OTP
    const sendOtpPromise = page.waitForResponse(response => 
      response.url().includes('/auth/otp/send/') && response.request().method() === 'POST'
    );
    await page.click('button:has-text("Request OTP to Unlock Quote")');
    const sendOtpResponse = await sendOtpPromise;
    const sendOtpJson = await sendOtpResponse.json();
    const devOtp = sendOtpJson.data?.dev_otp || sendOtpJson.dev_otp;
    
    expect(devOtp).toBeDefined();
    
    // Verify Step 2 OTP grid screen loaded
    await expect(page.getByText('Enter 4-Digit Verification Code')).toBeVisible();
    
    // Enter invalid OTP first
    const otpInputs = page.locator('input[inputmode="numeric"]');
    for (let i = 0; i < 4; i++) {
      await otpInputs.nth(i).fill(((Number(devOtp[i]) + 1) % 10).toString());
    }
    await page.click('button:has-text("Verify & Unlock Quote")');
    await expect(page.getByText('Incorrect verification code. Please check and try again.')).toBeVisible();
    
    // 3. Enter correct OTP -> verify modal closes, pricing unblurs, interactive controls update totals
    // Clear inputs first
    for (let i = 0; i < 4; i++) {
      await otpInputs.nth(i).fill('');
    }
    
    // Enter correct OTP
    for (let i = 0; i < 4; i++) {
      await otpInputs.nth(i).fill(devOtp[i]);
    }
    await page.click('button:has-text("Verify & Unlock Quote")');
    
    // Verify modal closes and locked overlay is gone
    await expect(page.getByText('Unlock Detailed Quote')).toBeHidden();
    await expect(page.getByText('Pricing Locked')).toBeHidden();
    
    // Locate guests input inside interactive controls
    const guestsInput = page.locator('label:has-text("Guests Count") + input');
    await expect(guestsInput).toBeVisible();
    
    // Confirm initial guest count matches Step 1 details
    await expect(guestsInput).toHaveValue('200');
    
    // Change guest count to 300 and verify recalculations
    const subtotalText = page.locator('span:has-text("Subtotal") + span');
    const totalQuoteText = page.locator('span:has-text("Total Quote") + span');
    
    const initialSubtotal = await subtotalText.innerText();
    const initialTotal = await totalQuoteText.innerText();
    
    await guestsInput.fill('300');
    
    // Wait for pricing update
    await page.waitForTimeout(200);
    
    const updatedSubtotal = await subtotalText.innerText();
    const updatedTotal = await totalQuoteText.innerText();
    
    expect(updatedSubtotal).not.toEqual(initialSubtotal);
    expect(updatedTotal).not.toEqual(initialTotal);
    
    // Check package cards comparisons at the bottom
    await expect(page.getByText('Compare Package Quotes')).toBeVisible();
    await expect(page.getByText('Venue Rent Only')).toBeVisible();
    await expect(page.getByText('All-Inclusive Standard')).toBeVisible();
    await expect(page.getByText('Custom Designer')).toBeVisible();

    // 4. Click "Request Site Visit" -> verify database contains lead with all customized selections
    // Wait for the Request Site Visit button
    const requestVisitBtn = page.getByRole('button', { name: 'Request Site Visit' });
    await expect(requestVisitBtn).toBeVisible();
    await requestVisitBtn.click();
    
    // Wait for success alert
    await expect(page.getByText('Site Visit Request Received!')).toBeVisible();
    
    // Run verification query directly against the Django backend DB via Node child_process
    const backendDir = path.resolve(__dirname, '../../celebrationplatform');
    const pythonExe = path.join(backendDir, 'venv/Scripts/python.exe');
    const managePy = path.join(backendDir, 'manage.py');
    const queryCommand = `"${pythonExe}" "${managePy}" shell -c "from apps.venues.models import VenueInquiry; print([(i.name, i.phone, i.guest_count) for i in VenueInquiry.objects.filter(phone=\'+919999933333\')])"`;
    
    const dbOutput = execSync(queryCommand, { cwd: backendDir }).toString().trim();
    console.log("Database Inquiry Records:", dbOutput);
    
    // Verify lead is in the database with 300 guests
    expect(dbOutput).toContain('E2E Tester');
    expect(dbOutput).toContain('+919999933333');
    expect(dbOutput).toContain('300');
  });

  test('Verified user selecting external packages should update pricing and record package IDs in DB', async ({ page }) => {
    
    // 1. Navigate to details page for venue 1
    await page.goto('/venues/1');
    await expect(page.getByText('Pricing Locked')).toBeVisible();

    // 2. Unlock quote
    await page.click('button:has-text("Unlock Quote")');
    await page.locator('input[placeholder="John Doe"]').fill('External E2E Tester');
    await page.locator('input[placeholder="98765 43210"]').fill('9999944444');
    await page.locator('input[placeholder="e.g. 150"]').fill('250');
    await page.locator('input[type="date"]').fill('2026-11-20');

    const sendOtpPromise = page.waitForResponse(response => 
      response.url().includes('/auth/otp/send/') && response.request().method() === 'POST'
    );
    await page.click('button:has-text("Request OTP to Unlock Quote")');
    const sendOtpResponse = await sendOtpPromise;
    const sendOtpJson = await sendOtpResponse.json();
    const devOtp = sendOtpJson.data?.dev_otp || sendOtpJson.dev_otp;
    
    expect(devOtp).toBeDefined();

    const otpInputs = page.locator('input[inputmode="numeric"]');
    for (let i = 0; i < 4; i++) {
      await otpInputs.nth(i).fill(devOtp[i]);
    }
    await page.click('button:has-text("Verify & Unlock Quote")');
    
    await expect(page.getByText('Unlock Detailed Quote')).toBeHidden();
    await expect(page.getByText('Pricing Locked')).toBeHidden();

    // 3. Click "External Vendor" button under Decor Choice to reveal external selectors
    await page.click('button:has-text("External Vendor")');

    // Wait for available catering packages to be fetched and dropdowns to render
    const cateringSelect = page.locator('label:has-text("External Caterer") + select');
    await expect(cateringSelect).toBeVisible();
    
    // Select the first external caterer
    await cateringSelect.selectOption({ index: 1 });

    // Wait for available decoration packages to be fetched and dropdowns to render
    const decorSelect = page.locator('label:has-text("External Decorator") + select');
    await expect(decorSelect).toBeVisible();
    await decorSelect.selectOption({ index: 1 });

    // Wait for tier selector
    const tierSelect = page.locator('label:has-text("Decoration Tier") + select');
    await expect(tierSelect).toBeVisible();
    await tierSelect.selectOption('high');

    // Wait for pricing update breakdown
    await page.waitForTimeout(500);

    // Verify subtotal and total quotes are loaded and valid numbers
    const totalQuoteText = page.locator('span:has-text("Total Quote") + span');
    const totalVal = await totalQuoteText.innerText();
    expect(totalVal).toContain('₹');

    // 4. Click "Request Site Visit" -> verify database contains lead with package IDs
    const requestVisitBtn = page.getByRole('button', { name: 'Request Site Visit' });
    await expect(requestVisitBtn).toBeVisible();
    await requestVisitBtn.click();
    
    await expect(page.getByText('Site Visit Request Received!')).toBeVisible();

    // Run verification query directly against the Django backend DB via Node child_process
    const backendDir = path.resolve(__dirname, '../../celebrationplatform');
    const pythonExe = path.join(backendDir, 'venv/Scripts/python.exe');
    const managePy = path.join(backendDir, 'manage.py');
    const queryCommand = `"${pythonExe}" "${managePy}" shell -c "from apps.venues.models import VenueInquiry; inquiry = VenueInquiry.objects.filter(phone=\'+919999944444\').first(); print((inquiry.name, inquiry.catering_package_id, inquiry.decoration_package_id) if inquiry else 'None')"`;
    
    const dbOutput = execSync(queryCommand, { cwd: backendDir }).toString().trim();
    console.log("Database Inquiry Multi-Vendor Record:", dbOutput);
    
    expect(dbOutput).toContain('External E2E Tester');
    // Verify it contains integer package IDs (not None)
    expect(dbOutput).not.toContain('None, None');
  });
});
