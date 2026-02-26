#!/usr/bin/env ts-node
/**
 * install-apk.ts - Install APK on connected Android devices
 *
 * Usage:
 *   npx ts-node scripts/install-apk.ts
 *   npx ts-node scripts/install-apk.ts --device emulator-5554
 *   npx ts-node scripts/install-apk.ts --apk ./apps/release.apk
 */

import * as path from 'path';
import * as dotenv from 'dotenv';
import {
    installApk,
    installApkOnAllDevices,
    getConnectedAndroidDevices,
    grantAndroidPermissions,
} from '../utils/appInstaller';

dotenv.config();

async function main(): Promise<void> {
    const args = process.argv.slice(2);

    // Parse CLI args
    const deviceIdx = args.indexOf('--device');
    const apkIdx = args.indexOf('--apk');
    const deviceId = deviceIdx !== -1 ? args[deviceIdx + 1] : undefined;
    const apkPath = apkIdx !== -1 ? args[apkIdx + 1] : process.env.APK_PATH || './apps/app-debug.apk';
    const appPackage = process.env.APP_PACKAGE || 'com.example.myapp';

    console.log('\n📲 Appium Mobile Framework — APK Installer');
    console.log('─'.repeat(50));
    console.log(`APK Path  : ${apkPath}`);
    console.log(`Device    : ${deviceId || 'all connected'}`);
    console.log(`Package   : ${appPackage}`);
    console.log('─'.repeat(50) + '\n');

    // List connected devices
    const devices = getConnectedAndroidDevices();
    if (devices.length === 0) {
        console.error('❌ No Android devices connected!\n');
        console.error('Please connect a device or start an emulator, then run:');
        console.error('  adb devices\n');
        process.exit(1);
    }
    console.log(`📱 Connected devices: ${devices.join(', ')}\n`);

    try {
        if (deviceId) {
            installApk(apkPath, deviceId);
            grantAndroidPermissions(appPackage, deviceId);
        } else {
            installApkOnAllDevices(apkPath);
            for (const device of devices) {
                grantAndroidPermissions(appPackage, device);
            }
        }
        console.log('\n✅ APK installation complete!');
        console.log('▶️  Run tests with: npm run test:android\n');
    } catch (error) {
        console.error(`\n❌ Installation failed: ${(error as Error).message}\n`);
        process.exit(1);
    }
}

main();
