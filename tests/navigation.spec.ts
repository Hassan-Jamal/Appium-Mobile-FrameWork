import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { CrudPage } from '../pages/CrudPage';
import * as dotenv from 'dotenv';

dotenv.config();

describe('Navigation Tests', () => {
    let loginPage: LoginPage;
    let homePage: HomePage;
    let crudPage: CrudPage;

    before(async () => {
        loginPage = new LoginPage();
        homePage = new HomePage();
        crudPage = new CrudPage();
        // Login once before all navigation tests
        await loginPage.login(
            process.env.TEST_USER_EMAIL || 'xarof24140@esyline.com',
            process.env.TEST_USER_PASSWORD || 'Test@1234'
        );
        await homePage.waitForHomeScreen();
    });

    beforeEach(async () => {
        // Return to home tab before each test
        await homePage.tapHomeTab();
    });

    // ─────────────────────────────────────────────────────────────────────
    // TC-NAV-001: Verify home screen title
    // ─────────────────────────────────────────────────────────────────────
    it('TC-NAV-001 | Home screen should display welcome message', async () => {
        const isLoaded = await homePage.isLoaded();
        expect(isLoaded).toBe(true);

        const welcomeText = await homePage.getWelcomeText();
        expect(welcomeText).toBeTruthy();
        expect(welcomeText.length).toBeGreaterThan(0);
    });

    // ─────────────────────────────────────────────────────────────────────
    // TC-NAV-002: Navigate to Profile tab
    // ─────────────────────────────────────────────────────────────────────
    it('TC-NAV-002 | Should navigate to Profile tab', async () => {
        await homePage.tapProfileTab();

        const profileScreen = await loginPage.isDisplayed('~profile-screen');
        expect(profileScreen).toBe(true);
    });

    // ─────────────────────────────────────────────────────────────────────
    // TC-NAV-003: Navigate to Settings tab
    // ─────────────────────────────────────────────────────────────────────
    it('TC-NAV-003 | Should navigate to Settings tab', async () => {
        await homePage.tapSettingsTab();

        const settingsScreen = await loginPage.isDisplayed('~settings-screen');
        expect(settingsScreen).toBe(true);
    });

    // ─────────────────────────────────────────────────────────────────────
    // TC-NAV-004: Navigate back from a screen
    // ─────────────────────────────────────────────────────────────────────
    it('TC-NAV-004 | Should navigate back to previous screen', async () => {
        // Go to profile
        await homePage.tapProfileTab();
        await homePage.pause(500);

        // Press back (Android) / swipe right (iOS)
        const platform = (await driver.capabilities as Record<string, string>).platformName;
        if (platform === 'Android') {
            await homePage.pressBack();
        } else {
            // iOS swipe back from left edge
            await homePage.swipeRight();
        }

        // Should be back on home screen
        const isHome = await homePage.isLoaded();
        expect(isHome).toBe(true);
    });

    // ─────────────────────────────────────────────────────────────────────
    // TC-NAV-005: Navigate to CRUD list screen
    // ─────────────────────────────────────────────────────────────────────
    it('TC-NAV-005 | Should navigate to items list screen', async () => {
        await homePage.tapAddItem();

        const isLoaded = await crudPage.isLoaded();
        expect(isLoaded).toBe(true);
    });

    // ─────────────────────────────────────────────────────────────────────
    // TC-NAV-006: Open side menu / hamburger menu
    // ─────────────────────────────────────────────────────────────────────
    it('TC-NAV-006 | Should open side navigation menu', async () => {
        await homePage.tapMenu();
        await homePage.pause(500);

        const menuVisible = await homePage.isDisplayed('~side-menu');
        expect(menuVisible).toBe(true);
    });

    // ─────────────────────────────────────────────────────────────────────
    // TC-NAV-007: Deep link navigation
    // ─────────────────────────────────────────────────────────────────────
    it('TC-NAV-007 | Should handle deep link to profile screen', async () => {
        const platform = (await driver.capabilities as Record<string, string>).platformName;
        const bundleId = process.env.IOS_BUNDLE_ID || 'com.example.myapp';
        const appPackage = process.env.APP_PACKAGE || 'com.example.myapp';

        if (platform === 'Android') {
            // Android deep link via ADB intent
            await driver.execute('mobile: deepLink', {
                url: `${appPackage}://profile`,
                package: appPackage,
            });
        } else {
            // iOS deep link via URL
            await driver.execute('mobile: deepLink', {
                url: `${bundleId}://profile`,
                bundleId: bundleId,
            });
        }

        await homePage.pause(1500);
        const profileScreen = await homePage.isDisplayed('~profile-screen');
        expect(profileScreen).toBe(true);
    });

    // ─────────────────────────────────────────────────────────────────────
    // TC-NAV-008: Scroll through content list
    // ─────────────────────────────────────────────────────────────────────
    it('TC-NAV-008 | Should scroll through items list', async () => {
        await homePage.tapAddItem();
        await crudPage.waitForListScreen();

        // Swipe up to scroll down
        await crudPage.swipeUp(0.5);
        await homePage.pause(300);
        await crudPage.swipeDown(0.5);

        // Verify still on list screen after scrolling
        const isLoaded = await crudPage.isLoaded();
        expect(isLoaded).toBe(true);
    });

    // ─────────────────────────────────────────────────────────────────────
    // TC-NAV-009: Notification screen navigation
    // ─────────────────────────────────────────────────────────────────────
    it('TC-NAV-009 | Should navigate to notifications screen', async () => {
        await homePage.tapNotifications();
        await homePage.pause(500);

        const notificationsScreen = await homePage.isDisplayed('~notifications-screen');
        expect(notificationsScreen).toBe(true);
    });
});
