import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import * as dotenv from 'dotenv';
import { driver, expect } from '@wdio/globals';

dotenv.config();

describe('Post-login Flow', () => {
    let loginPage: LoginPage;
    let homePage: HomePage;

    beforeEach(async () => {
        loginPage = new LoginPage();
        homePage = new HomePage();

        // Restart app to ensure clean state
        // @ts-ignore
        await driver.terminateApp('com.favorappllc.mobile');
        // @ts-ignore
        await driver.activateApp('com.favorappllc.mobile');
    });

    it('TC-POST | After map loads switch to list, skip subscription, provide a favor and apply', async () => {
        const email = process.env.TEST_USER_EMAIL || 'xarof24140@esyline.com';
        const password = process.env.TEST_USER_PASSWORD || 'Test@123';

        // Ensure logged in: only perform login if the login screen is visible
        const loginVisible = await loginPage.isLoaded().catch(() => false);
        if (loginVisible) {
            await loginPage.waitForLoginScreen();
            await loginPage.login(email, password);
        }

        // Wait for Home/Map
        await homePage.waitForHomeScreen(30000);
        await homePage.waitForMapView(60000);

        // Switch to List View and handle subscription modal
        await homePage.tapListView();
        await homePage.skipSubscriptionIfPresent();

        // Tap Provide a Favor on a card and confirm the Apply dialog
        await homePage.tapProvideFavor();
        await homePage.confirmApplyOnDialog();

        // Basic verification: ensure we're still on Home (no crash)
        expect(await homePage.isLoaded()).toBe(true);
    });
});
