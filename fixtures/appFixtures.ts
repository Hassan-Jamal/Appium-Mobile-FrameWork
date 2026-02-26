import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * appFixtures.ts - Custom WebdriverIO hooks that act as fixtures.
 * These are referenced from wdio.base.conf.ts or imported per-spec.
 *
 * Provides:
 *  - authenticatedSession: auto-login before a suite
 *  - cleanState: reset app state between tests
 *  - screenshotOnFailure: capture screenshot on test failure
 */

// ── Authenticated Session ──────────────────────────────────────────────────

/**
 * Login helper to use in `before` hooks for specs that require auth.
 * Example:
 *   before(async () => { await authenticatedSession(); });
 */
export async function authenticatedSession(): Promise<void> {
    const loginPage = new LoginPage();
    const homePage = new HomePage();

    const email = process.env.TEST_USER_EMAIL || 'testuser@example.com';
    const password = process.env.TEST_USER_PASSWORD || 'Test@1234';

    console.log(`🔐 Setting up authenticated session for: ${email}`);
    await loginPage.waitForLoginScreen();
    await loginPage.login(email, password);
    await homePage.waitForHomeScreen();
    console.log('✅ Authenticated session ready');
}

// ── Clean State ────────────────────────────────────────────────────────────

/**
 * Reset app to initial state (like a fresh install launch).
 * Use in `beforeEach` for tests that need a clean slate.
 */
export async function cleanState(): Promise<void> {
    await driver.reset();
    console.log('🔄 App state reset');
}

/**
 * Navigate back to home screen (for tests that navigate away).
 * Safer than full reset — just returns to home without re-login.
 */
export async function returnToHome(): Promise<void> {
    const homePage = new HomePage();
    try {
        // Try pressing home if we're elsewhere
        for (let i = 0; i < 3; i++) {
            if (await homePage.isLoaded()) break;
            await driver.pressKeyCode(4); // Android back
            await driver.pause(500);
        }
    } catch {
        // If navigation fails, reset app
        await driver.reset();
    }
}

// ── Screenshot on Failure ──────────────────────────────────────────────────

/**
 * Take a screenshot and attach it to the Allure report.
 * Call this in afterTest hook when test fails.
 */
export async function screenshotOnFailure(testTitle: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeName = testTitle.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
    const filepath = `./screenshots/${safeName}_${timestamp}.png`;

    // Ensure screenshots directory exists
    const fs = await import('fs');
    if (!fs.existsSync('./screenshots')) {
        fs.mkdirSync('./screenshots', { recursive: true });
    }

    await driver.saveScreenshot(filepath);
    console.log(`📸 Screenshot saved: ${filepath}`);

    // Attach to Allure report
    try {
        const allure = (await import('@wdio/allure-reporter')).default;
        allure.addAttachment('Screenshot on Failure', Buffer.from(await driver.takeScreenshot(), 'base64'), 'image/png');
    } catch {
        // Allure not configured, skip attachment
    }
}

// ── Device Info Fixture ────────────────────────────────────────────────────

export interface DeviceInfo {
    platform: string;
    platformVersion: string;
    deviceName: string;
    isAndroid: boolean;
    isIOS: boolean;
}

/**
 * Get current device information from capabilities
 */
export async function getDeviceInfo(): Promise<DeviceInfo> {
    const caps = await driver.capabilities as Record<string, string>;
    const platform = (caps.platformName || '').toLowerCase();
    return {
        platform: caps.platformName || 'unknown',
        platformVersion: caps['appium:platformVersion'] || caps.platformVersion || 'unknown',
        deviceName: caps['appium:deviceName'] || caps.deviceName || 'unknown',
        isAndroid: platform === 'android',
        isIOS: platform === 'ios',
    };
}

// ── Test Context ───────────────────────────────────────────────────────────

/**
 * Log test context info (platform, device) at start of each suite.
 * Add to beforeSuite hook in config for useful CI logs.
 */
export async function logTestContext(suiteName: string): Promise<void> {
    const info = await getDeviceInfo();
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`📱 Platform : ${info.platform} ${info.platformVersion}`);
    console.log(`🔧 Device   : ${info.deviceName}`);
    console.log(`🧪 Suite    : ${suiteName}`);
    console.log(`${'─'.repeat(60)}`);
}

// ── Allure Metadata ────────────────────────────────────────────────────────

/**
 * Add test metadata to Allure report (feature, story, severity).
 */
export async function addAllureMeta(options: {
    feature?: string;
    story?: string;
    severity?: 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial';
    owner?: string;
}): Promise<void> {
    try {
        const allure = (await import('@wdio/allure-reporter')).default;
        if (options.feature) allure.addFeature(options.feature);
        if (options.story) allure.addStory(options.story);
        if (options.severity) allure.addSeverity(options.severity);
        if (options.owner) allure.addOwner(options.owner);
    } catch {
        // Allure not configured
    }
}
