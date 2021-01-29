export interface CommonMachineState<T extends string> {
  states: Record<T, {}>;
}
