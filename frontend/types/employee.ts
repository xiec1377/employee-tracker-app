export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  department: string;
  position: string;
  hireDate: string;
  salary?: number;
  status: "active" | "inactive" | "on_leave";
}

export type EmployeeFormData = Omit<Employee, "id">;
