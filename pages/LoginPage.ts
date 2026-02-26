import { BasePage } from './BasePage';

/**
 * LoginPage - Page Object for the Login / Sign-in screen.
 * Uses multiple locator strategies (accessibilityId, xpath, id, className)
 * to support both Android and iOS in a single class.
 */
export class LoginPage extends BasePage {
    // ── Locators ───────────────────────────────────────────────────────────
    // AccessibilityId (works cross-platform when devs set them)
    // Exact locators provided by UI XML
    private get signInHeader() { return this.byXPath('//android.widget.TextView[@text="Sign In"]'); }
    private get emailField() { return this.byXPath('//android.widget.EditText[@text="Enter your email"]'); }
    private get passwordField() { return this.byXPath('//android.widget.EditText[@text="Enter your password"]'); }
    // Preferred accessibility id / content-desc for the Login action
    private get loginButton() { return this.byAccessibilityId('Login'); }
    // Fallback: viewgroup with content-desc="Login"
    private get loginButtonFallback() { return this.byXPath('//android.view.ViewGroup[@content-desc="Login"]'); }
    private get errorMessage() { return this.byAccessibilityId('error-message'); }
    private get forgotPassword() { return this.byAccessibilityId('forgot-password-link'); }
    private get signUpLink() { return this.byXPath('//*[contains(@text, "Sign Up") or contains(@text, "Register") or contains(@content-desc, "Sign Up")]'); }

    // XPath fallbacks (if accessibility IDs are not set)
    private get emailXPath() { return this.byXPath('//android.widget.EditText[@text="Enter your email"]'); }
    private get passwordXPath() { return this.byXPath('//android.widget.EditText[@text="Enter your password"]'); }
    private get loginBtnXPath() { return this.byXPath('//android.widget.Button[@text="Login"]'); }

    // iOS Predicate fallbacks
    private get emailIos() { return this.byIosPredicate('type == "XCUIElementTypeTextField" AND identifier == "email-input"'); }
    private get passwordIos() { return this.byIosPredicate('type == "XCUIElementTypeSecureTextField"'); }

    // ── Page State ─────────────────────────────────────────────────────────

    /**
     * Verify login screen is fully loaded
     */
    async isLoaded(): Promise<boolean> {
        const hasHeader = await this.isDisplayed(this.signInHeader);
        const hasEmail = await this.isDisplayed(this.emailField);
        return hasHeader || hasEmail;
    }

    /**
     * Wait until login screen is fully displayed
     */
    async waitForLoginScreen(timeout: number = 15000): Promise<void> {
        const start = Date.now();
        while ((Date.now() - start) < timeout) {
            if (await this.isDisplayed(this.signInHeader)) {
                console.log('📱 Login header visible');
                return;
            }
            if (await this.isDisplayed(this.emailField)) return;
            if (await this.isDisplayed(this.loginButton)) return;
            if (await this.isDisplayed(this.loginButtonFallback)) return;
            if (await this.isDisplayed(this.emailIos)) return;
            await this.pause(300);
        }
        throw new Error('Login screen did not become visible');
    }

    // ── Input Methods ──────────────────────────────────────────────────────

    /**
     * Enter email/username into the email field
     */
    async enterEmail(email: string): Promise<void> {
        await this.clearAndType(this.emailField, email);
        await this.hideKeyboard();
    }

    /**
     * Enter password into the password field
     */
    async enterPassword(password: string): Promise<void> {
        await this.clearAndType(this.passwordField, password);
        await this.hideKeyboard();
    }

    /**
     * Tap the Login button
     */
    async tapLogin(): Promise<void> {
        try {
            await this.tap(this.loginButton);
        } catch {
            await this.tap(this.loginButtonFallback);
        }
    }

    // ── Combined Actions ───────────────────────────────────────────────────

    /**
     * Complete login flow with email and password
     */
    async login(email: string, password: string): Promise<void> {
        console.log(`🔑 Logging in as: ${email}`);
        await this.waitForLoginScreen();
        await this.enterEmail(email);
        await this.enterPassword(password);
        await this.tapLogin();
    }

    /**
     * Login with credentials from .env (default test user)
     */
    async loginWithDefaultCredentials(): Promise<void> {
        const email = process.env.TEST_USER_EMAIL || 'testuser@example.com';
        const password = process.env.TEST_USER_PASSWORD || 'Test@1234';
        await this.login(email, password);
    }

    // ── Error Handling ─────────────────────────────────────────────────────

    /**
     * Get text of any visible error message
     */
    async getErrorMessage(): Promise<string> {
        await this.waitForVisible(this.errorMessage, 5000);
        return await this.getText(this.errorMessage);
    }

    /**
     * Check if error message is displayed
     */
    async isErrorDisplayed(): Promise<boolean> {
        return await this.isDisplayed(this.errorMessage);
    }

    /**
     * Get email field validation error (below the field)
     */
    async getEmailError(): Promise<string> {
        const locator = this.byAccessibilityId('email-error');
        return await this.getText(locator);
    }

    /**
     * Get password field validation error
     */
    async getPasswordError(): Promise<string> {
        const locator = this.byAccessibilityId('password-error');
        return await this.getText(locator);
    }

    // ── Navigation ─────────────────────────────────────────────────────────

    /**
     * Tap "Forgot Password?" link
     */
    async tapForgotPassword(): Promise<void> {
        await this.tap(this.forgotPassword);
    }

    /**
     * Tap "Sign Up" / "Register" link
     */
    async tapSignUp(): Promise<void> {
        await this.tap(this.signUpLink);
    }
}
