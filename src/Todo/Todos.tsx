import { useEffect } from 'react';
import cn from 'classnames';
import { useMachine } from '@xstate/react';
import useHashChange from './useHashChange';
import Todo from './Todo';
import todosMachine, { TodosContext } from './todosMachine';

import './index.css';

function filterTodos(filter: TodosContext['filter'], todos: TodosContext['todos']) {
  if (filter === 'active') {
    return todos.filter((todo) => !todo.completed);
  }

  if (filter === 'completed') {
    return todos.filter((todo) => todo.completed);
  }

  return todos;
}

const persistedTodosMachine = todosMachine.withConfig(
  {
    actions: {
      persist: (ctx) => {
        try {
          localStorage.setItem('todos-xstate', JSON.stringify(ctx.todos));
        } catch (e) {
          console.error(e);
        }
      },
    },
  },
  // initial state from localstorage
  {
    newTodo: 'Learn state machines',
    todos: (() => {
      try {
        return JSON.parse(localStorage.getItem('todos-xstate') ?? '') || [];
      } catch (e) {
        console.error(e);
        return [];
      }
    })(),
    filter: 'active',
  },
);

function Todos() {
  const [state, send] = useMachine(persistedTodosMachine, { devTools: true });

  useHashChange(() => {
    const filterFromHash = window.location.hash.slice(2) as TodosContext['filter'] | '';
    send({ type: 'SHOW', filter: filterFromHash || 'all' });
  });

  // Capture initial state of browser hash
  useEffect(() => {
    const filterFromHash = window.location.hash.slice(2) as TodosContext['filter'] | '';
    filterFromHash && send({ type: 'SHOW', filter: filterFromHash });
  }, [send]);

  const { todos, newTodo, filter } = state.context;

  const numActiveTodos = todos.filter((todo) => !todo.completed).length;
  const allCompleted = todos.length > 0 && numActiveTodos === 0;
  const mark = !allCompleted ? 'completed' : 'active';
  const filteredTodos = filterTodos(filter, todos);

  return (
    <section className="todoapp" data-state={state.toStrings()}>
      <header className="header">
        <h1>todos</h1>
        <input
          className="new-todo"
          placeholder="What needs to be done?"
          autoFocus
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              send({ type: 'NEWTODO.COMMIT', value: newTodo });
            }
          }}
          onChange={(e) => send({ type: 'NEWTODO.CHANGE', value: e.target.value })}
          value={newTodo}
        />
      </header>
      <section className="main">
        <input
          id="toggle-all"
          className="toggle-all"
          type="checkbox"
          checked={allCompleted}
          onChange={() => {
            switch (mark) {
              case 'active':
                send({ type: 'MARK.active' });
                break;
              case 'completed':
                send({ type: 'MARK.completed' });
            }
          }}
        />
        <label htmlFor="toggle-all" title={`Mark all as ${mark}`}>
          {`Mark all as ${mark}`}
        </label>
        <ul className="todo-list">
          {filteredTodos.map((todo) => (
            <Todo key={todo.id} todoRef={todo.ref} />
          ))}
        </ul>
      </section>
      {!!todos.length && (
        <footer className="footer">
          <span className="todo-count">
            <strong>{numActiveTodos}</strong>
            <span>
              item
              {numActiveTodos === 1 ? '' : 's'}
              left
            </span>
          </span>
          <ul className="filters">
            <li>
              <a
                className={cn({
                  selected: filter === 'all',
                })}
                href="#/"
              >
                All
              </a>
            </li>
            <li>
              <a
                className={cn({
                  selected: filter === 'active',
                })}
                href="#/active"
              >
                Active
              </a>
            </li>
            <li>
              <a
                className={cn({
                  selected: filter === 'completed',
                })}
                href="#/completed"
              >
                Completed
              </a>
            </li>
          </ul>
          {numActiveTodos < todos.length && (
            <button
              type="button"
              onClick={() => send({ type: 'CLEAR_COMPLETED' })}
              className="clear-completed"
            >
              Clear completed
            </button>
          )}
        </footer>
      )}
    </section>
  );
}
export default Todos;
