# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: gated_pricing.spec.ts >> Gated Pricing E2E Flow >> Anonymous user should see locked pricing, enter invalid info, complete OTP verify, tweak customizer, and submit inquiry
- Location: e2e\gated_pricing.spec.ts:12:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Please enter your name.')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Please enter your name.')

```

```yaml
- alert
- navigation:
  - link "PlanMyVivah .":
    - /url: /
  - link "Venues":
    - /url: /venues
  - button "Services"
  - link "AI Planner Beta":
    - /url: /ai-planner
  - link "Vendors":
    - /url: /vendor/login
  - link "Sign In":
    - /url: /onboarding/verification
  - link "Start Planning":
    - /url: /onboarding/verification
- main:
  - img "Royal Gardens Bhopal"
  - heading "Royal Gardens Bhopal" [level=1]
  - text: Wedding Garden Bhopal, Madhya Pradesh Max 800 guests 4.8
  - separator
  - heading "Description" [level=3]
  - paragraph: A beautifully manicured open lawn located in the scenic Lalghati area of Bhopal. Perfect for grand Mehendi and Reception events, offering ample parking space and a stunning banquet structure for main ceremonies.
  - separator
  - heading "Amenities Included" [level=3]
  - text: Parking Space Included Air Conditioning (AC) Standard Lighting & Generator Backup Complimentary Changing Rooms
  - paragraph: Price Per Day
  - heading "₹85,000 /day (taxes excluded)" [level=2]
  - text: Base Fare ₹85,000 Catering & Stage Setups Add-on service option Estimate Total ₹85,000
  - paragraph: Pricing Locked
  - paragraph: Verify phone to unlock full pricing breakdown.
  - button "Unlock Quote"
  - button "Unlock Pricing to Book"
  - text: Best Price Guarantee with direct verified contracts
- contentinfo:
  - link "PlanMyVivah .":
    - /url: /
  - paragraph: India's premier celebration ecosystem. Plan your perfect shaadi with verified venues, premium catering, and custom décor.
  - heading "Discover" [level=4]
  - list:
    - listitem:
      - link "Venues":
        - /url: /venues
    - listitem:
      - link "Catering":
        - /url: /services/catering
    - listitem:
      - link "Decorations":
        - /url: /services/decorations
    - listitem:
      - link "DJ Services":
        - /url: /services/dj-sound
  - heading "Platform" [level=4]
  - list:
    - listitem:
      - link "AI Planner (Beta)":
        - /url: /ai-planner
    - listitem:
      - link "Budget Tool":
        - /url: /budget
    - listitem:
      - link "Vendor Portal":
        - /url: /vendors
    - listitem:
      - link "Partner Program":
        - /url: /partners
  - heading "Company" [level=4]
  - list:
    - listitem:
      - link "About Us":
        - /url: /about
    - listitem:
      - link "Contact Support":
        - /url: /contact
    - listitem:
      - link "Planning Blog":
        - /url: /blog
    - listitem:
      - link "For Vendors":
        - /url: /for-vendors
  - heading "Legal" [level=4]
  - list:
    - listitem:
      - link "Privacy Policy":
        - /url: /privacy
    - listitem:
      - link "Terms of Service":
        - /url: /terms
    - listitem:
      - link "Cancellation Policy":
        - /url: /cancellation
    - listitem:
      - link "Refund Policy":
        - /url: /refunds
  - paragraph: © 2026 PlanMyVivah. All rights reserved.
  - link "Instagram":
    - /url: "#"
  - link "Pinterest":
    - /url: "#"
  - link "Facebook":
    - /url: "#"
