// src/tests/utils/renderWithDnd.jsx
import React from 'react';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { render } from '@testing-library/react';

export function renderWithDnd(ui) {
  return render(
    <DndProvider backend={HTML5Backend}>
      {ui}
    </DndProvider>
  );
}