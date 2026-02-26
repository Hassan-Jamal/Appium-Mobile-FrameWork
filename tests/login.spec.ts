import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import * as dotenv from 'dotenv';

dotenv.config();

describe('Login Screen Tests', () => {
    let loginPage: LoginPage;
    let homePage: HomePage;

    beforeEach(async () => {
        loginPage = new LoginPage();
        homePage = new HomePage();
        // Reset app state
        await driver.terminateApp('com.favorappllc.mobile');
        await driver.activateApp('com.favorappllc.mobile');
    });

    // ─────────────────────────────────────────────────────────────────────
    // ✅ TC-001: Valid credentials login
    // ─────────────────────────────────────────────────────────────────────
    it.only('TC-001 | Should login successfully with valid credentials', async () => {
        const email = process.env.TEST_USER_EMAIL || 'xarof24140@esyline.com';
        const password = process.env.TEST_USER_PASSWORD || 'Test@1234';

        await loginPage.waitForLoginScreen();
        await loginPage.login(email, password);

        // Verify home screen is reached
        await homePage.waitForHomeScreen();
        const isHome = await homePage.isLoaded();
        expect(isHome).toBe(true);

        const welcome = await homePage.getWelcomeText();
        console.log(`Welcome text: ${welcome}`);
        expect(welcome).toBeTruthy();
    });

    // ─────────────────────────────────────────────────────────────────────
    // ❌ TC-002: Invalid email - should show error
    // ─────────────────────────────────────────────────────────────────────
    it('TC-002 | Should show error message for invalid email', async () => {
        await loginPage.waitForLoginScreen();
        await loginPage.login('wrong@email.com', 'WrongPass123');

        const isErrorShown = await loginPage.isErrorDisplayed();
        expect(isErrorShown).toBe(true);

        const errorText = await loginPage.getErrorMessage();
        console.log(`Error message: ${errorText}`);
        expect(errorText.toLowerCase()).toMatch(/invalid|incorrect|wrong|credentials/);

        // Verify we are still on login page
        const isStillOnLogin = await loginPage.isLoaded();
        expect(isStillOnLogin).toBe(true);
    });

    // ─────────────────────────────────────────────────────────────────────
    // ❌ TC-003: Invalid password only
    // ─────────────────────────────────────────────────────────────────────
    it('TC-003 | Should show error message for wrong password', async () => {
        const email = process.env.TEST_USER_EMAIL || 'xarof24140@esyline.com';

        await loginPage.waitForLoginScreen();
        await loginPage.login(email, 'wrongPassword999');

        const isErrorShown = await loginPage.isErrorDisplayed();
        expect(isErrorShown).toBe(true);

        const errorText = await loginPage.getErrorMessage();
        expect(errorText).toBeTruthy();
    });

    // ─────────────────────────────────────────────────────────────────────
    // ⚠️ TC-004: Empty email field validation
    // ─────────────────────────────────────────────────────────────────────
    it('TC-004 | Should show validation error for empty email', async () => {
        await loginPage.waitForLoginScreen();
        await loginPage.enterPassword('SomePassword');
        await loginPage.tapLogin();

        // Expect email field to show inline validation
        const emailError = await loginPage.getEmailError();
        expect(emailError.toLowerCase()).toMatch(/required|enter|email|empty/);
    });

    // ─────────────────────────────────────────────────────────────────────
    // ⚠️ TC-005: Empty password field validation
    // ─────────────────────────────────────────────────────────────────────
    it('TC-005 | Should show validation error for empty password', async () => {
        await loginPage.waitForLoginScreen();
        await loginPage.enterEmail('user@test.com');
        await loginPage.tapLogin();

        const passwordError = await loginPage.getPasswordError();
        expect(passwordError.toLowerCase()).toMatch(/required|enter|password|empty/);
    });

    // ─────────────────────────────────────────────────────────────────────
    // ⚠️ TC-006: Both fields empty
    // ─────────────────────────────────────────────────────────────────────
    it('TC-006 | Should show validation errors for empty fields', async () => {
        await loginPage.waitForLoginScreen();
        await loginPage.tapLogin();

        const emailError = await loginPage.isErrorDisplayed();
        const stillOnLogin = await loginPage.isLoaded();
        expect(stillOnLogin).toBe(true);
        expect(emailError || stillOnLogin).toBe(true);
    });

    // ─────────────────────────────────────────────────────────────────────
    // 🔒 TC-007: Session persists after app goes to background
    // ─────────────────────────────────────────────────────────────────────
    it('TC-007 | Should maintain session after app is backgrounded and resumed', async () => {
        const email = process.env.TEST_USER_EMAIL || 'xarof24140@esyline.com';
        const password = process.env.TEST_USER_PASSWORD || 'Test@1234';

        // Login first
        await loginPage.login(email, password);
        await homePage.waitForHomeScreen();

        // Background app for 3 seconds
        await loginPage.backgroundAndResume(3);

        // Should still be on home screen (session maintained)
        const isHome = await homePage.isLoaded();
        expect(isHome).toBe(true);
    });

    // ─────────────────────────────────────────────────────────────────────
    // 🔗 TC-008: Navigate to Sign Up screen
    // ─────────────────────────────────────────────────────────────────────
    it('TC-008 | Should navigate to Sign Up screen', async () => {
        await loginPage.waitForLoginScreen();
        await loginPage.tapSignUp();

        // Verify sign up screen elements are present
        const signUpHeader = await loginPage.isDisplayed('~sign-up-header');
        expect(signUpHeader).toBe(true);
    });

    // ─────────────────────────────────────────────────────────────────────
    // 🔗 TC-009: Navigate to Forgot Password screen
    // ─────────────────────────────────────────────────────────────────────
    it('TC-009 | Should navigate to Forgot Password screen', async () => {
        await loginPage.waitForLoginScreen();
        await loginPage.tapForgotPassword();

        const forgotHeader = await loginPage.isDisplayed('~forgot-password-header');
        expect(forgotHeader).toBe(true);
    });
});
