import { Employee } from './employee';

export type Action =
  | { type: 'edit'; employeeId: string; previousData: Employee }
  | {
      type: 'delete';
      employeeId: string;
      previousData: Employee;
      index: number;
      timeoutId: NodeJS.Timeout;
    };
