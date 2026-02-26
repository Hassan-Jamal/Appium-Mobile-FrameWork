import { BasePage } from './BasePage';

/**
 * SignupPage - Page Object for the Sign-up / Register screen.
 */
export class SignupPage extends BasePage {
    // ── Locators ───────────────────────────────────────────────────────────
    private get emailField() { return this.byXPath('//android.widget.EditText[contains(@text, "@") or contains(@text, "email") or contains(@text, "Email")] | (//android.widget.EditText)[1]'); }
    private get passwordField() { return this.byXPath('//android.widget.EditText[(contains(@text, "password") or contains(@text, "Password")) and not(contains(@text, "Confirm"))] | (//android.widget.EditText)[2]'); }
    private get confirmPasswordField() { return this.byXPath('//android.widget.EditText[contains(@text, "Confirm") or contains(@text, "confirm")] | (//android.widget.EditText)[3]'); }
    private get termsCheckbox() { return this.byXPath('//*[contains(@content-desc, "Terms & Condition") or contains(@content-desc, "Privacy Policy")]'); }
    private get signUpButton() { return this.byXPath('//*[contains(@text, "Create Account") or contains(@content-desc, "Create Account")]'); }
    private get loginLink() { return this.byAccessibilityId('already-have-account-link'); }
    private get errorMessage() { return this.byAccessibilityId('signup-error-message'); }

    // ── Page State ─────────────────────────────────────────────────────────

    /**
     * Wait until signup screen is fully displayed
     */
    async waitForSignupScreen(timeout: number = 15000): Promise<void> {
        await this.waitForVisible(this.emailField, timeout);
        console.log('📱 Signup screen loaded');
    }

    /**
     * Check if Signup screen is visible
     */
    async isLoaded(): Promise<boolean> {
        // Use unique button to distinguish from Login screen
        return await this.isDisplayed(this.signUpButton);
    }

    // ── Input Methods ──────────────────────────────────────────────────────

    async enterEmail(email: string): Promise<void> {
        await this.clearAndType(this.emailField, email);
        await this.hideKeyboard();
    }

    async enterPassword(password: string): Promise<void> {
        await this.clearAndType(this.passwordField, password);
        await this.hideKeyboard();
    }

    async enterConfirmPassword(password: string): Promise<void> {
        await this.clearAndType(this.confirmPasswordField, password);
        await this.hideKeyboard();
    }

    async tapTermsCheckbox(): Promise<void> {
        await this.tap(this.termsCheckbox);
    }

    async tapSubmit(): Promise<void> {
        await this.tap(this.signUpButton);
    }

    /**
     * Tap "Already have an account? Login" link
     */
    async tapLoginLink(): Promise<void> {
        await this.tap(this.loginLink);
    }

    // ── Interaction Methods ────────────────────────────────────────────────

    /**
     * info: Complete sign up flow
     */
    async signUp(email: string, pass: string): Promise<void> {
        console.log(`📝 Signing up as: ${email}`);
        await this.waitForSignupScreen();
        await this.enterEmail(email);
        await this.enterPassword(pass);
        await this.enterConfirmPassword(pass);

        console.log('⌨️ Hiding keyboard before scroll');
        await this.hideKeyboard();

        console.log('⚖️ Searching for Terms checkbox...');
        await this.swipeUp(); // Checkbox is at the bottom based on user dump

        if (await this.isDisplayed(this.termsCheckbox)) {
            console.log('⚖️ Tapping Terms checkbox');
            await this.tapTermsCheckbox();
            await this.pause(500);
        } else {
            console.log('ℹ️ Skipping Terms checkbox (not found after swipe)');
        }

        console.log('🚀 Tapping Submit');
        await this.tapSubmit();
    }

    // ── Error Handling ─────────────────────────────────────────────────────

    async getErrorMessage(): Promise<string> {
        await this.waitForVisible(this.errorMessage, 5000);
        return await this.getText(this.errorMessage);
    }

    async isErrorDisplayed(): Promise<boolean> {
        return await this.isDisplayed(this.errorMessage);
    }
}
