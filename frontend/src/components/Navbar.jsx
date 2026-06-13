import './Navbar.css';

import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

export default function Navbar({ 
  onAddTask, 
  onSearch, 
  onFilterPriority, 
  onFilterCategory,
  isConnected,
  taskCount 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activePriority, setActivePriority] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const filterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilters(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handlePriorityChange = (value) => {
    setActivePriority(value);
    onFilterPriority(value);
  };

  const handleCategoryChange = (value) => {
    setActiveCategory(value);
    onFilterCategory(value);
  };

  const clearAllFilters = () => {
    setActivePriority("");
    setActiveCategory("");
    onFilterPriority("");
    onFilterCategory("");
  };

  const hasActiveFilters = activePriority || activeCategory;

  const handleClearAll = () => {
    if (confirm(`Are you sure you want to delete all ${taskCount} tasks?`)) {
      onClearAll();
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h1 className="navbar-title">
          KANBANBOARD
        </h1>
      </div>

      <div className="navbar-right">
        <button className="navbar-btn add-btn" onClick={onAddTask} title="Add new task">
          ➕ Add Task
        </button>

        <div className="task-counter">
          <span className="counter-label">Tasks:</span>
          <span className="counter-value">{taskCount}</span>
        </div>
      </div>
    </nav>
  );
}
