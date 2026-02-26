import { SignupPage } from '../pages/SignupPage';
import { ProfilePage } from '../pages/ProfilePage';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import * as dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import { driver, expect } from '@wdio/globals';

dotenv.config();

describe('Signup Screen Tests', () => {
    let signupPage: SignupPage;
    let profilePage: ProfilePage;
    let loginPage: LoginPage;
    let homePage: HomePage;

    beforeEach(async () => {
        signupPage = new SignupPage();
        profilePage = new ProfilePage();
        loginPage = new LoginPage();
        homePage = new HomePage();

        console.log('🔄 Restarting App...');
        // @ts-ignore
        await driver.terminateApp('com.favorappllc.mobile');
        // @ts-ignore
        await driver.activateApp('com.favorappllc.mobile');

        // Ensure we remain on the default Login screen (do not auto-navigate to Signup)
        console.log('🔍 Ensuring Login screen is visible (stay on default)');
        await loginPage.waitForLoginScreen();
    });

    // ─────────────────────────────────────────────────────────────────────
    // ✅ TC-001: Successful Signup
    // ─────────────────────────────────────────────────────────────────────
    it('TC-001 | Should sign up, complete profile, and login successfully', async () => {
        const email = faker.internet.email();
        const password = 'Test@1234';

        // Step 1: Registration
        await signupPage.signUp(email, password);
        console.log('⏳ Waiting for redirection to Profile page...');
        await driver.pause(5000);

        // Step 2: Profile Completion
        console.log('ℹ️ Filling out Profile information');
        await profilePage.waitForProfileScreen();
        await profilePage.completeProfile({
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            dob: true,
            address: 'New York, NY, USA',
            city: 'New York',
            state: 'NY',
            zip: '10001',
            phone: '1234567890',
            skills: true,
            experience: '5',
            aboutMe: 'Dedicated professional with over 5 years of experience in the industry. Passionate about community service and helping others. Looking forward to making a positive impact!'
        });

        // Step 3: Redirection to Login and Authentication
        console.log('ℹ️ Verifying redirection to login after profile completion');
        await loginPage.waitForLoginScreen();
        await loginPage.login(email, password);

        // Step 4: Dashboard Verification
        console.log('ℹ️ Verifying Home Screen');
        await homePage.waitForHomeScreen();
        expect(await homePage.isLoaded()).toBe(true);
    });

    // ─────────────────────────────────────────────────────────────────────
    // 🔑 Login Only: Verify login and Map view
    // ─────────────────────────────────────────────────────────────────────
    it.only('TC-LOGIN | Should login with provided credentials and show map', async () => {
        const email = 'xarof24140@esyline.com';
        const password = 'Test@123';

        console.log('ℹ️ Waiting for Login screen');
        await loginPage.waitForLoginScreen();
        console.log(`🔐 Logging in as ${email}`);
        await loginPage.login(email, password);

        console.log('⏳ Waiting for Home screen and Map view');
        await homePage.waitForHomeScreen();
        await homePage.waitForMapView(45000);

        const mapLoaded = await homePage.isMapLoaded();
        expect(mapLoaded).toBe(true);
        
        // Post-login: switch to List View, skip subscription, and provide a favor
        console.log('👉 Switching to List View');
        await homePage.tapListView();
        await homePage.skipSubscriptionIfPresent();

        console.log('👉 Tapping Provide a Favor on a card');
        await homePage.tapProvideFavor();

        console.log('👉 Handling Apply dialog');
        await homePage.confirmApplyOnDialog();
    });

    // ─────────────────────────────────────────────────────────────────────
    // ❌ TC-002: Invalid Email Format
    // ─────────────────────────────────────────────────────────────────────
    it('TC-002 | Should show error for invalid email format', async () => {
        await signupPage.enterEmail('invalid-email');
        await signupPage.enterPassword('Test@1234');
        await signupPage.enterConfirmPassword('Test@1234');
        await signupPage.tapSubmit();

        const isError = await signupPage.isErrorDisplayed();
        expect(isError).toBe(true);
    });

    // ─────────────────────────────────────────────────────────────────────
    // ❌ TC-003: Password Mismatch
    // ─────────────────────────────────────────────────────────────────────
    it('TC-003 | Should show error when passwords do not match', async () => {
        await signupPage.enterEmail(faker.internet.email());
        await signupPage.enterPassword('Password123');
        await signupPage.enterConfirmPassword('DifferentPass456');
        await signupPage.tapSubmit();

        const isError = await signupPage.isErrorDisplayed();
        expect(isError).toBe(true);
    });

    // ─────────────────────────────────────────────────────────────────────
    // 🔗 TC-004: Navigate back to Login
    // ─────────────────────────────────────────────────────────────────────
    it('TC-004 | Should navigate back to Login screen', async () => {
        await signupPage.tapLoginLink();

        const isLogin = await loginPage.isLoaded();
        expect(isLogin).toBe(true);
    });
});
