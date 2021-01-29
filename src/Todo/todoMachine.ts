import { Machine, sendParent } from 'xstate';
import { assign } from '@xstate/immer';
import { CommonMachineState } from './types';

export interface TodoContext {
  id: string;
  title: string;
  prevTitle: string;
  completed: boolean;
}

export enum TodoState {
  reading = 'reading',
  editing = 'editing',
  deleted = 'deleted',
}

export type TodoEvent =
  | { type: 'SET_COMPLETED' }
  | { type: 'TOGGLE_COMPLETE' }
  | { type: 'SET_ACTIVE' }
  | { type: 'EDIT' }
  | { type: 'CHANGE'; value: string }
  | { type: 'COMMIT' }
  | { type: 'BLUR' }
  | { type: 'CANCEL' }
  | { type: 'DELETE' }
  | { type: 'commit' }
  | { type: 'focusInput' };

const createTodoMachine = ({ id, title, completed }: Omit<TodoContext, 'prevTitle'>) =>
  Machine<TodoContext, CommonMachineState<TodoState>, TodoEvent>(
    {
      id: 'todo',
      initial: TodoState.reading,
      context: {
        id,
        title,
        prevTitle: title,
        completed,
      },
      on: {
        TOGGLE_COMPLETE: {
          actions: [
            assign((context) => {
              context.completed = true;
            }),
            sendParent((context) => ({ type: 'TODO.COMMIT', todo: context })),
          ],
        },
        DELETE: TodoState.deleted,
      },
      states: {
        [TodoState.reading]: {
          on: {
            SET_COMPLETED: {
              actions: [
                assign((context) => {
                  context.completed = true;
                }),
                'commit',
              ],
            },
            TOGGLE_COMPLETE: {
              actions: [
                assign((context) => {
                  context.completed = !context.completed;
                }),
                'commit',
              ],
            },
            SET_ACTIVE: {
              actions: [
                assign((context) => {
                  context.completed = false;
                }),
                'commit',
              ],
            },
            EDIT: {
              target: TodoState.editing,
              actions: 'focusInput',
            },
          },
        },
        [TodoState.editing]: {
          entry: assign((context) => {
            context.prevTitle = context.title;
          }),
          on: {
            CHANGE: {
              actions: assign((context, event) => {
                context.title = event.value;
              }),
            },
            COMMIT: [
              {
                target: TodoState.reading,
                actions: sendParent((context) => ({
                  type: 'TODO.COMMIT',
                  todo: context,
                })),
                cond: (context) => context.title.trim().length > 0,
              },
              { target: 'deleted' },
            ],
            BLUR: {
              target: TodoState.reading,
              actions: sendParent((context) => ({
                type: 'TODO.COMMIT',
                todo: context,
              })),
            },
            CANCEL: {
              target: TodoState.reading,
              actions: assign((context) => {
                context.title = context.prevTitle;
              }),
            },
          },
        },
        [TodoState.deleted]: {
          onEntry: sendParent((context) => ({
            type: 'TODO.DELETE',
            id: context.id,
          })),
        },
      },
    },
    {
      actions: {
        commit: sendParent((context) => ({
          type: 'TODO.COMMIT',
          todo: context,
        })),
        focusInput: () => {},
      },
    },
  );
export default createTodoMachine;
