import React from 'react';

import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  act,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';

import KanbanBoard from '../../components/KanbanBoard';
import { socket } from '../../socket/socket';

const mockTask = {
  id: 1,
  title: 'Test Task',
  description: 'Test description',
  status: 'todo',
  priority: 'High',
  category: 'Feature',
  attachments: [],
};
const renderWithTask = () => {
  render(<KanbanBoard />);

  const syncHandler = socket.on.mock.calls.find(
    ([event]) => event === 'sync:tasks'
  )[1];

  act(() => syncHandler([mockTask]));
};
// TODO: Add more unit tests for individual components
describe('KanbanBoard', ()=>{
  beforeEach(()=>{
    vi.clearAllMocks();
  });

  it('renders all there columns', ()=>{
    render(<KanbanBoard />);

    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('opens add task modal when Add Task is clicked', () => {
    render(<KanbanBoard />);

    const addButton = screen.getByText(/Add Task/i);
    fireEvent.click(addButton);

    expect(screen.getByText(/create task/i)).toBeInTheDocument();

  });

  it('emits task:create when modal form is submitted', () => {
    render(<KanbanBoard />);

    // Open modal
    fireEvent.click(screen.getByText(/Add Task/i));

    // Fill and submit the modal form
    // ⚠️ these selectors depend on your AddTaskModal — share it and I'll fix these
    fireEvent.change(screen.getByPlaceholderText('Enter task title...'), {
      target: { value: 'New Task' },
    });
    fireEvent.click(screen.getByText('Create Task'));

    expect(socket.emit).toHaveBeenCalledWith('task:create', expect.objectContaining({
      title: 'New Task',
      description: '',
      status: 'todo',
      priority: 'Medium',
      category: 'Feature',
      attachments: [],
    }));
  });

  it('emits task:update when category is changed', () => {
    renderWithTask();
 
    fireEvent.change(screen.getByDisplayValue('Feature'), {
      target: { value: 'Bug' },
    });
 
    expect(socket.emit).toHaveBeenCalledWith('task:update', expect.objectContaining({
      id: 1,
      category: 'Bug',
    }));
  });


  it('emits task:delete when delete button is clicked', async () => {
    render(<KanbanBoard />);

    // Step 1 — push a task into the board via socket sync:tasks handler
    // because KanbanBoard has no tasks by default
    const syncHandler = socket.on.mock.calls.find(([event]) => event === 'sync:tasks')[1];
    act(() => {
      syncHandler([{
        id: 1,
        title: 'Test Task',
        description: '',
        status: 'todo',
        priority: 'High',
        category: 'Feature',
        attachments: []
      }]);
    });

    // Step 2 — mock the confirm dialog to auto-click OK
    window.confirm = vi.fn(() => true);

    // Step 3 — click the × delete button
    const deleteButton = screen.getByText('×');
    fireEvent.click(deleteButton);

    // Step 4 — assert socket emitted task:delete with the right id
    expect(socket.emit).toHaveBeenCalledWith('task:delete', 1);
  });
});


