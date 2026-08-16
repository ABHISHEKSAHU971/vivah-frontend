import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';

test.describe('Individual Services E2E Flow', () => {
  
  test.beforeEach(async ({ context }) => {
    // Clear cookies & state to force anonymous state
    await context.clearCookies();
  });

  test('Anonymous user should book catering individually, complete OTP verify, and create DB inquiry', async ({ page }) => {
    // 1. Access catering page
    await page.goto('/services/catering');
    
    // Locate the first caterer's button and click
    const requestButton = page.locator('button:has-text("Request Call & Menu Customization")').first();
    await expect(requestButton).toBeVisible({ timeout: 15000 });
    await requestButton.click();
    
    // Verify modal is visible
    await expect(page.getByText('Unlock Pricing & Book')).toBeVisible();
    
    // Fill Step 1 details
    await page.locator('input[placeholder="John Doe"]').fill('Individual E2E Tester');
    await page.locator('input[placeholder="98765 43210"]').fill('9999955555');
    await page.locator('input[placeholder="e.g. 150"]').fill('180');
    await page.locator('input[type="date"]').fill('2026-12-15');
    
    // Trigger OTP send
    const sendOtpPromise = page.waitForResponse(response => 
      response.url().includes('/auth/otp/send/') && response.request().method() === 'POST'
    );
    await page.click('button:has-text("Request OTP to Unlock & Book")');
    const sendOtpResponse = await sendOtpPromise;
    const sendOtpJson = await sendOtpResponse.json();
    const devOtp = sendOtpJson.data?.dev_otp || sendOtpJson.dev_otp;
    
    expect(devOtp).toBeDefined();
    
    // Verify Step 2 OTP screen loaded
    await expect(page.getByText('Enter 4-Digit Verification Code')).toBeVisible();
    
    // Enter correct OTP
    const otpInputs = page.locator('input[inputmode="numeric"]');
    for (let i = 0; i < 4; i++) {
      await otpInputs.nth(i).fill(devOtp[i]);
    }
    await page.click('button:has-text("Verify & Submit Inquiry")');
    
    // Verify modal closes and success message is visible
    await expect(page.getByText('Unlock Pricing & Book')).toBeHidden();
    await expect(page.getByText('Inquiry Sent! Our catering manager will contact you.')).toBeVisible();
    
    // Run verification query directly against the Django database
    const backendDir = path.resolve(__dirname, '../../celebrationplatform');
    const pythonExe = path.join(backendDir, 'venv/Scripts/python.exe');
    const managePy = path.join(backendDir, 'manage.py');
    const queryCommand = `"${pythonExe}" "${managePy}" shell -c "from apps.venues.models import VenueInquiry; inquiry = VenueInquiry.objects.filter(phone=\'+919999955555\').first(); print((inquiry.name, inquiry.venue_id, inquiry.guest_count) if inquiry else 'None')"`;
    
    const dbOutput = execSync(queryCommand, { cwd: backendDir }).toString().trim();
    console.log("Database Individual Catering Inquiry Record:", dbOutput);
    
    expect(dbOutput).toContain('Individual E2E Tester');
    expect(dbOutput).toContain('None'); // venue_id should be None (null)
    expect(dbOutput).toContain('180');
  });
});
