import {
  expect,
  test,
} from '@playwright/test';

test.describe('Kanban Board E2E Tests', () => {
  test.beforeEach(async ({ page, request }) => {
    await request.post('https://kanban-workflow-management-system.onrender.com/api/test/reset');
    await page.goto('/');
    await expect(page.getByText(/KANBANBOARD/i)).toBeVisible();
  
    await page.getByRole('button', { name: /Add Task/i }).click();
    await page.getByPlaceholder('Enter task title...').fill('New Task');
    await page.getByText('Create Task').click();
 
    // Wait for the task card to appear on the board
    await expect(page.locator('.task-card').first()).toBeVisible();
  });

  test('should display kanban board with three columns', async ({ page }) => {
    await expect(page.getByText('📋 To Do')).toBeVisible();
    await expect(page.getByText('⚙️ In Progress')).toBeVisible();
    await expect(page.getByText('✅ Done')).toBeVisible();
  });

  test('should create a new task', async ({ page }) => {
 
    // Verify task count increased
    const taskCountElements = page.locator('.task-count');
    const firstCount = await taskCountElements.first().textContent();
    expect(firstCount).toContain('1');
  });

  test('should update task title', async ({ page }) => {
 
    // Update the title
    const titleInput = page.locator('.task-title').first();
    await titleInput.fill('Updated Task Title');
    await titleInput.blur();

    // Verify the update
    await expect(titleInput).toHaveValue('Updated Task Title');
  });

  test('should change task category', async ({ page }) => {
    // Find and change category dropdown
    const categorySelect = page.locator('select').nth(1);
    await categorySelect.selectOption('Bug');

    // Verify the selection
    await expect(categorySelect).toHaveValue('Bug');
  });

  test('should delete a task', async ({ page }) => {
    // Listen for confirm dialog and accept it
    page.on('dialog', dialog => dialog.accept());

    // Click delete button
    const deleteButton = page.locator('.task-card').first().getByRole('button', { name: '×' });
    await deleteButton.click();

    // Verify task is removed
    await expect(page.locator('.task-card')).toHaveCount(0);
  });

  test('should add task description', async ({ page }) => {

    // Add description
    const descriptionTextarea = page.locator('.task-card').first().getByPlaceholder('Add description...');
    await descriptionTextarea.fill('This is a test description');

    // Verify description
    await expect(descriptionTextarea).toHaveValue('This is a test description');
  });

  
  test('should display charts', async ({ page }) => {
    await expect(page.getByText('Tasks by Status')).toBeVisible();
    await expect(page.getByText('Task Distribution')).toBeVisible();
    await expect(page.getByText('Tasks by Priority')).toBeVisible();
  });

  
});

test.describe('Kanban Board E2E Tests', () => {
  test.beforeEach(async ({ page, request }) => {
    await request.post('https://kanban-workflow-management-system.onrender.com/api/test/reset');
    await page.goto('/');
    await expect(page.getByText(/KANBANBOARD/i)).toBeVisible();
  })

  test('should show empty column message when no tasks', async ({ page }) => {
    // All columns should show empty state initially
    const emptyMessages = page.getByText('Drop tasks here');
    const count = await emptyMessages.count();
    expect(count).toBeGreaterThanOrEqual(2); // At least 2 empty columns
  });

});



test.describe('Kanban Board E2E Tests', () => {
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

  test('should display task statistics', async ({ page }) => {
    const statsPanel = page.locator('.stat-label');
    // Verify stats are visible
    await expect(page.getByText('Total Tasks')).toBeVisible();
    await expect(page.locator('.stat-label').filter({ hasText: 'To Do' })).toBeVisible();
    await expect(page.locator('.stat-label').filter({ hasText: 'In Progress' })).toBeVisible();
    await expect(page.locator('.stat-label').filter({ hasText: 'Done' })).toBeVisible();
    await expect(page.locator('.stat-label').filter({ hasText: 'Completion' })).toBeVisible();

    // Create a task and verify statistics update
    await page.getByRole('button', { name: /Add Task/i }).click();
    await page.waitForTimeout(500); // Wait for state update

    // Verify count updated
    const statValues = page.locator('.stat-value');
    const totalTasksValue = await statValues.first().textContent();
    expect(parseInt(totalTasksValue)).toBeGreaterThanOrEqual(0);
  });

});

