import { BasePage } from './BasePage';

/**
 * HomePage - Page Object for the main dashboard/home screen.
 * Reached after successful login.
 */
export class HomePage extends BasePage {
    // ── Locators ───────────────────────────────────────────────────────────
    private get welcomeMessage() { return this.byXPath('//*[contains(@text, "Welcome") or contains(@text, "Hello")]'); }
    private get userAvatar() { return this.byAccessibilityId('user-avatar'); }
    private get menuButton() { return this.byAccessibilityId('menu-button'); }
    private get logoutButton() { return this.byAccessibilityId('logout-button'); }
    private get homeTab() { return this.byXPath('//*[@text="Home" or @content-desc="Home"]'); }
    private get profileTab() { return this.byAccessibilityId('profile-tab'); }
    private get settingsTab() { return this.byAccessibilityId('settings-tab'); }
    private get notificationBell() { return this.byAccessibilityId('notification-bell'); }
    private get searchBar() { return this.byAccessibilityId('search-bar'); }
    private get addItemFab() { return this.byAccessibilityId('add-item-fab'); }
    // Map view (several fallbacks because different builds expose map differently)
    private get mapViewById() { return this.byAccessibilityId('map'); }
    private get mapViewByClass() { return this.byXPath('//com.google.android.gms.maps.MapView | //android.view.View[contains(@content-desc, "map") or contains(@resource-id, "map")]'); }
    // Post-login actions
    private get mapViewContentDesc() { return this.byXPath('//android.view.ViewGroup[@content-desc="Map View"]'); }
    private get listViewButton() { return this.byAccessibilityId('List View'); }
    private get skipForNowButton() { return this.byAccessibilityId('Skip for now'); }
    private get provideFavorButton() { return this.byAccessibilityId('$0.00 | Provide a Favor'); }
    private get alertTitle() { return this.byXPath('//android.widget.TextView[@resource-id="com.favorappllc.mobile:id/alertTitle"]'); }
    private get applyButton() { return this.byXPath('//android.widget.Button[@resource-id="android:id/button1"]'); }

    // XPath for deeper navigation items
    private get settingsMenuXPath() {
        return this.byXPath('//android.widget.TextView[@text="Settings"]');
    }

    // ── Page State ─────────────────────────────────────────────────────────

    /**
     * Verify home screen is loaded (welcome message is visible)
     */
    async isLoaded(): Promise<boolean> {
        return await this.isDisplayed(this.mapViewById)
            || await this.isDisplayed(this.mapViewByClass)
            || await this.isDisplayed(this.mapViewContentDesc)
            || await this.isDisplayed(this.welcomeMessage);
    }

    /**
     * Wait until home screen is fully displayed (after login)
     */
    async waitForHomeScreen(timeout: number = 20000): Promise<void> {
        const start = Date.now();
        while ((Date.now() - start) < timeout) {
            if (await this.isDisplayed(this.mapViewById)) {
                console.log('🗺️ Map view detected on home screen');
                return;
            }
            if (await this.isDisplayed(this.mapViewByClass)) {
                console.log('🗺️ Map view (class) detected on home screen');
                return;
            }
            if (await this.isDisplayed(this.mapViewContentDesc)) {
                console.log('🗺️ Map view (content-desc) detected on home screen');
                return;
            }
            if (await this.isDisplayed(this.welcomeMessage)) {
                console.log('🏠 Home welcome message detected');
                return;
            }
            await this.pause(500);
        }
        throw new Error('Home screen did not become visible (map or welcome missing)');
    }

    /**
     * Wait until the map view is visible (dashboard map has loaded)
     */
    async waitForMapView(timeout: number = 30000): Promise<void> {
        const start = Date.now();
        // Try multiple locators until one is visible
        while ((Date.now() - start) < timeout) {
            if (await this.isDisplayed(this.mapViewById)) return;
            if (await this.isDisplayed(this.mapViewByClass)) return;
            await this.pause(500);
        }
        throw new Error('Map view did not become visible');
    }

