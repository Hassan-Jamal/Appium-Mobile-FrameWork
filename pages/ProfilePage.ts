import { BasePage } from './BasePage';
import { faker } from '@faker-js/faker';

/**
 * ProfilePage - Page Object for the "Create a Profile" screen.
 * Reached after successful registration.
 */
export class ProfilePage extends BasePage {
    // ── Locators (Finalized from XML) ─────────────────────────────────────
    private get firstNameField() { return this.byXPath('//android.widget.EditText[@text="Enter your first name"]'); }
    private get lastNameField() { return this.byXPath('//android.widget.EditText[@text="Enter your last name"]'); }

    // DOB Locators
    private get dobButton() { return this.byXPath('//android.view.ViewGroup[contains(@content-desc, "/") or contains(@text, "/")]'); }
    private get yearDropdown() { return this.byXPath('//android.widget.TextView[@text="Year"]/..//android.view.ViewGroup[contains(@content-desc, "▼")]'); }
    private get monthDropdown() { return this.byXPath('//android.widget.TextView[@text="Month"]/..//android.view.ViewGroup[contains(@content-desc, "▼")]'); }
    private get dayDropdown() { return this.byXPath('//android.widget.TextView[@text="Day"]/..//android.view.ViewGroup[contains(@content-desc, "▼")]'); }
    private get dobModalDone() { return this.byXPath('//android.view.ViewGroup[@content-desc="Done"]'); }

    // Year Selection Modal (opens after tapping yearDropdown)
    private get yearListModal() { return this.byXPath('//android.view.ViewGroup[@content-desc="Select Year"]'); }
    private get yearListModalDone() { return this.byXPath('//android.view.ViewGroup[@content-desc="Select Year"]//android.view.ViewGroup[@content-desc="Done"]'); }

    private get addressButton() { return this.byXPath('//android.view.ViewGroup[@content-desc="Enter your address"]'); }
    // Sometimes the address is rendered as a TextView; prefer tapping this when present
    private get addressTextView() { return this.byXPath('//android.widget.TextView[@text="Enter your address"]'); }
    private get phoneCallField() { return this.byXPath('(//android.widget.EditText[@text="(XXX) XXX-XXXX"])[1]'); }
    private get phoneTextField() { return this.byXPath('(//android.widget.EditText[@text="(XXX) XXX-XXXX"])[2]'); }

    private get skillsButton() { return this.byXPath('//android.view.ViewGroup[@content-desc="Select skills"]'); }
    private get experienceField() { return this.byXPath('//android.widget.EditText[@text="Enter years of experience (0-99)"]'); }
    private get aboutMeField() { return this.byXPath('//android.widget.EditText[@text="Tell us about yourself..."]'); }
    private get hearAboutUsButton() { return this.byXPath('//android.view.ViewGroup[@content-desc="Select an option"]'); }

    private get addPhotoButton() { return this.byXPath('//android.view.ViewGroup[@content-desc="Add Photo"]'); }
    private get ageCheckbox() { return this.byXPath('//android.view.ViewGroup[@content-desc="I confirm that I am 18 years of age or older"]'); }
    private get completeProfileButton() { return this.byXPath('//android.view.ViewGroup[@content-desc="Complete Profile"]'); }

    // Search and Selection
    // Narrow the address search field selector to avoid matching the name inputs
    private get addressSearchField() {
        // Prefer a dedicated EditText for address if present, otherwise fallback to the address viewgroup's TextView
        return this.byXPath(`(//android.widget.EditText[not(contains(@text,"Enter your first name")) and not(contains(@text,"Enter your last name"))])[1] | //android.view.ViewGroup[contains(@content-desc,"Enter your address")]//android.widget.TextView`);
    }
    private get firstAddressSuggestion() { return this.byXPath('(//android.view.ViewGroup[contains(@content-desc, ", ")])[1]'); }
    private get skillOption() { return this.byXPath('(//android.view.ViewGroup/android.widget.TextView)[1]'); }
    private get skillsDoneButton() { return this.byXPath('//*[contains(@text, "Done") or contains(@text, "Apply") or contains(@content-desc, "Done")]'); }
    private get hearAboutUsOption() { return this.byXPath('//*[contains(@text, "Social Media") or contains(@text, "Friend")]'); }

    // Photo Picker
    private get chooseFromLibrary() { return this.byXPath('//*[@text="Choose from Library"] | //android.widget.Button[@resource-id="android:id/button2"]'); }
    private get firstMediaItem() { return this.byXPath('//android.view.View[@content-desc="Media grid"]/android.view.View/android.view.View[2]/android.view.View[2]/android.view.View | (//android.widget.ImageView)[1]'); }
    private get photoDoneButton() { return this.byXPath('//*[contains(@text, "Done") or @content-desc="Done"]'); }
    private get cropButton() { return this.byXPath('//android.widget.Button[contains(@resource-id, "crop")]'); }

