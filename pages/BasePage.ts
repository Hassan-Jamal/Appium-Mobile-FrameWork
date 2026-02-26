import * as dotenv from 'dotenv';

dotenv.config();

/**
 * BasePage - Abstract base class for all Page/Screen Objects.
 * Provides common mobile interaction methods using WebdriverIO.
 */
export abstract class BasePage {
    // ── Locator Builders (Playwright-style) ──────────────────────────────

    /** Find element by Accessibility ID (recommended for cross-platform) */
    protected byAccessibilityId(id: string): string {
        return `~${id}`;
    }

    /** Find element by resource-id (Android) or name (iOS) */
    protected byId(id: string): string {
        return `#${id}`;
    }

    /** Find element by XPath */
    protected byXPath(xpath: string): string {
        return xpath;
    }

    /** Find element by class name (e.g., android.widget.Button) */
    protected byClassName(className: string): string {
        return `.${className}`;
    }

    /** Find element by text content (Android UiSelector) */
    protected byText(text: string): string {
        return `android=new UiSelector().text("${text}")`;
    }

    /** Find iOS element by predicate string */
    protected byIosPredicate(predicate: string): string {
        return `-ios predicate string:${predicate}`;
    }

    /** Find iOS element by class chain */
    protected byIosClassChain(chain: string): string {
        return `-ios class chain:${chain}`;
    }

    // ── Core Element Interactions ─────────────────────────────────────────

    /**
     * Get a single element (throws if not found)
     */
    protected async getElement(locator: string) {
        return await $(locator);
    }

    /**
     * Get all matching elements
     */
    protected async getElements(locator: string) {
        return await $$(locator);
    }

    /**
     * Wait for element to be visible/displayed
     */
    async waitForVisible(locator: string, timeout: number = 10000): Promise<WebdriverIO.Element> {
        const element = await $(locator);
        await element.waitForDisplayed({ timeout, timeoutMsg: `Element not visible: ${locator}` });
        return element;
    }

    /**
     * Wait for element to disappear
     */
    async waitForInvisible(locator: string, timeout: number = 10000): Promise<void> {
        const element = await $(locator);
        await element.waitForDisplayed({ timeout, reverse: true, timeoutMsg: `Element still visible: ${locator}` });
    }

    /**
     * Wait for element to be clickable/enabled
     */
    async waitForClickable(locator: string, timeout: number = 10000): Promise<WebdriverIO.Element> {
        const element = await $(locator);
        await element.waitForEnabled({ timeout, timeoutMsg: `Element not clickable: ${locator}` });
        return element;
    }

    // ── Tap / Click ───────────────────────────────────────────────────────

    /**
     * Tap on element
     */
    async tap(locator: string): Promise<void> {
        const element = await this.waitForClickable(locator);
        await element.click();
    }

    /**
     * Tap element by XY coordinates on screen
     */
    async tapByCoordinates(x: number, y: number): Promise<void> {
        await driver.touchAction({ action: 'tap', x, y });
    }

    /**
     * Long press on an element
     */
    async longPress(locator: string, duration: number = 1500): Promise<void> {
        const element = await this.waitForVisible(locator);
        await driver.touchAction([
            { action: 'longPress', element, ms: duration },
            { action: 'release' },
        ]);
    }

    // ── Text Input ────────────────────────────────────────────────────────

    /**
     * Type text into an input field
     */
    async typeText(locator: string, text: string): Promise<void> {
        const element = await this.waitForVisible(locator);
        await element.click();
        await element.setValue(text);
    }

    /**
     * Clear existing text and type new text
     */
    async clearAndType(locator: string, text: string): Promise<void> {
        const element = await this.waitForVisible(locator);
        await element.click();
        await this.pause(300); // Wait for focus/keyboard
        await element.clearValue();
        try {
            await element.setValue(text);
        } catch (error) {
            console.log(`⚠️ Standard setValue failed, trying addValue: ${(error as any).message}`);
            await element.addValue(text);
        }
    }

    /**
     * Get text from an element
     */
    async getText(locator: string): Promise<string> {
        const element = await this.waitForVisible(locator);
        return await element.getText();
    }

    /**
     * Get attribute value from an element
     */
    async getAttribute(locator: string, attribute: string): Promise<string> {
        const element = await this.waitForVisible(locator);
        return await element.getAttribute(attribute);
    }

    // ── Visibility Checks ─────────────────────────────────────────────────

    /**
     * Check if an element is currently displayed
     */
    async isDisplayed(locator: string): Promise<boolean> {
        try {
            const element = await $(locator);
            return await element.isDisplayed();
        } catch {
            return false;
        }
    }

    /**
     * Check element exists in DOM (may not be visible)
     */
    async isExisting(locator: string): Promise<boolean> {
        try {
            const element = await $(locator);
            return await element.isExisting();
        } catch {
            return false;
        }
    }

    // ── Gestures ──────────────────────────────────────────────────────────

