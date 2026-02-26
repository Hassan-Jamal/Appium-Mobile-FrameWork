import type { Options } from '@wdio/types';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Base WebdriverIO configuration shared across Android, iOS, and parallel configs.
 * Platform-specific configs extend/override this base.
 */
export const config: Options.Testrunner = {
    // ── Framework ─────────────────────────────────────────────────────────
    framework: 'mocha',
    mochaOpts: {
        ui: 'bdd',
        timeout: parseInt(process.env.DEFAULT_TIMEOUT || '180000'),
        retries: parseInt(process.env.MAX_RETRIES || '1'),
    },

    // ── Test Specs ────────────────────────────────────────────────────────
    specs: ['./tests/**/*.spec.ts'],
    exclude: [],
    suites: {
        login: ['./tests/login.spec.ts'],
        navigation: ['./tests/navigation.spec.ts'],
        crud: ['./tests/crud.spec.ts'],
        smoke: ['./tests/login.spec.ts', './tests/navigation.spec.ts'],
        regression: ['./tests/**/*.spec.ts'],
    },

    // ── Appium Connection ─────────────────────────────────────────────────
    hostname: process.env.APPIUM_HOST || 'localhost',
    port: parseInt(process.env.APPIUM_PORT || '4723'),
    path: '/',

    // ── Wait / Timeout ────────────────────────────────────────────────────
    waitforTimeout: parseInt(process.env.IMPLICIT_WAIT || '10000'),
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,

    // ── TypeScript ────────────────────────────────────────────────────────
    autoCompileOpts: {
        autoCompile: true,
        tsNodeOpts: {
            project: './tsconfig.json',
            transpileOnly: true,
        },
    },

    // ── Hooks ─────────────────────────────────────────────────────────────
    beforeSession(_config, _capabilities, _specs) {
        // Runs before each test session
    },

    before(_capabilities, _specs) {
        // Runs once before all tests in a session
    },

    beforeSuite(suite) {
        console.log(`\n📱 Starting suite: ${suite.name}`);
    },

    beforeTest(test) {
        console.log(`  ▶ Running: ${test.title}`);
    },

    afterTest(test, _context, { passed, error }) {
        if (!passed) {
            console.error(`  ✗ FAILED: ${test.title}`);
            if (error) console.error(`    Error: ${error.message}`);
            // Take screenshot on failure
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const screenshotPath = `./screenshots/${test.title.replace(/\s+/g, '_')}_${timestamp}.png`;
            try {
                driver.saveScreenshot(screenshotPath);
                console.log(`  📸 Screenshot saved: ${screenshotPath}`);
            } catch (e) {
                console.warn('  ⚠ Could not take screenshot');
            }
        } else {
            console.log(`  ✓ PASSED: ${test.title}`);
        }
    },

    afterSuite(suite) {
        console.log(`\n✅ Suite complete: ${suite.name}`);
    },

    onComplete() {
        console.log('\n🎉 All tests completed!');
        console.log('📊 Run "npm run allure:report" to view the report');
    },
};