    // ── Page State ─────────────────────────────────────────────────────────

    async isLoaded(): Promise<boolean> {
        return await this.isDisplayed(this.firstNameField) ||
            await this.isDisplayed(this.skillsButton);
    }

    async waitForProfileScreen(timeout: number = 30000): Promise<void> {
        await driver.waitUntil(async () => await this.isLoaded(), {
            timeout,
            timeoutMsg: 'Profile screen not loaded'
        });
        console.log('📝 Profile screen loaded');
    }

    // ── Actions ────────────────────────────────────────────────────────────

    async selectDOB(targetYear?: string) {
        const year = targetYear || faker.number.int({ min: 1990, max: 1999 }).toString();
        console.log(`📅 Selecting Date of Birth (Target Year: ${year})...`);

        await this.tap(this.dobButton);
        await this.pause(2000);

        // 1. Open Year List Modal
        console.log('📅 Opening Year dropdown...');
        if (await this.isDisplayed(this.yearDropdown)) {
            await this.tap(this.yearDropdown);
            await this.pause(1500);
        }
        // 2. Select Year from List (search for a TextView or content-desc matching the target)
        const targetYearElem = this.byXPath(`//android.widget.TextView[@text="${year}"] | //android.view.ViewGroup[@content-desc="${year}"]`);
        console.log(`📅 Searching for year element for ${year}`);
        if (await this.isDisplayed(targetYearElem)) {
            await this.tap(targetYearElem);
        } else {
            // Try scrolling until the year is visible
            for (let i = 0; i < 20; i++) {
                await this.swipeUp(0.6);
                await this.pause(600);
                if (await this.isDisplayed(targetYearElem)) {
                    await this.tap(targetYearElem);
                    break;
                }
            }
        }
        // 3. If the year list has its own Done button, tap it first
        console.log('📅 Finalizing Year selection (tap year-list Done if present)');
        if (await this.isDisplayed(this.yearListModalDone)) {
            await this.tap(this.yearListModalDone);
            await this.pause(700);
        }

        // 4. Confirm Main DOB Modal (tap Done to close picker)
        console.log('📅 Finalizing DOB selection (tap main Done)');
        if (await this.isDisplayed(this.dobModalDone)) {
            await this.tap(this.dobModalDone);
            await this.pause(1000);
        }

        // 5. Ensure the Address area is visible (move focus down)
        console.log('📍 Scrolling to make Address field visible after DOB selection');
        for (let i = 0; i < 6; i++) {
            if (await this.isDisplayed(this.addressButton)) break;
            await this.swipeUp(0.4);
            await this.pause(500);
        }
        // hide keyboard if present to avoid typing into previous input
        try { await this.hideKeyboard(); } catch (e) { /* ignore */ }
        // Try an editor action 'next' to move focus off the previous field
        try {
            await driver.execute('mobile: performEditorAction', { action: 'next' });
            await this.pause(300);
        } catch { /* ignore if unsupported */ }

        // Preferred: tap the explicit TextView that displays the placeholder 'Enter your address'
        try {
            if (await this.isDisplayed(this.addressTextView)) {
                console.log('📍 Tapping address TextView to move focus');
                await this.tap(this.addressTextView);
                await this.pause(500);
            } else if (await this.isDisplayed(this.addressButton)) {
                console.log('📍 Tapping Address area (ViewGroup) to move focus');
                await this.tap(this.addressButton);
                await this.pause(500);
            } else if (await this.isDisplayed(this.lastNameField)) {
                try {
                    const lastEl = await $(this.lastNameField);
                    const rect = await lastEl.getRect();
                    const tapX = Math.floor(rect.x + rect.width / 2);
                    const tapY = Math.floor(rect.y + rect.height + 40); // 40px below
                    console.log(`📍 Falling back: tapping coordinates ${tapX},${tapY} to move focus from LastName`);
                    await this.tapByCoordinates(tapX, tapY);
                    await this.pause(500);
                } catch (coordErr) {
                    // ignore coordinate tap failures
                }
            }
        } catch (e) {
            // non-fatal: continue
        }
    }

