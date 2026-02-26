import { BasePage } from './BasePage';

/**
 * CrudPage - Page Object for Create/Read/Update/Delete screen.
 * Represents a list + form screen for managing items (tasks, products, etc.)
 */
export class CrudPage extends BasePage {
    // ── List Screen Locators ───────────────────────────────────────────────
    private get itemListContainer() { return this.byAccessibilityId('item-list'); }
    private get addButton() { return this.byAccessibilityId('add-button'); }
    private get emptyStateMessage() { return this.byAccessibilityId('empty-state'); }
    private get searchField() { return this.byAccessibilityId('search-field'); }
    private get filterButton() { return this.byAccessibilityId('filter-button'); }

    // ── Form Screen Locators ───────────────────────────────────────────────
    private get titleField() { return this.byAccessibilityId('item-title-input'); }
    private get descriptionField() { return this.byAccessibilityId('item-description-input'); }
    private get categoryPicker() { return this.byAccessibilityId('category-picker'); }
    private get saveButton() { return this.byAccessibilityId('save-button'); }
    private get cancelButton() { return this.byAccessibilityId('cancel-button'); }

    // ── Item Action Locators ───────────────────────────────────────────────
    private get editButton() { return this.byAccessibilityId('edit-button'); }
    private get deleteButton() { return this.byAccessibilityId('delete-button'); }
    private get confirmDeleteBtn() { return this.byAccessibilityId('confirm-delete'); }
    private get cancelDeleteBtn() { return this.byAccessibilityId('cancel-delete'); }

    // ── Dynamic Locators ──────────────────────────────────────────────────

    /** Get a list item by its text */
    private itemByTitle(title: string): string {
        return this.byXPath(`//*[@text="${title}"]`);
    }

    /** Get item by index in list */
    private itemByIndex(index: number): string {
        return this.byXPath(`//android.widget.RecyclerView/android.view.ViewGroup[${index}]`);
    }

    /** Get edit button for a specific item */
    private editButtonForItem(title: string): string {
        return this.byXPath(`//*[@text="${title}"]/following-sibling::*[@content-desc="edit-button"]`);
    }

    /** Get delete button for a specific item */
    private deleteButtonForItem(title: string): string {
        return this.byXPath(`//*[@text="${title}"]/following-sibling::*[@content-desc="delete-button"]`);
    }

    // ── Page State ─────────────────────────────────────────────────────────

    async isLoaded(): Promise<boolean> {
        return await this.isDisplayed(this.addButton);
    }

    async waitForListScreen(timeout: number = 10000): Promise<void> {
        await this.waitForVisible(this.addButton, timeout);
        console.log('📋 CRUD list screen loaded');
    }

    // ── CREATE ─────────────────────────────────────────────────────────────

    /**
     * Tap the Add / "+" button to open the create form
     */
    async tapAdd(): Promise<void> {
        await this.tap(this.addButton);
        console.log('➕ Tapped Add button');
    }

    /**
     * Fill the create/edit form with title and description
     */
    async fillForm(data: { title: string; description?: string; category?: string }): Promise<void> {
        console.log(`📝 Filling form: ${JSON.stringify(data)}`);
        await this.clearAndType(this.titleField, data.title);

        if (data.description) {
            await this.clearAndType(this.descriptionField, data.description);
        }

        if (data.category) {
            await this.tap(this.categoryPicker);
            await this.tap(this.byAccessibilityId(data.category));
        }

        await this.hideKeyboard();
    }

    /**
     * Tap Save button to submit the form
     */
    async tapSave(): Promise<void> {
        await this.tap(this.saveButton);
        console.log('💾 Tapped Save button');
    }

    /**
     * Create a new item end-to-end: tap add → fill form → save
     */
    async createItem(data: { title: string; description?: string; category?: string }): Promise<void> {
        await this.tapAdd();
        await this.fillForm(data);
        await this.tapSave();
        // Wait for list to reload
        await this.waitForListScreen();
        console.log(`✅ Item created: "${data.title}"`);
    }

    // ── READ ───────────────────────────────────────────────────────────────

    /**
     * Check if item with given title is visible in the list
     */
    async isItemVisible(title: string): Promise<boolean> {
        return await this.isDisplayed(this.itemByTitle(title));
    }

    /**
     * Get text of an item by its position in the list (1-based index)
     */
    async getItemText(index: number = 1): Promise<string> {
        return await this.getText(this.itemByIndex(index));
    }

    /**
     * Get all item titles currently visible in the list
     */
    async getAllItemTitles(): Promise<string[]> {
        const elements = await $$(this.byXPath('//android.widget.RecyclerView/android.view.ViewGroup'));
        const texts: string[] = [];
        for (const el of elements) {
            texts.push(await el.getText());
        }
        return texts;
    }

    /**
     * Is the empty state (no items) message visible?
     */
    async isEmptyStateVisible(): Promise<boolean> {
        return await this.isDisplayed(this.emptyStateMessage);
    }

    /**
     * Tap an item by title to open its detail view
     */
    async tapItem(title: string): Promise<void> {
        await this.tap(this.itemByTitle(title));
    }

    // ── UPDATE ─────────────────────────────────────────────────────────────

    /**
     * Tap edit button (assumes item detail screen is open)
     */
    async tapEdit(): Promise<void> {
        await this.tap(this.editButton);
        console.log('✏️ Tapped Edit button');
    }

    /**
     * Edit an item by title: long press → edit → fill form → save
     */
    async editItem(
        originalTitle: string,
        newData: { title?: string; description?: string }
    ): Promise<void> {
        console.log(`✏️ Editing item: "${originalTitle}"`);
        // Open item
        await this.tapItem(originalTitle);
        await this.tap(this.editButton);
        // Update fields
        if (newData.title) {
            await this.clearAndType(this.titleField, newData.title);
        }
        if (newData.description) {
            await this.clearAndType(this.descriptionField, newData.description);
        }
        await this.tapSave();
        await this.waitForListScreen();
        console.log(`✅ Item updated to: "${newData.title || originalTitle}"`);
    }

    // ── DELETE ─────────────────────────────────────────────────────────────

    /**
     * Tap delete on currently open item detail
     */
    async tapDelete(): Promise<void> {
        await this.tap(this.deleteButton);
        console.log('🗑️ Tapped Delete button');
    }

    /**
     * Confirm delete in the confirmation dialog
     */
    async confirmDelete(): Promise<void> {
        await this.tap(this.confirmDeleteBtn);
        console.log('✅ Delete confirmed');
    }

    /**
     * Cancel delete in the confirmation dialog
     */
    async cancelDelete(): Promise<void> {
        await this.tap(this.cancelDeleteBtn);
    }

    /**
     * Delete an item end-to-end: open → delete → confirm
     */
    async deleteItem(title: string): Promise<void> {
        console.log(`🗑️ Deleting item: "${title}"`);
        await this.tapItem(title);
        await this.tapDelete();
        await this.confirmDelete();
        await this.waitForListScreen();
        console.log(`✅ Item deleted: "${title}"`);
    }

    /**
     * Swipe left on list item to reveal delete option (if swipe-to-delete is supported)
     */
    async swipeToDelete(title: string): Promise<void> {
        const item = await $(this.itemByTitle(title));
        const location = await item.getLocation();
        const size = await item.getSize();
        await driver.touchAction([
            { action: 'press', x: location.x + size.width * 0.8, y: location.y + size.height / 2 },
            { action: 'wait', ms: 300 },
            { action: 'moveTo', x: location.x + size.width * 0.1, y: location.y + size.height / 2 },
            { action: 'release' },
        ]);
    }
}