- button
- heading "Unlock Detailed Quote" [level=2]
- paragraph: Enter your details to view customized catering, decor & venue rentals.
- text: Your Name
- textbox "John Doe"
- text: Mobile Number +91
- textbox "98765 43210"
- text: Guest Count
- spinbutton
- text: Event Date
- textbox
- button "Request OTP to Unlock Quote"
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { execSync } from 'child_process';
  3   | import path from 'path';
  4   | 
  5   | test.describe('Gated Pricing E2E Flow', () => {
  6   |   
  7   |   test.beforeEach(async ({ context }) => {
  8   |     // Clear cookies & state to force anonymous state
  9   |     await context.clearCookies();
  10  |   });
  11  | 
  12  |   test('Anonymous user should see locked pricing, enter invalid info, complete OTP verify, tweak customizer, and submit inquiry', async ({ page }) => {
  13  |     
  14  |     // 1. Access listing -> navigate to detail -> verify pricing is locked
  15  |     await page.goto('/');
  16  |     
  17  |     // Locate the first link to Jonty Garden (id: 1) and click it
  18  |     const jontyGardenLink = page.locator('a[href="/venues/1"]').first();
  19  |     await jontyGardenLink.click();
  20  |     
  21  |     await page.waitForURL('**/venues/1');
  22  |     
  23  |     // Verify pricing is locked
  24  |     await expect(page.getByText('Pricing Locked')).toBeVisible();
  25  |     await expect(page.getByRole('button', { name: 'Unlock Quote' })).toBeVisible();
  26  | 
  27  |     // 2. Click "Unlock Quote" and test invalid phone/OTP validator alerts
  28  |     await page.click('button:has-text("Unlock Quote")');
  29  |     
  30  |     // Step 1: details modal should be visible
  31  |     await expect(page.getByText('Unlock Detailed Quote')).toBeVisible();
  32  |     
  33  |     // Submit with empty name/phone to check required field validator alerts
  34  |     await page.click('button:has-text("Request OTP to Unlock Quote")');
> 35  |     await expect(page.getByText('Please enter your name.')).toBeVisible();
      |                                                             ^ Error: expect(locator).toBeVisible() failed
  36  |     
  37  |     // Fill Name but invalid phone
  38  |     await page.locator('input[placeholder="John Doe"]').fill('E2E Tester');
  39  |     await page.click('button:has-text("Request OTP to Unlock Quote")');
  40  |     await expect(page.getByText('Please enter a valid 10-digit mobile number.')).toBeVisible();
  41  |     
  42  |     // Fill invalid phone (e.g. 5 digits)
  43  |     await page.locator('input[placeholder="98765 43210"]').fill('99999');
  44  |     await page.click('button:has-text("Request OTP to Unlock Quote")');
  45  |     await expect(page.getByText('Please enter a valid 10-digit mobile number.')).toBeVisible();
  46  |     
  47  |     // Fill valid phone but missing date/guests
  48  |     await page.locator('input[placeholder="98765 43210"]').fill('9999933333');
  49  |     await page.click('button:has-text("Request OTP to Unlock Quote")');
  50  |     await expect(page.getByText('Please enter a valid guest count.')).toBeVisible();
  51  |     
  52  |     // Fill guests but missing date
  53  |     await page.locator('input[placeholder="e.g. 150"]').fill('200');
  54  |     await page.click('button:has-text("Request OTP to Unlock Quote")');
  55  |     await expect(page.getByText('Please select your event date.')).toBeVisible();
  56  |     
  57  |     // Fill date
  58  |     await page.locator('input[type="date"]').fill('2026-11-20');
  59  |     
  60  |     // Now trigger OTP send mutation
  61  |     // We start listening to the OTP send network call to extract the dev OTP
  62  |     const sendOtpPromise = page.waitForResponse(response => 
  63  |       response.url().includes('/auth/otp/send/') && response.request().method() === 'POST'
  64  |     );
  65  |     await page.click('button:has-text("Request OTP to Unlock Quote")');
  66  |     const sendOtpResponse = await sendOtpPromise;
  67  |     const sendOtpJson = await sendOtpResponse.json();
  68  |     const devOtp = sendOtpJson.data?.dev_otp || sendOtpJson.dev_otp;
  69  |     
  70  |     expect(devOtp).toBeDefined();
  71  |     
  72  |     // Verify Step 2 OTP grid screen loaded
  73  |     await expect(page.getByText('Enter 4-Digit Verification Code')).toBeVisible();
  74  |     
  75  |     // Enter invalid OTP first
  76  |     const otpInputs = page.locator('input[inputmode="numeric"]');
  77  |     for (let i = 0; i < 4; i++) {
  78  |       await otpInputs.nth(i).fill(((Number(devOtp[i]) + 1) % 10).toString());
  79  |     }
  80  |     await page.click('button:has-text("Verify & Unlock Quote")');
  81  |     await expect(page.getByText('Incorrect verification code. Please check and try again.')).toBeVisible();
  82  |     
  83  |     // 3. Enter correct OTP -> verify modal closes, pricing unblurs, interactive controls update totals
  84  |     // Clear inputs first
  85  |     for (let i = 0; i < 4; i++) {
  86  |       await otpInputs.nth(i).fill('');
  87  |     }
  88  |     
  89  |     // Enter correct OTP
  90  |     for (let i = 0; i < 4; i++) {
  91  |       await otpInputs.nth(i).fill(devOtp[i]);
  92  |     }
  93  |     await page.click('button:has-text("Verify & Unlock Quote")');
  94  |     
  95  |     // Verify modal closes and locked overlay is gone
  96  |     await expect(page.getByText('Unlock Detailed Quote')).toBeHidden();
  97  |     await expect(page.getByText('Pricing Locked')).toBeHidden();
  98  |     
  99  |     // Locate guests input inside interactive controls
  100 |     const guestsInput = page.locator('label:has-text("Guests Count") + input');
  101 |     await expect(guestsInput).toBeVisible();
  102 |     
  103 |     // Confirm initial guest count matches Step 1 details
  104 |     await expect(guestsInput).toHaveValue('200');
  105 |     
  106 |     // Change guest count to 300 and verify recalculations
  107 |     const subtotalText = page.locator('span:has-text("Subtotal") + span');
  108 |     const totalQuoteText = page.locator('span:has-text("Total Quote") + span');
  109 |     
  110 |     const initialSubtotal = await subtotalText.innerText();
  111 |     const initialTotal = await totalQuoteText.innerText();
  112 |     
  113 |     await guestsInput.fill('300');
  114 |     
  115 |     // Wait for pricing update
  116 |     await page.waitForTimeout(200);
  117 |     
  118 |     const updatedSubtotal = await subtotalText.innerText();
  119 |     const updatedTotal = await totalQuoteText.innerText();
  120 |     
  121 |     expect(updatedSubtotal).not.toEqual(initialSubtotal);
  122 |     expect(updatedTotal).not.toEqual(initialTotal);
  123 |     
  124 |     // Check package cards comparisons at the bottom
  125 |     await expect(page.getByText('Compare Package Quotes')).toBeVisible();
  126 |     await expect(page.getByText('Venue Rent Only')).toBeVisible();
  127 |     await expect(page.getByText('All-Inclusive Standard')).toBeVisible();
  128 |     await expect(page.getByText('Custom Designer')).toBeVisible();
  129 | 
  130 |     // 4. Click "Request Site Visit" -> verify database contains lead with all customized selections
  131 |     // Wait for the Request Site Visit button
  132 |     const requestVisitBtn = page.getByRole('button', { name: 'Request Site Visit' });
  133 |     await expect(requestVisitBtn).toBeVisible();
  134 |     await requestVisitBtn.click();
  135 |     
```