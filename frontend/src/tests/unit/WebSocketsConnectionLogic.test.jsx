import React from 'react';

import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  fireEvent,
  screen,
} from '@testing-library/react';

import TaskCard from '../../components/TaskCard';
import { socket } from '../../socket/socket';
import { renderWithDnd } from '../utils/renderWithDnd';

const mockTask = {
  id: 1,
  title: 'Test Task',        // ← getByDisplayValue('Test Task')
  description: 'Test description',
  status: 'todo',
  priority: 'High',          // ← getByDisplayValue('High')
  category: 'Feature',       // ← getByDisplayValue('Feature')
  attachments: [],
};


// TODO: Add more unit tests for individual components
describe('KanbanBoard', ()=>{
  beforeEach(()=>{
    vi.clearAllMocks();
  });


  it('calls socket.emit when priority changes', () => {
      renderWithDnd(<TaskCard task={mockTask} />);

      const prioritySelect = screen.getByDisplayValue('High');
      fireEvent.change(prioritySelect, { target: { value: 'Low' } });

      expect(socket.emit).toHaveBeenCalledWith('task:update', {
          ...mockTask,
          priority: 'Low'
      });
  });

  it('calls socket.emit when category changes', () => {
      renderWithDnd(<TaskCard task={mockTask} />);
      
      const categorySelect = screen.getByDisplayValue('Feature');
      fireEvent.change(categorySelect, { target: { value: 'Bug' } });
      
      expect(socket.emit).toHaveBeenCalledWith('task:update', {
      ...mockTask,
      category: 'Bug'
      });
  });

  it('calls socket.emit when title changes', () => {
      renderWithDnd(<TaskCard task={mockTask} />);

      const titleInput = screen.getByDisplayValue('Test Task');
      fireEvent.change(titleInput, { target: { value: 'Updated Task' } });

      expect(socket.emit).toHaveBeenCalledWith('task:update', {
      ...mockTask,
          title: 'Updated Task'
      });
  });

  it('calls socket.emit when delete button is clicked', () => {
      // Mock window.confirm
      window.confirm = vi.fn(() => true);

      renderWithDnd(<TaskCard task={mockTask} />);

      const deleteButton = screen.getByText('×');
      fireEvent.click(deleteButton);

      expect(socket.emit).toHaveBeenCalledWith('task:delete', mockTask.id);
  });

});


