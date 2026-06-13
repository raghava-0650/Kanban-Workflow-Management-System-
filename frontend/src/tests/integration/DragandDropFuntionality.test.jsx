// @vitest-environment jsdom
import React from 'react';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';

import Column from '../../components/Column';
import { socket } from '../../socket/socket';

vi.mock('../../socket/socket', () => ({
  socket: { emit: vi.fn() },
}));

const makeTask = (overrides = {}) => ({
  id: 1,
  title: 'Task 1',
  description: '',
  status: 'todo',
  priority: 'High',
  category: 'Feature',
  attachments: [],
  ...overrides,
});

const renderBoard = ({ todoTasks = [], inProgressTasks = [], doneTasks = [] } = {}) => {
  return render(
    <DndProvider backend={HTML5Backend}>
      <Column title="To Do"       status="todo"       tasks={todoTasks}       onUpload={vi.fn()} />
      <Column title="In Progress" status="inprogress" tasks={inProgressTasks} onUpload={vi.fn()} />
      <Column title="Done"        status="done"       tasks={doneTasks}       onUpload={vi.fn()} />
    </DndProvider>
  );
};

const drag = (source, target) => {
  fireEvent.dragStart(source, { dataTransfer: { setData: vi.fn() } });
  fireEvent.dragEnter(target);
  fireEvent.dragOver(target);
  fireEvent.drop(target);
  fireEvent.dragEnd(source);
};

describe('Drag and Drop Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('emits task:move when a task is dropped onto a different column', async () => {
    renderBoard({ todoTasks: [makeTask()] });
 
    const draggable     = screen.getByDisplayValue('Task 1').closest('[draggable="true"]');
    const inProgressCol = screen.getByText('In Progress').closest('.column');
 
    drag(draggable, inProgressCol);
 
    await waitFor(() => {
      expect(socket.emit).toHaveBeenCalledWith('task:move', {
        taskId: 1,
        newStatus: 'inprogress',
      });
    })
  });


  it('emits task:move with newStatus "done" when dropped on Done column', async () => {
    renderBoard({ todoTasks: [makeTask()] });
 
    const draggable = screen.getByDisplayValue('Task 1').closest('[draggable="true"]');
    const doneCol   = screen.getByText('Done').closest('.column');
 
    drag(draggable, doneCol);
 
    await waitFor(() => {
      expect(socket.emit).toHaveBeenCalledWith('task:move', {
        taskId: 1,
        newStatus: 'done',
      });
    });
  });


  it('emits task:move with newStatus "todo" when dropped back to To Do', async () => {
    renderBoard({ inProgressTasks: [makeTask({ status: 'inprogress' })] });
 
    const draggable = screen.getByDisplayValue('Task 1').closest('[draggable="true"]');
    const todoCol   = screen.getByText('To Do').closest('.column');
 
    drag(draggable, todoCol);
 
    await waitFor(() => {
      expect(socket.emit).toHaveBeenCalledWith('task:move', {
        taskId: 1,
        newStatus: 'todo',
      });
    });
  });

  it('does NOT emit task:move when drag is cancelled without a drop', async () => {
    renderBoard({ todoTasks: [makeTask()] });
 
    const draggable = screen.getByDisplayValue('Task 1').closest('[draggable="true"]');
 
    fireEvent.dragStart(draggable);
    fireEvent.dragEnd(draggable); // released without dropping on any column
 
    await new Promise((r) => setTimeout(r, 50));
    expect(socket.emit).not.toHaveBeenCalledWith('task:move', expect.anything());
  });


  it('emits the correct taskId when second of two tasks is dragged', async () => {
    renderBoard({
      todoTasks: [
        makeTask({ id: 1, title: 'Task 1' }),
        makeTask({ id: 2, title: 'Task 2' }),
      ],
    });
 
    // Drag Task 2, not Task 1
    const draggable     = screen.getByDisplayValue('Task 2').closest('[draggable="true"]');
    const inProgressCol = screen.getByText('In Progress').closest('.column');
 
    drag(draggable, inProgressCol);
 
    await waitFor(() => {
      expect(socket.emit).toHaveBeenCalledWith('task:move', {
        taskId: 2,           // ← must be Task 2's id, not Task 1's
        newStatus: 'inprogress',
      });
    });
  });


  it('does NOT emit task:move for the task that was NOT dragged', async () => {
    renderBoard({
      todoTasks: [
        makeTask({ id: 1, title: 'Task 1' }),
        makeTask({ id: 2, title: 'Task 2' }),
      ],
    });
 
    const draggable     = screen.getByDisplayValue('Task 2').closest('[draggable="true"]');
    const inProgressCol = screen.getByText('In Progress').closest('.column');
 
    drag(draggable, inProgressCol);
 
    await new Promise((r) => setTimeout(r, 50));
    expect(socket.emit).not.toHaveBeenCalledWith('task:move', {
      taskId: 1,            // Task 1 should NOT have been moved
      newStatus: 'inprogress',
    });
  });
 

  // ── Empty column ────────────────────────────────────────────────────────────
 
  it('empty column shows drop hint and still accepts a drop', async () => {
    renderBoard({ todoTasks: [makeTask()] });
 
    expect(screen.getAllByText('Drop tasks here').length).toBeGreaterThanOrEqual(1);
 
    const draggable = screen.getByDisplayValue('Task 1').closest('[draggable="true"]');
    const doneCol   = screen.getByText('Done').closest('.column');
 
    drag(draggable, doneCol);
 
    await waitFor(() => {
      expect(socket.emit).toHaveBeenCalledWith('task:move', {
        taskId: 1,
        newStatus: 'done',
      });
    });
  });
 

  // ── Visual hover state ──────────────────────────────────────────────────────
 
  it('applies column-hover class to target column during dragover', () => {
    renderBoard({ todoTasks: [makeTask()] });
 
    const draggable     = screen.getByDisplayValue('Task 1').closest('[draggable="true"]');
    const inProgressCol = screen.getByText('In Progress').closest('.column');
 
    fireEvent.dragStart(draggable);
    fireEvent.dragEnter(inProgressCol);
    fireEvent.dragOver(inProgressCol);
 
    expect(inProgressCol).toHaveClass('column-hover');
  });

});