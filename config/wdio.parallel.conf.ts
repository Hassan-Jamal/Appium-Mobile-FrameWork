import { config as baseConfig } from './wdio.base.conf';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Parallel execution config — runs tests across multiple devices simultaneously.
 * Supports up to 3 instances (Android emulator + iOS simulator + real device).
 */
export const config: WebdriverIO.Config = {
    ...baseConfig,

    // ── Parallel Instances ────────────────────────────────────────────────
    runner: 'local',
    maxInstances: 3,

    // ── Multi-Device Capabilities ─────────────────────────────────────────
    capabilities: [
        // Device 1: Android Emulator
        {
            platformName: 'Android',
            'appium:deviceName': 'Pixel_7_API_34',
            'appium:platformVersion': '14.0',
            'appium:automationName': 'UiAutomator2',
            'appium:app': process.env.APK_PATH || './apps/app-debug.apk',
            'appium:appPackage': process.env.APP_PACKAGE,
            'appium:appActivity': process.env.APP_ACTIVITY,
            'appium:noReset': false,
            'appium:autoGrantPermissions': true,
            'appium:systemPort': 8200, // unique port per device
        },
        // Device 2: Android Real Device (if connected)
        {
            platformName: 'Android',
            'appium:deviceName': 'Samsung_Galaxy_S23',
            'appium:platformVersion': '13.0',
            'appium:automationName': 'UiAutomator2',
            'appium:app': process.env.APK_PATH || './apps/app-debug.apk',
            'appium:appPackage': process.env.APP_PACKAGE,
            'appium:appActivity': process.env.APP_ACTIVITY,
            'appium:noReset': false,
            'appium:autoGrantPermissions': true,
            'appium:systemPort': 8201, // unique port per device
        },
        // Device 3: iOS Simulator
        {
            platformName: 'iOS',
            'appium:deviceName': 'iPhone 15',
            'appium:platformVersion': '17.2',
            'appium:automationName': 'XCUITest',
            'appium:app': process.env.IPA_PATH || './apps/MyApp.ipa',
            'appium:bundleId': process.env.IOS_BUNDLE_ID,
            'appium:udid': 'auto',
            'appium:noReset': false,
            'appium:wdaLocalPort': 8100, // unique port per device
        },
    ],

    // ── Parallel-Specific Appium Service ──────────────────────────────────
    services: [
        [
            'appium',
            {
                command: 'appium',
                args: {
                    relaxedSecurity: true,
                    log: './appium-parallel.log',
                    port: parseInt(process.env.APPIUM_PORT || '4723'),
                },
            },
        ],
    ],

    // ── Reporters ─────────────────────────────────────────────────────────
    reporters: [
        'spec',
        [
            'allure',
            {
                outputDir: 'allure-results',
                disableWebdriverStepsReporting: false,
                disableWebdriverScreenshotsReporting: false,
            },
        ],
    ],
};
