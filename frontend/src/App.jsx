import React from 'react';

import {
  BrowserRouter,
  Route,
  Routes,
} from 'react-router-dom';

import Comments from './components/Comments';
import KanbanBoard from './components/KanbanBoard';
import Login from './components/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/kanbanboard' element={<KanbanBoard />} />
          <Route path='/comments/:category/:id' element={<Comments />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
