// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';

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
  render,
  screen,
  waitFor,
} from '@testing-library/react';

import KanbanBoard from '../../components/KanbanBoard.jsx';
import { socket } from '../../socket/socket.js';

vi.mock('../../socket/socket', () => ({
  socket: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    connected: true,
  },
}));

// ─── Helper ──────────────────────────────────────────────────────────────────
// Grabs the callback KanbanBoard passed to socket.on(event, callback)
// and calls it directly — simulating the server broadcasting to this client
const getSocketHandler = (event) => {
  const call = socket.on.mock.calls.find(([e]) => e === event);
  if (!call) throw new Error(`No socket.on handler registered for "${event}"`);
  return call[1];
};

const serverBroadcast = (tasks) => {
  act(() => getSocketHandler('sync:tasks')(tasks));
};

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const task1 = { id: 1, title: 'Task One',   description: '', status: 'todo',       priority: 'High',   category: 'Feature', attachments: [] };
const task2 = { id: 2, title: 'Task Two',   description: '', status: 'inprogress', priority: 'Medium', category: 'Bug',     attachments: [] };
const task3 = { id: 3, title: 'Task Three', description: '', status: 'done',       priority: 'Low',    category: 'Feature', attachments: [] };

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('KanbanBoard Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Task appears after server sync ────────────────────────────────────────

  it('displays a newly created task after server broadcasts sync:tasks', async () => {
    render(<KanbanBoard />);

    // Initially no tasks
    expect(screen.queryByDisplayValue('Task One')).not.toBeInTheDocument();

    // Server broadcasts the new task to this client
    serverBroadcast([task1]);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Task One')).toBeInTheDocument();
    });
  });

  // ── Tasks appear in correct columns ──────────────────────────────────────

  it('places each task in its correct column based on status', async () => {
    render(<KanbanBoard />);

    serverBroadcast([task1, task2, task3]);

    await waitFor(() => {
      const todoCol       = screen.getByText('📋 To Do').closest('.column');
      const inProgressCol = screen.getByText('⚙️ In Progress').closest('.column');
      const doneCol       = screen.getByText('✅ Done').closest('.column');

      expect(todoCol).toContainElement(screen.getByDisplayValue('Task One'));
      expect(inProgressCol).toContainElement(screen.getByDisplayValue('Task Two'));
      expect(doneCol).toContainElement(screen.getByDisplayValue('Task Three'));
    });
  });

  // ── Task count updates ────────────────────────────────────────────────────

  it('updates task count in each column after sync', async () => {
    render(<KanbanBoard />);

    serverBroadcast([task1, task2, task3]);

    await waitFor(() => {
      const counts = document.querySelectorAll('.task-count');
      expect(counts[0].textContent).toBe('1'); // todo
      expect(counts[1].textContent).toBe('1'); // inprogress
      expect(counts[2].textContent).toBe('1'); // done
    });
  });

  // ── Task removed after delete broadcast ───────────────────────────────────

  it('removes a task from the board when server broadcasts deletion', async () => {
    render(<KanbanBoard />);

    // First add the task
    serverBroadcast([task1, task2]);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Task One')).toBeInTheDocument();
    });

    // Server broadcasts updated list without task1 (simulating delete)
    serverBroadcast([task2]);

    await waitFor(() => {
      expect(screen.queryByDisplayValue('Task One')).not.toBeInTheDocument();
      expect(screen.getByDisplayValue('Task Two')).toBeInTheDocument(); // task2 still there
    });
  });

  // ── Task count after delete ───────────────────────────────────────────────

  it('decreases task count after a task is removed', async () => {
    render(<KanbanBoard />);

    serverBroadcast([task1, { ...task1, id: 99, title: 'Extra Task' }]);

    await waitFor(() => {
      expect(document.querySelectorAll('.task-count')[0].textContent).toBe('2');
    });

    serverBroadcast([task1]); // one task removed

    await waitFor(() => {
      expect(document.querySelectorAll('.task-count')[0].textContent).toBe('1');
    });
  });

  // ── Task update reflected in UI ───────────────────────────────────────────

  it('reflects updated task title after server broadcasts update', async () => {
    render(<KanbanBoard />);

    serverBroadcast([task1]);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Task One')).toBeInTheDocument();
    });

    // Server broadcasts updated task with new title
    serverBroadcast([{ ...task1, title: 'Renamed Task' }]);

    await waitFor(() => {
      expect(screen.queryByDisplayValue('Task One')).not.toBeInTheDocument();
      expect(screen.getByDisplayValue('Renamed Task')).toBeInTheDocument();
    });
  });

  // ── Attachment appears after update broadcast ─────────────────────────────

  it('shows attachment after server broadcasts task with attachment', async () => {
    render(<KanbanBoard />);

    serverBroadcast([task1]);

    // Server broadcasts task with a new attachment added
    serverBroadcast([{
      ...task1,
      attachments: [{ name: 'design.pdf', url: '/uploads/design.pdf' }]
    }]);

    await waitFor(() => {
      expect(screen.getByText(/design\.pdf/i)).toBeInTheDocument();
    });
  });

  // ── No duplicates ─────────────────────────────────────────────────────────

  it('does not duplicate tasks when sync:tasks fires multiple times', async () => {
    render(<KanbanBoard />);

    serverBroadcast([task1]);
    serverBroadcast([task1]); // same data broadcast twice

    await waitFor(() => {
      // Should appear exactly once
      expect(screen.getAllByDisplayValue('Task One')).toHaveLength(1);
    });
  });

  // ── Empty state ───────────────────────────────────────────────────────────

  it('shows drop hint in all columns when task list is empty', async () => {
    render(<KanbanBoard />);

    serverBroadcast([]);

    await waitFor(() => {
      expect(screen.getAllByText('Drop tasks here')).toHaveLength(3);
    });
  });

  // ── Board clears ──────────────────────────────────────────────────────────

  it('clears all tasks from board when server broadcasts empty list', async () => {
    render(<KanbanBoard />);

    serverBroadcast([task1, task2, task3]);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Task One')).toBeInTheDocument();
    });

    serverBroadcast([]); // server clears everything

    await waitFor(() => {
      expect(screen.queryByDisplayValue('Task One')).not.toBeInTheDocument();
      expect(screen.queryByDisplayValue('Task Two')).not.toBeInTheDocument();
      expect(screen.queryByDisplayValue('Task Three')).not.toBeInTheDocument();
    });
  });
});