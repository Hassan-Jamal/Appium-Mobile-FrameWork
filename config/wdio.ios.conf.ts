import { config as baseConfig } from './wdio.base.conf';
import * as dotenv from 'dotenv';

dotenv.config();

export const config: WebdriverIO.Config = {
    ...baseConfig,

    // ── Runner ────────────────────────────────────────────────────────────
    runner: 'local',
    maxInstances: 1,

    // ── iOS Capabilities ──────────────────────────────────────────────────
    capabilities: [
        {
            platformName: 'iOS',
            'appium:deviceName': process.env.IOS_DEVICE_NAME || 'iPhone 15',
            'appium:platformVersion': process.env.IOS_PLATFORM_VERSION || '17.2',
            'appium:automationName': 'XCUITest',
            'appium:app': process.env.IPA_PATH || './apps/MyApp.ipa',
            'appium:bundleId': process.env.IOS_BUNDLE_ID || 'com.example.myapp',
            'appium:udid': process.env.IOS_UDID || 'auto',
            'appium:noReset': false,
            'appium:fullReset': false,
            'appium:newCommandTimeout': 240,
            'appium:wdaLaunchTimeout': 120000,
            'appium:wdaConnectionTimeout': 120000,
            'appium:useNewWDA': false,
            'appium:showXcodeLog': false,
        },
    ],

    // ── Appium Service ────────────────────────────────────────────────────
    services: [
        [
            'appium',
            {
                command: 'appium',
                args: {
                    relaxedSecurity: true,
                    log: './appium-ios.log',
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
