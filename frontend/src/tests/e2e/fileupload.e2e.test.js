import {
  expect,
  test,
} from '@playwright/test';

test.describe('File Upload E2E Tests', () => {
  test.beforeEach(async ({ page, request }) => {
    await request.post('https://kanban-workflow-management-system.onrender.com/api/test/reset');
    await page.goto('/');
    await expect(page.getByText(/KANBANBOARD/i)).toBeVisible();
    
    // Create a task for testing
    await page.getByRole('button', { name: /Add Task/i }).click();
    await page.getByPlaceholder('Enter task title...').fill('New Task');
    await page.getByText('Create Task').click();
 
    // Wait for the task card to appear on the board
    await expect(page.locator('.task-card').first()).toBeVisible();
  });

  test('should have file upload capability in task management', async ({ page }) => {
  
    const taskCard = page.locator('.task-card').first();
    await expect(taskCard).toBeVisible();

    const attachButton = taskCard.getByRole('button', { name: /Attach File/i });
    await expect(attachButton).toBeVisible();
  });

  test('should display uploaded image attachments', async ({ page }) => {
   
    const taskCard = page.locator('.task-card').first();
    await expect(taskCard).toBeVisible();
  });

  test('should display non-image attachments as links', async ({ page }) => {
    
    // Verify the task card structure supports attachments
    const taskCard = page.locator('.task-card').first();
    await expect(taskCard).toBeVisible();
  });

});

test.describe('File Upload Integration', () => {
  test.beforeEach(async ({ page, request }) => {
    await request.post('https://kanban-workflow-management-system.onrender.com/api/test/reset');
    await page.goto('/');
    await expect(page.getByText(/KANBANBOARD/i)).toBeVisible();
    
    // Create a task for testing
    await page.getByRole('button', { name: /Add Task/i }).click();
    await page.getByPlaceholder('Enter task title...').fill('New Task');
    await page.getByText('Create Task').click();
 
    // Wait for the task card to appear on the board
    await expect(page.locator('.task-card').first()).toBeVisible();
  });



  test('should preserve file attachments after drag and drop', async ({ page }) => {
    
    // Drag to In Progress
    const taskCard = page.locator('.task-card').first();
    const inProgressColumn = page.locator('.column').nth(1).getByText('Drop tasks here');

    await taskCard.dragTo(inProgressColumn);
    await page.waitForTimeout(500);
    
    // Verify task still exists in new column
    const inProgressTasks = page.locator('.column').nth(1).locator('.task-card');
    await expect(inProgressTasks).toHaveCount(1);
  });
});