    /**
     * Quick check whether map view appears loaded
     */
    async isMapLoaded(): Promise<boolean> {
        return await this.isDisplayed(this.mapViewById) || await this.isDisplayed(this.mapViewByClass);
    }

    // ── Post-login Interactions ─────────────────────────────────────────

    /** Tap the List View toggle */
    async tapListView(): Promise<void> {
        if (await this.isDisplayed(this.listViewButton)) {
            await this.tap(this.listViewButton);
            // Allow the list view transition to settle and subscription modal to appear
            await this.pause(2000);
        }
    }

    /** Skip subscription modal if it appears */
    async skipSubscriptionIfPresent(timeout: number = 10000): Promise<void> {
        const start = Date.now();
        while ((Date.now() - start) < timeout) {
            if (await this.isDisplayed(this.skipForNowButton)) {
                await this.tap(this.skipForNowButton);
                await this.pause(500);
                return;
            }
            await this.pause(300);
        }
        // If skip button never appeared, continue silently (not all accounts see it)
    }

    /** Tap the Provide a Favor button on a card */
    async tapProvideFavor(): Promise<void> {
        if (await this.isDisplayed(this.provideFavorButton)) {
            await this.tap(this.provideFavorButton);
            await this.pause(500);
        }
    }

    /** Confirm the apply dialog by tapping Apply */
    async confirmApplyOnDialog(): Promise<void> {
        if (await this.isDisplayed(this.alertTitle)) {
            await this.tap(this.applyButton);
            await this.pause(800);
        }
    }

    // ── Content Methods ────────────────────────────────────────────────────

    /**
     * Get the welcome message text (e.g., "Welcome, John!")
     */
    async getWelcomeText(): Promise<string> {
        return await this.getText(this.welcomeMessage);
    }

    /**
     * Get logged-in username from welcome message
     */
    async getLoggedInUsername(): Promise<string> {
        const welcomeText = await this.getWelcomeText();
        // Extract name from "Welcome, {name}!" format
        const match = welcomeText.match(/Welcome,?\s+(.+)!?/i);
        return match ? match[1].trim() : welcomeText;
    }

    // ── Navigation Methods ─────────────────────────────────────────────────

    /**
     * Tap the hamburger/menu button
     */
    async tapMenu(): Promise<void> {
        await this.tap(this.menuButton);
    }

    /**
     * Tap Home tab in bottom navigation
     */
    async tapHomeTab(): Promise<void> {
        await this.tap(this.homeTab);
    }

    /**
     * Tap Profile tab in bottom navigation
     */
    async tapProfileTab(): Promise<void> {
        await this.tap(this.profileTab);
    }

    /**
     * Tap Settings tab in bottom navigation
     */
    async tapSettingsTab(): Promise<void> {
        await this.tap(this.settingsTab);
    }

    /**
     * Tap notification bell icon
     */
    async tapNotifications(): Promise<void> {
        await this.tap(this.notificationBell);
    }

    /**
     * Tap the floating action button (FAB) to add new item
     */
    async tapAddItem(): Promise<void> {
        await this.tap(this.addItemFab);
    }

    /**
     * Search for text using the search bar
     */
    async search(query: string): Promise<void> {
        await this.tap(this.searchBar);
        await this.typeText(this.searchBar, query);
        await this.hideKeyboard();
    }

    // ── Logout ─────────────────────────────────────────────────────────────

    /**
     * Open side menu and tap logout
     */
    async logout(): Promise<void> {
        console.log('🚪 Logging out...');
        // Open menu (some apps use side drawer, others have direct logout)
        await this.tap(this.menuButton);
        await this.pause(800);
        // Scroll to logout if needed
        try {
            await this.tap(this.logoutButton);
        } catch {
            // Try scrolling down and finding logout
            await this.scrollToElement('Logout');
            await this.tap(this.byAccessibilityId('logout-button'));
        }
    }

    /**
     * Check notification badge count
     */
    async getNotificationCount(): Promise<string> {
        const badge = this.byAccessibilityId('notification-badge');
        if (await this.isDisplayed(badge)) {
            return await this.getText(badge);
        }
        return '0';
    }
}
