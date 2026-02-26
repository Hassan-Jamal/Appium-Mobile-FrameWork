import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { CrudPage } from '../pages/CrudPage';
import { generateItem, generateUser } from '../utils/testData';
import * as dotenv from 'dotenv';

dotenv.config();

describe('CRUD Operations Tests', () => {
    let loginPage: LoginPage;
    let homePage: HomePage;
    let crudPage: CrudPage;

    // Shared test data (generated fresh per suite run)
    const testItem = generateItem();

    before(async () => {
        loginPage = new LoginPage();
        homePage = new HomePage();
        crudPage = new CrudPage();

        // Login before all CRUD tests
        await loginPage.login(
            process.env.TEST_USER_EMAIL || 'xarof24140@esyline.com',
            process.env.TEST_USER_PASSWORD || 'Test@1234'
        );
        await homePage.waitForHomeScreen();
        // Navigate to items list
        await homePage.tapAddItem();
        await crudPage.waitForListScreen();
    });

    // ─────────────────────────────────────────────────────────────────────
    // ➕ TC-CRUD-001: Create new item
    // ─────────────────────────────────────────────────────────────────────
    it('TC-CRUD-001 | Should create a new item successfully', async () => {
        console.log(`🧪 Test data: ${JSON.stringify(testItem)}`);

        await crudPage.createItem({
            title: testItem.title,
            description: testItem.description,
        });

        // Verify item appears in the list
        const isVisible = await crudPage.isItemVisible(testItem.title);
        expect(isVisible).toBe(true);
    });

    // ─────────────────────────────────────────────────────────────────────
    // 📖 TC-CRUD-002: Read / verify created item
    // ─────────────────────────────────────────────────────────────────────
    it('TC-CRUD-002 | Should display the created item in list', async () => {
        const isVisible = await crudPage.isItemVisible(testItem.title);
        expect(isVisible).toBe(true);

        // Verify item can be tapped and detail opens
        await crudPage.tapItem(testItem.title);
        const detailTitle = await crudPage.isDisplayed('~item-detail-title');
        expect(detailTitle).toBe(true);

        // Go back
        await crudPage.pressBack();
        await crudPage.waitForListScreen();
    });

    // ─────────────────────────────────────────────────────────────────────
    // ✏️ TC-CRUD-003: Update item title
    // ─────────────────────────────────────────────────────────────────────
    it('TC-CRUD-003 | Should update item title successfully', async () => {
        const updatedTitle = `${testItem.title} - Updated`;

        await crudPage.editItem(testItem.title, { title: updatedTitle });

        // Verify updated item now appears
        const isUpdatedVisible = await crudPage.isItemVisible(updatedTitle);
        expect(isUpdatedVisible).toBe(true);

        // Old title should no longer be visible
        const isOldVisible = await crudPage.isItemVisible(testItem.title);
        expect(isOldVisible).toBe(false);

        // Update reference for delete test
        testItem.title = updatedTitle;
    });

    // ─────────────────────────────────────────────────────────────────────
    // 🗑️ TC-CRUD-004: Delete item
    // ─────────────────────────────────────────────────────────────────────
    it('TC-CRUD-004 | Should delete item successfully', async () => {
        await crudPage.deleteItem(testItem.title);

        // Verify item is removed from list
        const isStillVisible = await crudPage.isItemVisible(testItem.title);
        expect(isStillVisible).toBe(false);
        console.log(`✅ Item "${testItem.title}" deleted and no longer visible`);
    });

    // ─────────────────────────────────────────────────────────────────────
    // ➕ TC-CRUD-005: Create multiple items with Faker data
    // ─────────────────────────────────────────────────────────────────────
    it('TC-CRUD-005 | Should create multiple items with random data', async () => {
        const items = [generateItem(), generateItem(), generateItem()];

        for (const item of items) {
            await crudPage.createItem({
                title: item.title,
                description: item.description,
            });
        }

        // Verify all items appear
        for (const item of items) {
            const isVisible = await crudPage.isItemVisible(item.title);
            expect(isVisible).toBe(true);
        }

        // Cleanup: delete all created items
        for (const item of items) {
            await crudPage.deleteItem(item.title);
        }
    });

    // ─────────────────────────────────────────────────────────────────────
    // ⚠️ TC-CRUD-006: Create item with empty title shows validation
    // ─────────────────────────────────────────────────────────────────────
    it('TC-CRUD-006 | Should show validation error for empty title', async () => {
        await crudPage.tapAdd();
        // Skip entering title
        await crudPage.clearAndType('~item-description-input', 'Some description');
        await crudPage.tapSave();

        // Should show validation error
        const validationError = await crudPage.isDisplayed('~title-error');
        expect(validationError).toBe(true);

        // Cancel and return to list
        await crudPage.tap('~cancel-button');
        await crudPage.waitForListScreen();
    });

    // ─────────────────────────────────────────────────────────────────────
    // ❌ TC-CRUD-007: Cancel delete confirmation
    // ─────────────────────────────────────────────────────────────────────
    it('TC-CRUD-007 | Should cancel delete and keep item in list', async () => {
        const cancelTestItem = generateItem();

        // Create a temporary item
        await crudPage.createItem({ title: cancelTestItem.title });

        // Start delete flow but cancel
        await crudPage.tapItem(cancelTestItem.title);
        await crudPage.tapDelete();
        await crudPage.cancelDelete();

        // Navigate back to list
        await crudPage.pressBack();
        await crudPage.waitForListScreen();

        // Verify item is still there
        const isStillVisible = await crudPage.isItemVisible(cancelTestItem.title);
        expect(isStillVisible).toBe(true);

        // Cleanup
        await crudPage.deleteItem(cancelTestItem.title);
    });

    // ─────────────────────────────────────────────────────────────────────
    // 🔍 TC-CRUD-008: Search for an item
    // ─────────────────────────────────────────────────────────────────────
    it('TC-CRUD-008 | Should search and find an existing item', async () => {
        const searchItem = generateItem();
        await crudPage.createItem({ title: searchItem.title });

        // Search for created item
        await crudPage.tap('~search-field');
        await crudPage.typeText('~search-field', searchItem.title.substring(0, 5));
        await crudPage.pause(500);

        const isVisible = await crudPage.isItemVisible(searchItem.title);
        expect(isVisible).toBe(true);

        // Clear search and cleanup
        await crudPage.clearAndType('~search-field', '');
        await crudPage.hideKeyboard();
        await crudPage.deleteItem(searchItem.title);
    });
});
