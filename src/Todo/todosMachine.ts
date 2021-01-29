import { Machine, spawn, SpawnedActorRef, State, Typestate } from 'xstate';
import { assign } from '@xstate/immer';
import createTodoMachine, { TodoContext, TodoEvent, TodoState } from './todoMachine';
import { CommonMachineState } from './types';

const createTodo = (title: string) => {
  return {
    id: `${Date.now()}`,
    title,
    completed: false,
  };
};

export interface TodosContext {
  newTodo: string;
  todos: {
    id: string;
    title: string;
    completed: boolean;
    ref: SpawnedActorRef<
      TodoEvent,
      State<TodoContext, TodoEvent, CommonMachineState<TodoState>, Typestate<TodoContext>>
    >;
  }[];
  filter: 'all' | 'active' | 'completed';
}

export enum TodosState {
  loading = 'loading',
  ready = 'ready',
}

export type TodosEvent =
  | { type: 'NEWTODO.CHANGE'; value: string }
  | { type: 'NEWTODO.COMMIT'; value: string }
  | { type: 'TODO.COMMIT'; todo: TodoContext }
  | { type: 'TODO.DELETE'; id: string }
  | { type: 'SHOW'; filter: TodosContext['filter'] }
  | { type: 'MARK.completed' }
  | { type: 'MARK.active' }
  | { type: 'CLEAR_COMPLETED' }
  | { type: 'persist' };

const todosMachine = Machine<TodosContext, CommonMachineState<TodosState>, TodosEvent>({
  id: 'todos',
  context: {
    newTodo: '',
    todos: [],
    filter: 'all',
  },
  initial: TodosState.loading,
  states: {
    [TodosState.loading]: {
      entry: assign((context) => {
        // "Rehydrate" persisted todos
        context.todos = context.todos.map((todo) => ({
          ...todo,
          ref: spawn(createTodoMachine(todo)),
        }));
      }),
      always: TodosState.ready,
    },
    [TodosState.ready]: {},
  },
  on: {
    'NEWTODO.CHANGE': {
      actions: assign((context, event) => {
        context.newTodo = event.value;
      }),
    },
    'NEWTODO.COMMIT': {
      actions: [
        assign((context, event) => {
          const newTodo = createTodo(event.value.trim());
          context.newTodo = '';
          context.todos = [
            ...context.todos,
            {
              ...newTodo,
              ref: spawn(createTodoMachine(newTodo)),
            },
          ];
        }),
        'persist',
      ],
      cond: (_context, event) => event.value.trim().length > 0,
    },
    'TODO.COMMIT': {
      actions: [
        assign((context, event) => {
          context.todos = context.todos.map((todo) => {
            return todo.id === event.todo.id ? { ...todo, ...event.todo, ref: todo.ref } : todo;
          });
        }),
        'persist',
      ],
    },
    'TODO.DELETE': {
      actions: [
        assign((context, event) => {
          context.todos = context.todos.filter((todo) => todo.id !== event.id);
        }),
        'persist',
      ],
    },
    SHOW: {
      actions: assign((context, event) => {
        context.filter = event.filter;
      }),
    },
    'MARK.completed': {
      actions: (context) => {
        context.todos.forEach((todo) => todo.ref.send('SET_COMPLETED'));
      },
    },
    'MARK.active': {
      actions: (context) => {
        context.todos.forEach((todo) => todo.ref.send('SET_ACTIVE'));
      },
    },
    CLEAR_COMPLETED: {
      actions: assign((context) => {
        context.todos = context.todos.filter((todo) => !todo.completed);
      }),
    },
  },
});

export default todosMachine;
