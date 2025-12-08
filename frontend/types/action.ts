import { Employee } from './Employee';

export type Action =
  // | { type: 'edit'; employeeId: number; previousData: Employee }
  | {
      type: 'delete';
      employeeId: number;
      previousData: Employee;
      index: number;
      timeoutId: NodeJS.Timeout;
    };
