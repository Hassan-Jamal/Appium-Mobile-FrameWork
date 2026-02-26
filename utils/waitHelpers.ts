/**
 * waitHelpers.ts - Advanced wait strategies for mobile automation
 * Handles flaky timing, dynamic content, and network-dependent operations.
 */

// ── Element Wait Strategies ────────────────────────────────────────────────

/**
 * Wait for an element to be visible within timeout
 */
export async function waitForElement(
    locator: string,
    timeout: number = 10000
): Promise<WebdriverIO.Element> {
    const element = await $(locator);
    await element.waitForDisplayed({
        timeout,
        timeoutMsg: `⏱ Timed out waiting for element: "${locator}" (${timeout}ms)`,
    });
    return element;
}

/**
 * Wait for element to disappear (e.g., loading spinner)
 */
export async function waitForInvisible(
    locator: string,
    timeout: number = 10000
): Promise<void> {
    const element = await $(locator);
    await element.waitForDisplayed({
        timeout,
        reverse: true,
        timeoutMsg: `⏱ Element still visible after ${timeout}ms: "${locator}"`,
    });
}

/**
 * Wait for element to be clickable (displayed + enabled)
 */
export async function waitForClickable(
    locator: string,
    timeout: number = 10000
): Promise<WebdriverIO.Element> {
    const element = await $(locator);
    await element.waitForEnabled({
        timeout,
        timeoutMsg: `⏱ Element not enabled after ${timeout}ms: "${locator}"`,
    });
    return element;
}

/**
 * Wait for element to have a specific text value
 */
export async function waitForText(
    locator: string,
    expectedText: string,
    timeout: number = 10000
): Promise<void> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        try {
            const element = await $(locator);
            const text = await element.getText();
            if (text === expectedText || text.includes(expectedText)) {
                return;
            }
        } catch { /* element may not exist yet */ }
        await driver.pause(500);
    }
    throw new Error(`⏱ Element "${locator}" never had text "${expectedText}" in ${timeout}ms`);
}

/**
 * Wait for element to contain partial text
 */
export async function waitForTextContaining(
    locator: string,
    partialText: string,
    timeout: number = 10000
): Promise<void> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        try {
            const element = await $(locator);
            const text = await element.getText();
            if (text.toLowerCase().includes(partialText.toLowerCase())) {
                return;
            }
        } catch { /* element may not exist yet */ }
        await driver.pause(500);
    }
    throw new Error(`⏱ Element "${locator}" never contained "${partialText}" in ${timeout}ms`);
}

/**
 * Wait for any one of multiple locators to appear (first match wins)
 */
export async function waitForAny(
    locators: string[],
    timeout: number = 15000
): Promise<{ locator: string; element: WebdriverIO.Element }> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        for (const locator of locators) {
            try {
                const element = await $(locator);
                if (await element.isDisplayed()) {
                    return { locator, element };
                }
            } catch { /* not found yet */ }
        }
        await driver.pause(500);
    }
    throw new Error(`⏱ None of [${locators.join(', ')}] appeared in ${timeout}ms`);
}

// ── Loading / Network Waits ────────────────────────────────────────────────

/**
 * Wait for a loading spinner to appear and then disappear
 */
export async function waitForLoadingToComplete(
    spinnerLocator: string = '~loading-spinner',
    timeout: number = 30000
): Promise<void> {
    const startTime = Date.now();

    // First wait for spinner to appear (optional – may already be showing)
    try {
        await $(spinnerLocator).waitForDisplayed({ timeout: 2000 });
    } catch {
        // Spinner may have appeared and gone too fast, that's ok
    }

    // Wait for spinner to disappear
    try {
        await waitForInvisible(spinnerLocator, timeout);
        console.log('✅ Loading complete');
    } catch {
        const elapsed = Date.now() - startTime;
        throw new Error(`⏱ Loading spinner never disappeared after ${elapsed}ms`);
    }
}

/**
 * Wait for page to be fully loaded (no network activity for a brief period)
 * This polls for stability rather than relying on a specific element.
 */
export async function waitForPageStable(
    stabilityDuration: number = 1000,
    timeout: number = 15000
): Promise<void> {
    const startTime = Date.now();
    let lastSource = '';
    let stableStart = Date.now();

    while (Date.now() - startTime < timeout) {
        const currentSource = await driver.getPageSource();
        if (currentSource === lastSource) {
            if (Date.now() - stableStart >= stabilityDuration) {
                return; // Page has been stable for stabilityDuration ms
            }
        } else {
            stableStart = Date.now(); // Reset stability timer
            lastSource = currentSource;
        }
        await driver.pause(300);
    }
    // If we reach here, page never fully stabilized — warn but don't fail
    console.warn(`⚠️ Page may not be fully stable after ${timeout}ms`);
}

// ── Retry Strategies ───────────────────────────────────────────────────────

/**
 * Retry a function up to N times with delay between attempts
 * @param fn Async function to retry
 * @param retries Number of retry attempts
 * @param delayMs Delay between retries in milliseconds
 */
export async function retryOnFailure<T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delayMs: number = 1000
): Promise<T> {
    let lastError: Error | unknown;
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            console.warn(`⚠️ Attempt ${attempt}/${retries} failed: ${(error as Error).message}`);
            if (attempt < retries) {
                await driver.pause(delayMs);
            }
        }
    }
    throw new Error(`❌ All ${retries} attempts failed. Last error: ${(lastError as Error).message}`);
}

/**
 * Poll a condition until it returns true or timeout is reached
 */
export async function waitUntil(
    condition: () => Promise<boolean>,
    timeout: number = 10000,
    interval: number = 500,
    timeoutMsg: string = 'Condition was not met within timeout'
): Promise<void> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        if (await condition()) {
            return;
        }
        await driver.pause(interval);
    }
    throw new Error(`⏱ ${timeoutMsg} (${timeout}ms)`);
}

// ── Conditional Waits ──────────────────────────────────────────────────────

/**
 * Wait for element if it exists, otherwise skip gracefully
 */
export async function waitIfExists(
    locator: string,
    timeout: number = 3000
): Promise<WebdriverIO.Element | null> {
    try {
        return await waitForElement(locator, timeout);
    } catch {
        return null;
    }
}

/**
 * Dismiss alert/dialog if one appears (handles unexpected system dialogs)
 */
export async function dismissAlertIfPresent(): Promise<void> {
    try {
        const alert = await $('~AlertDialog');
        if (await alert.isDisplayed()) {
            await $('~OK').click();
            console.log('ℹ️ Dismissed unexpected alert');
        }
    } catch {
        // No alert present, continue
    }
}
