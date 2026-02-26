import { config as baseConfig } from './wdio.base.conf';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

export const config: WebdriverIO.Config = {
    ...baseConfig,

    // ── Runner ────────────────────────────────────────────────────────────
    runner: 'local',
    maxInstances: 1,

    // ── Android / Appium Server Settings ─────────────────────────────────
    // Host/port/path are taken from .env or default to localhost:4723/
    hostname: process.env.APPIUM_HOST || '127.0.0.1',
    port: parseInt(process.env.APPIUM_PORT || '4723'),
    path: process.env.APPIUM_PATH || '/',

    // ── Android Capabilities ─────────────────────────────────────────────
    capabilities: [
        {
            platformName: 'Android',
            'appium:automationName': 'UiAutomator2',
            'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'NRFE4XEQA6KB59MV',
            'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION || '14.0',
            'appium:app': path.resolve(process.cwd(), process.env.APK_PATH || './apps/FavorApp.apk'),
            'appium:appPackage': process.env.APP_PACKAGE || 'com.favorappllc.mobile',
            'appium:appActivity': process.env.APP_ACTIVITY || 'com.favorappllc.mobile.MainActivity',
            'appium:noReset': process.env.NO_RESET ? process.env.NO_RESET === 'true' : true,
            'appium:fullReset': process.env.FULL_RESET ? process.env.FULL_RESET === 'true' : false,
            'appium:ignoreHiddenApiPolicyError': true,
            'appium:newCommandTimeout': parseInt(process.env.NEW_COMMAND_TIMEOUT || '3600'),
            'appium:uiautomator2ServerLaunchTimeout': 60000,
            'appium:adbExecTimeout': 60000,
            'appium:settings[allowInvisibleElements]': true,
            'appium:settings[enforceXPath1]': true,
            // keep these to avoid attempting to install server artifacts when build-tools are missing
            'appium:skipServerInstallation': true,
            'appium:skipDeviceInitialization': true,
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
                    allowInsecure: ['adb_shell'],
                    log: './appium-android.log',
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
                useCucumberStepReporter: false,
            },
        ],
    ],
};
