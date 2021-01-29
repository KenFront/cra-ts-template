import { useEffect, useRef } from 'react';
import { useActor } from '@xstate/react';
import cn from 'classnames';
import { TodosContext } from './todosMachine';

function Todo({ todoRef }: { todoRef: TodosContext['todos'][0]['ref'] }) {
  const [state, send] = useActor(todoRef);
  const inputRef = useRef<HTMLInputElement>(null);
  const { id, title, completed } = state.context;

  useEffect(() => {
    if (state.actions.find((action) => action.type === 'focusInput')) {
      inputRef.current?.select();
    }
  }, [state.actions, todoRef]);

  return (
    <li
      className={cn({
        editing: state.matches('editing'),
        completed,
      })}
      data-todo-state={completed ? 'completed' : 'active'}
      key={id}
    >
      <div className="view">
        <input
          className="toggle"
          type="checkbox"
          onChange={() => {
            send({
              type: 'TOGGLE_COMPLETE',
            });
          }}
          checked={completed}
        />
        <label
          onDoubleClick={() => {
            send({
              type: 'EDIT',
            });
          }}
        >
          {title}
        </label>
        <div
          onClick={() =>
            send({
              type: 'DELETE',
            })
          }
          className="destroy"
        />
      </div>
      <input
        className="edit"
        value={title}
        onBlur={(_) => send({ type: 'BLUR' })}
        onChange={(e) => send({ type: 'CHANGE', value: e.target.value })}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            send({
              type: 'COMMIT',
            });
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            send({
              type: 'CANCEL',
            });
          }
        }}
        ref={inputRef}
      />
    </li>
  );
}
export default Todo;
