import { useEffect, useMemo, useState } from 'react';
import { todoApi } from './api.js';

const FILTERS = ['all', 'active', 'completed'];

export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTodos();
  }, []);

  async function loadTodos() {
    try {
      setLoading(true);
      setError('');
      setTodos(await todoApi.getAll());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addTodo(event) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    try {
      setSaving(true);
      setError('');
      const newTodo = await todoApi.create(cleanTitle);
      setTodos((current) => [newTodo, ...current]);
      setTitle('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleTodo(todo) {
    try {
      setError('');
      const updated = await todoApi.update(todo.id, {
        completed: !todo.completed,
      });
      replaceTodo(updated);
    } catch (err) {
      setError(err.message);
    }
  }

  function beginEdit(todo) {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
  }

  async function saveEdit(event, id) {
    event.preventDefault();
    const cleanTitle = editingTitle.trim();
    if (!cleanTitle) return;

    try {
      setError('');
      const updated = await todoApi.update(id, { title: cleanTitle });
      replaceTodo(updated);
      cancelEdit();
    } catch (err) {
      setError(err.message);
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingTitle('');
  }

  async function deleteTodo(id) {
    try {
      setError('');
      await todoApi.remove(id);
      setTodos((current) => current.filter((todo) => todo.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  async function clearCompleted() {
    try {
      setError('');
      await todoApi.clearCompleted();
      setTodos((current) => current.filter((todo) => !todo.completed));
    } catch (err) {
      setError(err.message);
    }
  }

  function replaceTodo(updatedTodo) {
    setTodos((current) =>
      current.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo)),
    );
  }

  const filteredTodos = useMemo(() => {
    if (filter === 'active') return todos.filter((todo) => !todo.completed);
    if (filter === 'completed') return todos.filter((todo) => todo.completed);
    return todos;
  }, [todos, filter]);

  const activeCount = todos.filter((todo) => !todo.completed).length;
  const completedCount = todos.length - activeCount;
  const progress = todos.length ? Math.round((completedCount / todos.length) * 100) : 0;

  return (
    <main className="page-shell">
      <section className="todo-app">
        <header className="hero">
          <div>
            <p className="eyebrow">Plan • Focus • Finish</p>
            <h1>FocusList</h1>
            <p className="subtitle">A simple place to organize today’s work.</p>
          </div>
          <div className="progress-ring" style={{ '--progress': `${progress * 3.6}deg` }}>
            <span>{progress}%</span>
          </div>
        </header>

        <form className="add-form" onSubmit={addTodo}>
          <label className="sr-only" htmlFor="new-task">New task</label>
          <input
            id="new-task"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What needs to be done?"
            maxLength="120"
            autoComplete="off"
          />
          <button type="submit" disabled={saving || !title.trim()}>
            {saving ? 'Adding…' : 'Add task'}
          </button>
        </form>

        {error && (
          <div className="error-message" role="alert">
            {error}
            <button type="button" onClick={loadTodos}>Retry</button>
          </div>
        )}

        <div className="toolbar">
          <div className="filters" aria-label="Task filters">
            {FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                className={filter === item ? 'active' : ''}
                onClick={() => setFilter(item)}
              >
                {item[0].toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>
          <p>{activeCount} task{activeCount === 1 ? '' : 's'} left</p>
        </div>

        <section className="task-list" aria-live="polite">
          {loading ? (
            <div className="empty-state">
              <div className="loader" />
              <p>Loading your tasks…</p>
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">✓</span>
              <h2>No tasks here</h2>
              <p>
                {filter === 'all'
                  ? 'Add your first task above.'
                  : `There are no ${filter} tasks.`}
              </p>
            </div>
          ) : (
            <ul>
              {filteredTodos.map((todo) => (
                <li key={todo.id} className={todo.completed ? 'completed' : ''}>
                  {editingId === todo.id ? (
                    <form className="edit-form" onSubmit={(event) => saveEdit(event, todo.id)}>
                      <input
                        value={editingTitle}
                        onChange={(event) => setEditingTitle(event.target.value)}
                        maxLength="120"
                        autoFocus
                      />
                      <button type="submit" className="icon-button save" aria-label="Save task">Save</button>
                      <button type="button" className="icon-button" onClick={cancelEdit}>Cancel</button>
                    </form>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="check-button"
                        onClick={() => toggleTodo(todo)}
                        aria-label={todo.completed ? 'Mark as active' : 'Mark as completed'}
                        aria-pressed={todo.completed}
                      >
                        {todo.completed ? '✓' : ''}
                      </button>
                      <div className="task-content">
                        <span className="task-title">{todo.title}</span>
                        <span className="task-date">
                          Added {new Date(todo.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="task-actions">
                        <button type="button" onClick={() => beginEdit(todo)} aria-label={`Edit ${todo.title}`}>
                          Edit
                        </button>
                        <button type="button" className="danger" onClick={() => deleteTodo(todo.id)} aria-label={`Delete ${todo.title}`}>
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="app-footer">
          <span>{todos.length} total</span>
          <span>{completedCount} completed</span>
          <button type="button" onClick={clearCompleted} disabled={completedCount === 0}>
            Clear completed
          </button>
        </footer>
      </section>
    </main>
  );
}
