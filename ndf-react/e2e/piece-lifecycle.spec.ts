import { test, expect } from '@playwright/test';

test.describe('Piece Lifecycle E2E', () => {
  test('creates a piece, views it, and edits its content', async ({ page }) => {
    // Fail the test if there are any uncaught exceptions or runtime errors in the browser console
    page.on('pageerror', (exception) => {
      throw new Error(`Uncaught browser exception: ${exception.stack || exception.message}`);
    });

    // 1. Visit home page
    await page.goto('/');

    // Wait for the works heading or container to appear
    await expect(page.locator('span:has-text("Obras"), span:has-text("Works"), h1:has-text("Works")').first()).toBeVisible();

    // 2. Open the Create modal by clicking the "New work" button (supports desktop icon title and mobile visible text)
    const newWorkButton = page.locator('button[title*="Obra"], button[title*="Work"], button:has-text("Obra"), button:has-text("Work")').first();
    await newWorkButton.click();

    // Scope form selectors to the modal form to prevent matching background elements
    const modalForm = page.locator('form').first();

    // 3. Fill in the modal inputs
    const titleInput = modalForm.locator('input[placeholder*="título"], input[placeholder*="title"]').first();
    await titleInput.fill('E2E Test Piece');
    
    // Choose "poem" type inside the form
    const poemBtn = modalForm.locator('button:has-text("Poema"), button:has-text("Poem")').first();
    await poemBtn.click();

    // Click "Crear" or "Create" inside the form
    const createSubmitBtn = modalForm.locator('button[type="submit"]').first();
    await createSubmitBtn.click();

    // 4. Verify redirect and display in work view page
    await expect(page).toHaveURL(/\/work\/.+/);
    await expect(page.locator('h1')).toContainText('E2E Test Piece');

    // 5. Verify we are already in editing mode after creation
    await expect(page.locator('.editing-view')).toBeVisible();

    // Clear content and write new structured content in Tiptap
    const editor = page.locator('.ProseMirror');
    await editor.click();
    await page.keyboard.type('Hello, this is persistent E2E text!');

    // Wait for text to be typed and present in editor
    await expect(editor).toContainText('Hello, this is persistent E2E text!');

    // Click "Finish Editing" or "Terminar Edición" to switch back to visualization mode
    const finishBtn = page.locator('button:has-text("Terminar Edición"), button:has-text("Finish Editing")').first();
    await finishBtn.click();

    // Verify redirect/transition to visualization mode is finished and content is visible
    await expect(page.locator('.visualization-view')).toBeVisible();
    await expect(page.locator('.visualization-view')).toContainText('Hello, this is persistent E2E text!');

    // Programmatically select text in visualization mode to trigger annotation toolbar
    await page.evaluate(() => {
      const element = document.querySelector('.visualization-view span, .visualization-view p');
      if (element) {
        const range = document.createRange();
        const textNode = element.firstChild;
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
          range.setStart(textNode, 0);
          range.setEnd(textNode, 10);
        } else {
          range.selectNodeContents(element);
        }
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
      document.dispatchEvent(new Event('selectionchange'));
    });

    // Verify visualization selection toolbar is visible with annotation kinds + Refine
    const vizToolbar = page.locator('.visualization-selection-toolbar');
    await expect(vizToolbar.locator('button[title="Intención"], button[title="Intent"]')).toBeVisible();
    await expect(vizToolbar.locator('button[title="Comentario"], button[title="Comment"]')).toBeVisible();
    await expect(vizToolbar.locator('button[title="Respiración"], button[title="Breath"]')).toBeVisible();

    const refineBtnViz = vizToolbar.locator('button:has-text("Ajustar"), button:has-text("Refine")').first();
    await expect(refineBtnViz).toBeVisible();

    // Open refinement modal from visualization view selection toolbar
    await refineBtnViz.click();
    
    const modalHeading = page.locator('h2:has-text("Ajustar Selección"), h2:has-text("Refine Selection")');
    await expect(modalHeading).toBeVisible();

    // Close the modal
    const cancelBtn = page.locator('button:has-text("Cancelar"), button:has-text("Cancel")').first();
    await cancelBtn.click();
    await expect(modalHeading).not.toBeVisible();

    // 6. Enter editing mode manually from visualization mode
    const editBtn = page.locator('button:has-text("Editar"), button:has-text("Edit Piece")').first();
    await editBtn.click();

    // Verify we are back in editing mode
    await expect(page.locator('.editing-view')).toBeVisible();

    // Select text in editor to trigger formatting BubbleMenu via programmatic selection
    await page.evaluate(() => {
      const paragraph = document.querySelector('.ProseMirror p, .ProseMirror div');
      if (paragraph) {
        const range = document.createRange();
        const textNode = paragraph.firstChild;
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
          range.setStart(textNode, 0);
          range.setEnd(textNode, 10);
        } else {
          range.selectNodeContents(paragraph);
        }
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    });

    // Verify formatting options are visible in the sidebar toolbar
    await expect(page.locator('button[title="Bold"]')).toBeVisible();
    await expect(page.locator('button[title="Italic"]')).toBeVisible();
    await expect(page.locator('button[title="Underline"]')).toBeVisible();

    // Click Finish Editing to return to visualization mode
    await finishBtn.click();
    await expect(page.locator('.visualization-view')).toBeVisible();

    // 7. Go back to main list
    const backBtn = page.locator('button:has-text("Obras"), button:has-text("Works")').first();
    await backBtn.click();

    // Verify redirect to list
    await expect(page).toHaveURL(/\/$/);

    // 8. Verify the new piece appears in the list and preview pane displays the typed text
    const pieceListItem = page.locator('button:has-text("E2E Test Piece"), a:has-text("E2E Test Piece")').first();
    await expect(pieceListItem).toBeVisible();
    await pieceListItem.click();

    // Verify the preview pane (on desktop) shows the edited text
    await expect(page.locator('main')).toContainText('Hello, this is persistent E2E text!');
  });

  test('displays mobile responsive bottom toolbar on small viewports', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Fail the test if there are any uncaught exceptions or runtime errors in the browser console
    page.on('pageerror', (exception) => {
      throw new Error(`Uncaught browser exception: ${exception.stack || exception.message}`);
    });

    // 1. Visit home page
    await page.goto('/');

    // 2. Open the Create modal by clicking the "New work" button
    const newWorkButton = page.locator('button:has-text("Obra"), button:has-text("Work"), button[title*="Work"]').first();
    await newWorkButton.click();

    // 3. Fill in the modal inputs
    const modalForm = page.locator('form').first();
    const titleInput = modalForm.locator('input[placeholder*="título"], input[placeholder*="title"]').first();
    await titleInput.fill('Mobile Test Piece');
    
    const poemBtn = modalForm.locator('button:has-text("Poema"), button:has-text("Poem")').first();
    await poemBtn.click();

    const createSubmitBtn = modalForm.locator('button[type="submit"]').first();
    await createSubmitBtn.click();

    // 4. Verify we are in editing mode
    await expect(page).toHaveURL(/\/work\/.+/);
    await expect(page.locator('.editing-view')).toBeVisible();

    // Fill editor content
    const editor = page.locator('.ProseMirror');
    await editor.click();
    await page.keyboard.type('Hello Mobile selection toolbar!');

    // Wait for text to be typed and present in editor
    await expect(editor).toContainText('Hello Mobile selection toolbar!');

    // Select text in editor to trigger formatting BubbleMenu via programmatic selection
    await page.evaluate(() => {
      const paragraph = document.querySelector('.ProseMirror p, .ProseMirror div');
      if (paragraph) {
        const range = document.createRange();
        const textNode = paragraph.firstChild;
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
          range.setStart(textNode, 0);
          range.setEnd(textNode, 10);
        } else {
          range.selectNodeContents(paragraph);
        }
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    });

    // Verify formatting options are visible in the sidebar toolbar
    await expect(page.locator('button[title="Bold"]')).toBeVisible();
    await expect(page.locator('button[title="Italic"]')).toBeVisible();
    await expect(page.locator('button[title="Underline"]')).toBeVisible();

    // Switch to visualization mode
    const finishBtn = page.locator('button:has-text("Terminar Edición"), button:has-text("Finish Editing")').first();
    await finishBtn.click();

    await expect(page.locator('.visualization-view')).toBeVisible();

    // Programmatically select text in visualization mode to trigger annotation toolbar
    await page.evaluate(() => {
      const element = document.querySelector('.visualization-view span, .visualization-view p');
      if (element) {
        const range = document.createRange();
        const textNode = element.firstChild;
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
          range.setStart(textNode, 0);
          range.setEnd(textNode, 10);
        } else {
          range.selectNodeContents(element);
        }
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
      document.dispatchEvent(new Event('selectionchange'));
    });

    // Verify visualization selection toolbar is rendered at the bottom (fixed bottom bar)
    const mobileVizToolbar = page.locator('.visualization-selection-toolbar.fixed');
    await expect(mobileVizToolbar).toBeVisible();
  });
});
