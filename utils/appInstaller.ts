import { execSync, exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

/**
 * appInstaller.ts - Utility functions to install apps on devices
 * Supports APK (Android) and IPA (iOS) installation, plus store-based launching.
 */

// ── Helper Utilities ───────────────────────────────────────────────────────

function run(cmd: string): string {
    console.log(`🔧 Running: ${cmd}`);
    try {
        return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        throw new Error(`Command failed: ${cmd}\n${errMsg}`);
    }
}

function fileExists(filePath: string): boolean {
    return fs.existsSync(path.resolve(filePath));
}

// ── Android APK Installation ───────────────────────────────────────────────

/**
 * Get list of connected Android devices/emulators
 */
export function getConnectedAndroidDevices(): string[] {
    const output = run('adb devices');
    const lines = output.split('\n').slice(1); // skip header
    return lines
        .filter(line => line.includes('\tdevice'))
        .map(line => line.split('\t')[0].trim());
}

/**
 * Install an APK on a specific device (or all connected if deviceId omitted)
 * @param apkPath Path to the APK file
 * @param deviceId Device serial (from adb devices). If omitted, uses first connected device.
 */
export function installApk(apkPath: string, deviceId?: string): void {
    if (!fileExists(apkPath)) {
        throw new Error(`APK not found at: ${apkPath}`);
    }

    const deviceArg = deviceId ? `-s ${deviceId}` : '';
    const result = run(`adb ${deviceArg} install -r -g "${path.resolve(apkPath)}"`);
    console.log(`✅ APK installed${deviceId ? ` on ${deviceId}` : ''}: ${result}`);
}

/**
 * Install APK on all connected Android devices
 */
export function installApkOnAllDevices(apkPath: string): void {
    const devices = getConnectedAndroidDevices();
    if (devices.length === 0) {
        throw new Error('No Android devices connected');
    }
    console.log(`📱 Installing on ${devices.length} device(s)...`);
    for (const device of devices) {
        installApk(apkPath, device);
    }
}

/**
 * Uninstall an app from Android device
 */
export function uninstallAndroidApp(packageName: string, deviceId?: string): void {
    const deviceArg = deviceId ? `-s ${deviceId}` : '';
    try {
        run(`adb ${deviceArg} uninstall ${packageName}`);
        console.log(`✅ Uninstalled: ${packageName}`);
    } catch {
        console.warn(`⚠️ App not installed or uninstall failed: ${packageName}`);
    }
}

/**
 * Grant all permissions to Android app (avoids permission pop-ups during tests)
 */
export function grantAndroidPermissions(packageName: string, deviceId?: string): void {
    const deviceArg = deviceId ? `-s ${deviceId}` : '';
    const permissions = [
        'android.permission.CAMERA',
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.READ_CONTACTS',
    ];
    for (const perm of permissions) {
        try {
            run(`adb ${deviceArg} shell pm grant ${packageName} ${perm}`);
        } catch { /* permission may not be applicable */ }
    }
    console.log(`✅ Permissions granted for: ${packageName}`);
}

// ── iOS IPA Installation ───────────────────────────────────────────────────

/**
 * Get list of connected iOS simulators
 */
export function getIosSimulators(): { udid: string; name: string; state: string }[] {
    try {
        const output = run('xcrun simctl list devices --json');
        const json = JSON.parse(output);
        const result: { udid: string; name: string; state: string }[] = [];

        for (const runtime of Object.values(json.devices)) {
            for (const device of runtime as { udid: string; name: string; state: string }[]) {
                if (device.state === 'Booted' || device.state === 'Shutdown') {
                    result.push({ udid: device.udid, name: device.name, state: device.state });
                }
            }
        }
        return result;
    } catch {
        console.warn('⚠️ xcrun not available — iOS commands require macOS');
        return [];
    }
}

/**
 * Install IPA on an iOS Simulator
 * @param ipaPath Path to the .ipa or .app file
 * @param udid Simulator UDID (use 'booted' for currently booted simulator)
 */
export function installIpa(ipaPath: string, udid: string = 'booted'): void {
    if (!fileExists(ipaPath)) {
        throw new Error(`IPA not found at: ${ipaPath}`);
    }

    const result = run(`xcrun simctl install ${udid} "${path.resolve(ipaPath)}"`);
    console.log(`✅ IPA installed on simulator ${udid}: ${result || 'success'}`);
}

/**
 * Uninstall app from iOS simulator
 */
export function uninstallIosApp(bundleId: string, udid: string = 'booted'): void {
    try {
        run(`xcrun simctl uninstall ${udid} ${bundleId}`);
        console.log(`✅ Uninstalled iOS app: ${bundleId}`);
    } catch {
        console.warn(`⚠️ iOS app not installed: ${bundleId}`);
    }
}

/**
 * Boot an iOS simulator by UDID
 */
export function bootSimulator(udid: string): void {
    run(`xcrun simctl boot ${udid}`);
    // Wait for boot
    execSync('xcrun simctl bootstatus ' + udid + ' -b', { stdio: 'inherit' });
    console.log(`✅ Simulator booted: ${udid}`);
}

// ── Store-Based Launching ─────────────────────────────────────────────────

/**
 * Launch app from Play Store URL (opens the store listing — user must install)
 * Used for store-validation testing.
 */
export function openPlayStoreListing(packageName: string, deviceId?: string): void {
    const deviceArg = deviceId ? `-s ${deviceId}` : '';
    run(
        `adb ${deviceArg} shell am start -a android.intent.action.VIEW ` +
        `-d "market://details?id=${packageName}" com.android.vending`
    );
    console.log(`🏪 Opened Play Store listing for: ${packageName}`);
}

/**
 * Launch app from TestFlight (opens TestFlight app — requires TestFlight installed)
 */
export function openTestFlight(bundleId: string, udid: string = 'booted'): void {
    run(`xcrun simctl openurl ${udid} "itms-beta://"`)
    console.log(`✈️ Opened TestFlight for: ${bundleId}`);
}

/**
 * Deep link to launch a specific app screen (Android)
 */
export function androidDeepLink(url: string, packageName: string, deviceId?: string): void {
    const deviceArg = deviceId ? `-s ${deviceId}` : '';
    run(`adb ${deviceArg} shell am start -a android.intent.action.VIEW -d "${url}" ${packageName}`);
    console.log(`🔗 Deep link launched: ${url}`);
}

/**
 * Deep link to launch a specific app screen (iOS simulator)
 */
export function iosDeepLink(url: string, udid: string = 'booted'): void {
    run(`xcrun simctl openurl ${udid} "${url}"`);
    console.log(`🔗 iOS deep link launched: ${url}`);
}
