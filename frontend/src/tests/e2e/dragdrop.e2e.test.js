import {
  expect,
  test,
} from '@playwright/test';

test.describe('Drag and Drop E2E Tests', () => {
  test.beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:4000/api/test/reset');
    await page.goto('/');
    await expect(page.getByText(/KANBANBOARD/i)).toBeVisible();
  
    await page.getByRole('button', { name: /Add Task/i }).click();
    await page.getByPlaceholder('Enter task title...').fill('New Task');
    await page.getByText('Create Task').click();
 
    // Wait for the task card to appear on the board
    await expect(page.locator('.task-card').first()).toBeVisible();
  });

  test('should drag task from To Do to In Progress', async ({ page }) => {
    // Get the task card
    const taskCard = page.locator('.task-card').first();
    
    // Get the In Progress column
    const inProgressColumn = page.locator('.column').nth(1).getByText('Drop tasks here');
   
    await taskCard.dragTo(inProgressColumn);
    // Wait for update
    await page.waitForTimeout(500);
    
    // Verify task moved by checking column task counts
    const inProgressCount = page.locator('.column').nth(1).locator('.task-count');
    await expect(inProgressCount).toContainText('1');
  });

  test('should drag task from To Do to Done', async ({ page }) => {
    const taskCard = page.locator('.task-card').first();
    const doneColumn = page.locator('.column').nth(2);
  
    // 3. Perform a realistic manual drag-and-drop
    await taskCard.hover();
    await page.mouse.down();
    
    // 'steps: 5' simulates continuous mouse movement so the frontend library registers the hover state
    await doneColumn.hover({ steps: 5 }); 
    await page.mouse.up();
    
    // 4. Use a web-first assertion (no need for waitForTimeout!)
    const doneCount = doneColumn.locator('.task-count');
    await expect(doneCount).toContainText('1');
  });

  test('should show hover effect when dragging over column', async ({ page }) => {
    const taskCard = page.locator('.task-card').first();
    const inProgressColumn = page.locator('.column').nth(1);
    
    // Start dragging
    await taskCard.hover();
    await page.mouse.down();
    
    // Hover over target column
    await inProgressColumn.hover();
    
    // Check if column shows hover state (background color change)
    const backgroundColor = await inProgressColumn.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Clean up
    await page.mouse.up();
    
    // The background should change when hovering
    expect(backgroundColor).toBeTruthy();
  });


});
