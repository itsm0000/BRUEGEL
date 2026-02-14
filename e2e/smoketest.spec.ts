import { test, expect } from '@playwright/test';

test.describe('Critical User Journeys', () => {
    test('CUJ-01: The First Steps & Persistence', async ({ page }) => {
        // 1. Open App
        await page.goto('/');

        // Check key elements
        // The header text is "BRUEGEL"
        await expect(page.locator('h1:has-text("BRUEGEL")')).toBeVisible({ timeout: 10000 });

        // Check Level 1 Node
        // Level 1 title is "First Steps"
        await expect(page.locator('text=First Steps')).toBeVisible({ timeout: 10000 });

        // 2. Click Level 1 to start
        // The "First Steps" text is inside the button for the level node.
        const levelNode = page.locator('button', { hasText: 'First Steps' });
        await levelNode.click();

        // Verify Canvas presence
        // There are multiple canvases (ghost path and drawing layer). 
        // We check for the interactive drawing canvas which has 'cursor-crosshair' class.
        await expect(page.locator('canvas.cursor-crosshair')).toBeVisible({ timeout: 10000 });
    });
});