    /**
     * Swipe up (scroll down the page)
     */
    async swipeUp(percentage: number = 0.5): Promise<void> {
        const { width, height } = await driver.getWindowSize();
        const startX = Math.floor(width / 2);
        const startY = Math.floor(height * 0.7);
        const endY = Math.floor(height * (0.7 - percentage));

        await driver.performActions([
            {
                type: 'pointer',
                id: 'finger1',
                parameters: { pointerType: 'touch' },
                actions: [
                    { type: 'pointerMove', duration: 0, x: startX, y: startY },
                    { type: 'pointerDown', button: 0 },
                    { type: 'pause', duration: 500 },
                    { type: 'pointerMove', duration: 1000, origin: 'viewport', x: startX, y: Math.max(0, endY) },
                    { type: 'pointerUp', button: 0 },
                ],
            },
        ]);
        await this.pause(500);
    }

    /**
     * Swipe down (scroll up the page)
     */
    async swipeDown(percentage: number = 0.5): Promise<void> {
        const { width, height } = await driver.getWindowSize();
        const startX = Math.floor(width / 2);
        const startY = Math.floor(height * 0.3);
        const endY = Math.floor(height * (0.3 + percentage));

        await driver.performActions([
            {
                type: 'pointer',
                id: 'finger1',
                parameters: { pointerType: 'touch' },
                actions: [
                    { type: 'pointerMove', duration: 0, x: startX, y: startY },
                    { type: 'pointerDown', button: 0 },
                    { type: 'pause', duration: 500 },
                    { type: 'pointerMove', duration: 1000, origin: 'viewport', x: startX, y: Math.min(height, endY) },
                    { type: 'pointerUp', button: 0 },
                ],
            },
        ]);
        await this.pause(500);
    }

    /**
     * Swipe left (go to next screen/item)
     */
    async swipeLeft(): Promise<void> {
        const { width, height } = await driver.getWindowSize();
        await driver.touchAction([
            { action: 'press', x: width * 0.8, y: height / 2 },
            { action: 'wait', ms: 300 },
            { action: 'moveTo', x: width * 0.2, y: height / 2 },
            { action: 'release' },
        ]);
    }

    /**
     * Swipe right (go to previous screen/item)
     */
    async swipeRight(): Promise<void> {
        const { width, height } = await driver.getWindowSize();
        await driver.touchAction([
            { action: 'press', x: width * 0.2, y: height / 2 },
            { action: 'wait', ms: 300 },
            { action: 'moveTo', x: width * 0.8, y: height / 2 },
            { action: 'release' },
        ]);
    }

    /**
     * Scroll until element with given text is visible
     */
    async scrollToElement(text: string, maxSwipes: number = 10): Promise<WebdriverIO.Element> {
        let attempts = 0;
        while (attempts < maxSwipes) {
            const isVisible = await this.isDisplayed(`~${text}`);
            if (isVisible) {
                return await $(`~${text}`);
            }
            // Try text locator as fallback
            const byText = await this.isDisplayed(`//*[@text="${text}"]`);
            if (byText) {
                return await $(`//*[@text="${text}"]`);
            }
            await this.swipeUp(0.4);
            attempts++;
        }
        throw new Error(`Element with text "${text}" not found after ${maxSwipes} swipes`);
    }

    // ── Navigation ────────────────────────────────────────────────────────

    /**
     * Press Android back button
     */
    async pressBack(): Promise<void> {
        await driver.pressKeyCode(4); // Android back key code
    }

    /**
     * Press Android home button
     */
    async pressHome(): Promise<void> {
        await driver.pressKeyCode(3); // Android home key code
    }

    /**
     * Background app and bring it to foreground (for session tests)
     */
    async backgroundAndResume(seconds: number = 3): Promise<void> {
        await driver.background(seconds);
    }

    /**
     * Hide soft keyboard
     */
    async hideKeyboard(): Promise<void> {
        try {
            if (await driver.isKeyboardShown()) {
                await driver.hideKeyboard();
                await this.pause(500);
            }
        } catch {
            try {
                await driver.pressKeyCode(4);
                await this.pause(500);
            } catch {
                // Ignore
            }
        }
    }

    // ── Screenshots & Utilities ───────────────────────────────────────────

    /**
     * Take a screenshot and save to given path
     */
    async takeScreenshot(filename: string): Promise<void> {
        await driver.saveScreenshot(`./screenshots/${filename}.png`);
    }

    /**
     * Get current page source (for debugging)
     */
    async getPageSource(): Promise<string> {
        return await driver.getPageSource();
    }

    /**
     * Wait for a given number of milliseconds
     */
    async pause(ms: number): Promise<void> {
        await driver.pause(ms);
    }

    // ── Abstract Methods (implement in page classes) ───────────────────────

    /**
     * Verify the page/screen is loaded correctly.
     * Every page must implement this.
     */
    abstract isLoaded(): Promise<boolean>;
}
