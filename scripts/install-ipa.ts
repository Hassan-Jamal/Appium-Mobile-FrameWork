#!/usr/bin/env ts-node
/**
 * install-ipa.ts - Install IPA/APP on iOS Simulators
 *
 * Usage:
 *   npx ts-node scripts/install-ipa.ts
 *   npx ts-node scripts/install-ipa.ts --udid <SIMULATOR_UDID>
 *   npx ts-node scripts/install-ipa.ts --ipa ./apps/MyApp.ipa
 *   npx ts-node scripts/install-ipa.ts --list   (list available simulators)
 */

import * as dotenv from 'dotenv';
import {
    installIpa,
    getIosSimulators,
    uninstallIosApp,
    bootSimulator,
} from '../utils/appInstaller';

dotenv.config();

async function main(): Promise<void> {
    const args = process.argv.slice(2);

    // Parse CLI args
    const udidIdx = args.indexOf('--udid');
    const ipaIdx = args.indexOf('--ipa');
    const listMode = args.includes('--list');
    const udid = udidIdx !== -1 ? args[udidIdx + 1] : process.env.IOS_UDID || 'booted';
    const ipaPath = ipaIdx !== -1 ? args[ipaIdx + 1] : process.env.IPA_PATH || './apps/MyApp.ipa';
    const bundleId = process.env.IOS_BUNDLE_ID || 'com.example.myapp';

    console.log('\n📲 Appium Mobile Framework — IPA Installer');
    console.log('─'.repeat(50));

    if (listMode) {
        // List available simulators
        const sims = getIosSimulators();
        if (sims.length === 0) {
            console.warn('⚠️ No simulators found or xcrun not available (requires macOS).');
        } else {
            console.log('Available simulators:\n');
            sims.forEach(sim => {
                const status = sim.state === 'Booted' ? '🟢 Booted' : '⭕ Shutdown';
                console.log(`  ${status}  ${sim.name.padEnd(30)} UDID: ${sim.udid}`);
            });
        }
        console.log();
        return;
    }

    console.log(`IPA Path  : ${ipaPath}`);
    console.log(`UDID      : ${udid}`);
    console.log(`Bundle ID : ${bundleId}`);
    console.log('─'.repeat(50) + '\n');

    // Check if running on macOS
    if (process.platform !== 'darwin') {
        console.error('❌ iOS installation requires macOS with Xcode installed.\n');
        process.exit(1);
    }

    try {
        // Uninstall existing version first (clean install)
        console.log('🗑️  Removing existing app installation...');
        uninstallIosApp(bundleId, udid);

        // Install fresh build
        installIpa(ipaPath, udid);

        console.log('\n✅ IPA installation complete!');
        console.log('▶️  Run tests with: npm run test:ios\n');
    } catch (error) {
        console.error(`\n❌ Installation failed: ${(error as Error).message}`);
        console.error('\nTroubleshooting:');
        console.error('  1. Check that a simulator is booted: xcrun simctl list devices');
        console.error('  2. Boot a simulator: xcrun simctl boot <UDID>');
        console.error('  3. Ensure the IPA path is correct\n');
        process.exit(1);
    }
}

main();