    async enterAddress(address: string) {
        console.log(`🏠 Entering address: ${address}`);
        await this.tap(this.addressButton);
        await this.pause(2500);
        // Some screens show an EditText, others expose a TextView that opens an input. Try both.
        if (await this.isDisplayed(this.addressSearchField)) {
            try {
                await this.clearAndType(this.addressSearchField, address);
            } catch (err) {
                // If setValue fails because element is not an EditText, try tapping then using setValue on active element
                const textElement = this.addressSearchField;
                await this.tap(textElement);
                await this.pause(500);
                await driver.execute('mobile: performEditorAction', { action: 'search' }).catch(() => null);
                await this.pause(300);
                // fallback: send keys to focused element
                await driver.keys(address);
            }
        } else {
            // As a last resort, try sending keys globally
            await driver.keys(address);
        }
        await this.pause(3500); // Wait for results
        await this.tap(this.firstAddressSuggestion);
        await this.pause(1000);
    }

    async selectSkills() {
        console.log('🛠 Selecting skills...');
        await this.tap(this.skillsButton);
        await this.pause(2000);
        if (await this.isDisplayed(this.skillOption)) {
            await this.tap(this.skillOption);
            await this.tap(this.skillsDoneButton);
            await this.pause(500);
        }
    }

    async selectHearAboutUs() {
        if (await this.isDisplayed(this.hearAboutUsButton)) {
            await this.tap(this.hearAboutUsButton);
            await this.pause(1500);
            await this.tap(this.hearAboutUsOption);
        }
    }

    async uploadPhoto() {
        console.log('📸 Uploading profile photo...');
        await this.tap(this.addPhotoButton);
        await this.pause(2000);
        if (await this.isDisplayed(this.chooseFromLibrary)) {
            await this.tap(this.chooseFromLibrary);
            await this.pause(3000);
            if (await this.isDisplayed(this.firstMediaItem)) {
                await this.tap(this.firstMediaItem);
                await this.pause(2500);
                if (await this.isDisplayed(this.photoDoneButton)) {
                    await this.tap(this.photoDoneButton);
                    await this.pause(2000);
                }
                if (await this.isDisplayed(this.cropButton)) {
                    await this.tap(this.cropButton);
                    await this.pause(2000);
                }
            }
        }
    }

    async completeProfile(data: {
        firstName: string,
        lastName: string,
        dob: boolean,
        address: string,
        city?: string,
        state?: string,
        zip?: string,
        phone: string,
        skills: boolean,
        experience: string,
        aboutMe: string
    }) {
        console.log('📝 Filling profile information...');

        if (await this.isDisplayed(this.firstNameField)) {
            await this.clearAndType(this.firstNameField, data.firstName);
        }
        if (await this.isDisplayed(this.lastNameField)) {
            await this.clearAndType(this.lastNameField, data.lastName);
        }

        if (data.dob) {
            await this.selectDOB('1992');
        }

        if (await this.isDisplayed(this.addressButton)) {
            await this.enterAddress(data.address);
        }

        if (await this.isDisplayed(this.phoneCallField)) {
            console.log(`📞 Entering Call Phone: ${data.phone}`);
            await this.clearAndType(this.phoneCallField, data.phone);
            await this.hideKeyboard();
        }

        if (await this.isDisplayed(this.phoneTextField)) {
            console.log(`📱 Entering Text Phone: ${data.phone}`);
            await this.clearAndType(this.phoneTextField, data.phone);
            await this.hideKeyboard();
        }

        console.log('📜 Scrolling to Attributes section...');
        await this.swipeUp(0.7);
        await this.pause(2000);

        if (data.skills && await this.isDisplayed(this.skillsButton)) {
            await this.selectSkills();
        }

        if (await this.isDisplayed(this.experienceField)) {
            console.log(`🏢 Entering Experience: ${data.experience}`);
            await this.clearAndType(this.experienceField, data.experience);
            await this.hideKeyboard();
        }

        if (await this.isDisplayed(this.aboutMeField)) {
            console.log(`💬 Entering About Me: ${data.aboutMe}`);
            await this.clearAndType(this.aboutMeField, data.aboutMe);
            await this.hideKeyboard();
        }

        if (await this.isDisplayed(this.hearAboutUsButton)) {
            await this.selectHearAboutUs();
        }

        // Photo (Optional)
        if (await this.isDisplayed(this.addPhotoButton)) {
            await this.uploadPhoto();
        }

        console.log('📜 Final scroll to Submit');
        await this.swipeUp(0.8);
        await this.pause(1500);

        if (await this.isDisplayed(this.ageCheckbox)) {
            console.log('✅ Tapping 18+ checkbox');
            await this.tap(this.ageCheckbox);
        }

        console.log('🏁 Finalizing Profile');
        if (!await this.isDisplayed(this.completeProfileButton)) await this.swipeUp(0.4);
        await this.tap(this.completeProfileButton);
        await this.pause(5000); // Wait for submission
    }
}
