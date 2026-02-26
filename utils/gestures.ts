/**
 * gestures.ts - Mobile gesture utilities
 * Standalone gesture helpers that work with the global `driver` object.
 * These can be used directly in tests or extended in BasePage.
 */

// ── Swipe Gestures ─────────────────────────────────────────────────────────

/**
 * Swipe up on the screen (scroll content down)
 * @param percentage How much of the screen height to swipe (0-1)
 */
export async function swipeUp(percentage: number = 0.5): Promise<void> {
    const { width, height } = await driver.getWindowSize();
    const startX = Math.floor(width / 2);
    const startY = Math.floor(height * 0.7);
    const endY = Math.floor(height * (0.7 - percentage));

    await driver.touchAction([
        { action: 'press', x: startX, y: startY },
        { action: 'wait', ms: 300 },
        { action: 'moveTo', x: startX, y: Math.max(endY, 10) },
        { action: 'release' },
    ]);
}

/**
 * Swipe down on the screen (scroll content up / pull-to-refresh)
 * @param percentage How much of the screen height to swipe (0-1)
 */
export async function swipeDown(percentage: number = 0.5): Promise<void> {
    const { width, height } = await driver.getWindowSize();
    const startX = Math.floor(width / 2);
    const startY = Math.floor(height * 0.3);
    const endY = Math.floor(height * (0.3 + percentage));

    await driver.touchAction([
        { action: 'press', x: startX, y: startY },
        { action: 'wait', ms: 300 },
        { action: 'moveTo', x: startX, y: Math.min(endY, height - 10) },
        { action: 'release' },
    ]);
}

/**
 * Swipe left on the screen (advance carousel, next item)
 * @param startXRatio Starting X position ratio (default 0.8 = right side)
 */
export async function swipeLeft(startXRatio: number = 0.8): Promise<void> {
    const { width, height } = await driver.getWindowSize();
    const y = Math.floor(height / 2);
    const startX = Math.floor(width * startXRatio);
    const endX = Math.floor(width * (1 - startXRatio));

    await driver.touchAction([
        { action: 'press', x: startX, y },
        { action: 'wait', ms: 300 },
        { action: 'moveTo', x: endX, y },
        { action: 'release' },
    ]);
}

/**
 * Swipe right on the screen (go back on iOS, previous item)
 */
export async function swipeRight(startXRatio: number = 0.2): Promise<void> {
    const { width, height } = await driver.getWindowSize();
    const y = Math.floor(height / 2);
    const startX = Math.floor(width * startXRatio);
    const endX = Math.floor(width * (1 - startXRatio));

    await driver.touchAction([
        { action: 'press', x: startX, y },
        { action: 'wait', ms: 300 },
        { action: 'moveTo', x: endX, y },
        { action: 'release' },
    ]);
}

/**
 * iOS back gesture — swipe from left edge
 */
export async function iosSwipeBack(): Promise<void> {
    const { height } = await driver.getWindowSize();
    await driver.touchAction([
        { action: 'press', x: 5, y: Math.floor(height / 2) },
        { action: 'wait', ms: 400 },
        { action: 'moveTo', x: 200, y: Math.floor(height / 2) },
        { action: 'release' },
    ]);
}

// ── Element-Targeted Swipe ─────────────────────────────────────────────────

/**
 * Swipe left on a specific element (swipe-to-delete, swipe-to-reveal)
 */
export async function swipeElementLeft(element: WebdriverIO.Element): Promise<void> {
    const location = await element.getLocation();
    const size = await element.getSize();

    const startX = Math.floor(location.x + size.width * 0.8);
    const endX = Math.floor(location.x + size.width * 0.1);
    const y = Math.floor(location.y + size.height / 2);

    await driver.touchAction([
        { action: 'press', x: startX, y },
        { action: 'wait', ms: 300 },
        { action: 'moveTo', x: endX, y },
        { action: 'release' },
    ]);
}

/**
 * Swipe right on a specific element
 */
export async function swipeElementRight(element: WebdriverIO.Element): Promise<void> {
    const location = await element.getLocation();
    const size = await element.getSize();

    const startX = Math.floor(location.x + size.width * 0.1);
    const endX = Math.floor(location.x + size.width * 0.9);
    const y = Math.floor(location.y + size.height / 2);

    await driver.touchAction([
        { action: 'press', x: startX, y },
        { action: 'wait', ms: 300 },
        { action: 'moveTo', x: endX, y },
        { action: 'release' },
    ]);
}

// ── Scroll ─────────────────────────────────────────────────────────────────

/**
 * Scroll down until an element with given text is visible
 * @param text Text content to scroll to
 * @param maxSwipes Maximum number of swipes before giving up
 */
export async function scrollToText(text: string, maxSwipes: number = 15): Promise<WebdriverIO.Element | null> {
    for (let i = 0; i < maxSwipes; i++) {
        try {
            const element = await $(`//*[@text="${text}"]`);
            if (await element.isDisplayed()) {
                return element;
            }
        } catch { /* not found yet */ }

        try {
            const element = await $(`~${text}`);
            if (await element.isDisplayed()) {
                return element;
            }
        } catch { /* not found yet */ }

        await swipeUp(0.4);
        await driver.pause(200);
    }
    console.warn(`⚠️ Element with text "${text}" not found after ${maxSwipes} swipes`);
    return null;
}

/**
 * Scroll until element matching locator is visible
 */
export async function scrollToLocator(locator: string, maxSwipes: number = 10): Promise<WebdriverIO.Element | null> {
    for (let i = 0; i < maxSwipes; i++) {
        try {
            const element = await $(locator);
            if (await element.isDisplayed()) {
                return element;
            }
        } catch { /* not found yet */ }
        await swipeUp(0.4);
        await driver.pause(200);
    }
    return null;
}

// ── Tap Gestures ───────────────────────────────────────────────────────────

/**
 * Tap at specific (x, y) coordinates on the screen
 */
export async function tapByCoordinates(x: number, y: number): Promise<void> {
    await driver.touchAction({ action: 'tap', x, y });
}

/**
 * Double-tap on an element
 */
export async function doubleTap(locator: string): Promise<void> {
    const element = await $(locator);
    await element.doubleClick();
}

/**
 * Long press on element for given duration
 */
export async function longPress(locator: string, durationMs: number = 1500): Promise<void> {
    const element = await $(locator);
    await driver.touchAction([
        { action: 'longPress', element, ms: durationMs },
        { action: 'release' },
    ]);
}

// ── Drag & Drop ────────────────────────────────────────────────────────────

/**
 * Drag element from one position to another
 */
export async function dragAndDrop(
    fromElement: WebdriverIO.Element,
    toElement: WebdriverIO.Element
): Promise<void> {
    const fromLoc = await fromElement.getLocation();
    const toLoc = await toElement.getLocation();

    await driver.touchAction([
        { action: 'longPress', x: fromLoc.x, y: fromLoc.y, ms: 800 },
        { action: 'moveTo', x: toLoc.x, y: toLoc.y },
        { action: 'release' },
    ]);
}

// ── Pull to Refresh ────────────────────────────────────────────────────────

/**
 * Trigger pull-to-refresh gesture
 */
export async function pullToRefresh(): Promise<void> {
    await swipeDown(0.6);
    await driver.pause(1000); // wait for refresh animation
}
