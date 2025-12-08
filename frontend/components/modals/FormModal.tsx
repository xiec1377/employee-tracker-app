'use client';

import { AlertCircle, X } from '@deemlol/next-icons';
import { formatPhoneInput } from '@/utils/formatPhone';
import { Employee } from '@/types/Employee';

type FormModalProps = {
  isOpen: boolean;
  formData: Partial<Employee>;
  errors: {
    firstName?: string;
    lastName?: string;
    email?: string;
    department?: string;
    position?: string;
    status?: string;
    phone?: string;
  };
  editingEmployee: Employee | null;
  newEmployee: Partial<Employee>;
  setEditingEmployee: (value: Employee | null) => void;
  setNewEmployee: (value: Partial<Employee>) => void;
  onClose: () => void;
  onSubmitAdd: () => void;
  onSubmitUpdate: () => void;
};

export function FormModal({
  isOpen,
  formData,
  errors,
  editingEmployee,
  newEmployee,
  setEditingEmployee,
  setNewEmployee,
  onClose,
  onSubmitAdd,
  onSubmitUpdate,
}: FormModalProps) {
  if (!isOpen) return null;

const departmentOptions = [
    { value: '', label: 'Select' },
    { value: 'accounting', label: 'Accounting' },
    { value: 'administration', label: 'Administration' },
    { value: 'customer_support', label: 'Customer Support' },
    { value: 'design', label: 'Design' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'finance', label: 'Finance' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'information_technology', label: 'Information Technology' },
    { value: 'legal', label: 'Legal' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'operations', label: 'Operations' },
    { value: 'sales', label: 'Sales' },
    { value: 'security', label: 'Security' },
  ];
  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          aria-label="Close"
        >
          <X size={24} color="#FFFFFF" />
        </button>

        <h2 className="text-xl font-bold mb-4">
          {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
        </h2>

        <div className="flex flex-col gap-3 w-full">
          <div className="flex flex-row gap-3 w-full">
            <div className="flex flex-col gap-1 flex-1">
              <label
                htmlFor="firstName"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                placeholder="First Name"
                value={formData.firstName || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (editingEmployee) {
                    setEditingEmployee({ ...editingEmployee, firstName: value });
                  } else {
                    setNewEmployee({ ...newEmployee, firstName: value });
                  }
                }}
                className={`w-full rounded-lg border px-4 py-2 text-sm text-black placeholder-zinc-500
                  focus:outline-none focus:ring-2 focus:ring-black
                  dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400 dark:focus:border-zinc-500 dark:focus:ring-zinc-500
                  ${
                    errors.firstName
                      ? 'border-red-500'
                      : 'border-zinc-700 dark:border-zinc-700 border-zinc-300 bg-white'
                  }`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={14} color="red" />
                  {errors.firstName}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1 flex-1">
              <label
                htmlFor="lastName"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                id="lastName"
                placeholder="Last Name"
                value={formData.lastName || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (editingEmployee) {
                    setEditingEmployee({ ...editingEmployee, lastName: value });
                  } else {
                    setNewEmployee({ ...newEmployee, lastName: value });
                  }
                }}
                className={`w-full rounded-lg border px-4 py-2 text-sm text-black placeholder-zinc-500
                  focus:outline-none focus:ring-2 focus:ring-black
                  dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400 dark:focus:border-zinc-500 dark:focus:ring-zinc-500
                  ${
                    errors.lastName
                      ? 'border-red-500'
                      : 'border-zinc-700 dark:border-zinc-700 border-zinc-300 bg-white'
                  }`}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={14} color="red" />
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1 flex-1">
            <label
              htmlFor="email"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              placeholder="Email"
              value={formData.email || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (editingEmployee) {
                  setEditingEmployee({ ...editingEmployee, email: value });
                } else {
                  setNewEmployee({ ...newEmployee, email: value });
                }
              }}
              className={`w-full rounded-lg border px-4 py-2 text-sm text-black placeholder-zinc-500
                focus:outline-none focus:ring-2 focus:ring-black
                dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400 dark:focus:border-zinc-500 dark:focus:ring-zinc-500
                ${
                  errors.email
                    ? 'border-red-500'
                    : 'border-zinc-700 dark:border-zinc-700 border-zinc-300 bg-white'
                }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={14} color="red" />
                {errors.email}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="phone"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Phone
            </label>
            <input
              id="phone"
              placeholder="Phone"
              value={editingEmployee?.phone || newEmployee.phone || ''}
              onChange={(e) => {
                const formatted = formatPhoneInput(e.target.value);
                if (editingEmployee) {
                  setEditingEmployee({ ...editingEmployee, phone: formatted });
                } else {
                  setNewEmployee({ ...newEmployee, phone: formatted });
                }
              }}
              className={`w-full rounded-lg border px-4 py-2 text-sm text-black placeholder-zinc-500
                focus:outline-none focus:ring-2 focus:ring-black
                dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400 dark:focus:border-zinc-500 dark:focus:ring-zinc-500
                ${
                  errors.phone
                    ? 'border-red-500'
                    : 'border-zinc-700 dark:border-zinc-700 border-zinc-300 bg-white'
                }`}            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={14} color="red" />
                {errors.phone}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="department"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Department <span className="text-red-500">*</span>
            </label>
            <select
              id="department"
              value={formData.department || 'general'}
              onChange={(e) => {
                const value = e.target.value as Employee['department'];
                if (editingEmployee) {
                  setEditingEmployee({ ...editingEmployee, department: value });
                } else {
                  setNewEmployee({ ...newEmployee, department: value });
                }
              }}
              className={`w-full rounded-lg border px-4 py-2 text-sm text-black placeholder-zinc-500
                  focus:outline-none focus:ring-2 focus:ring-black
                  dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400 dark:focus:border-zinc-500 dark:focus:ring-zinc-500
                  ${
                    errors.department
                      ? 'border-red-500'
                      : 'border-zinc-700 dark:border-zinc-700 border-zinc-300 bg-white'
                  }`}
            >
             {departmentOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                {opt.label}
                </option>
            ))}
            </select>
            {errors.department && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={14} color="red" />
                {errors.department}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="position"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Position <span className="text-red-500">*</span>
            </label>
            <input
              id="position"
              placeholder="Position"
              value={formData.position || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (editingEmployee) {
                  setEditingEmployee({ ...editingEmployee, position: value });
                } else {
                  setNewEmployee({ ...newEmployee, position: value });
                }
              }}
              className={`w-full rounded-lg border px-4 py-2 text-sm text-black placeholder-zinc-500
                focus:outline-none focus:ring-2 focus:ring-black
                dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400 dark:focus:border-zinc-500 dark:focus:ring-zinc-500
                ${
                  errors.position
                    ? 'border-red-500'
                    : 'border-zinc-700 dark:border-zinc-700 border-zinc-300 bg-white'
                }`}
            />
            {errors.position && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={14} color="red" />
                {errors.position}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="hireDate"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Hire Date
            </label>
            <input
              id="hireDate"
              type="date"
              value={formData.hireDate || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (editingEmployee) {
                  setEditingEmployee({ ...editingEmployee, hireDate: value });
                } else {
                  setNewEmployee({ ...newEmployee, hireDate: value });
                }
              }}
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-black placeholder-zinc-500 focus:border-black focus:outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400 dark:focus:border-zinc-500 dark:focus:ring-zinc-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="salary"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Salary
            </label>
            <input
              id="salary"
              type="number"
              placeholder="Salary"
              value={formData.salary || ''}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (editingEmployee) {
                  setEditingEmployee({ ...editingEmployee, salary: value });
                } else {
                  setNewEmployee({ ...newEmployee, salary: value });
                }
              }}
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-black placeholder-zinc-500 focus:border-black focus:outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400 dark:focus:border-zinc-500 dark:focus:ring-zinc-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="status"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              value={formData.status || ''}
              onChange={(e) => {
                const value = e.target.value as Employee['status'];
                if (editingEmployee) {
                  setEditingEmployee({ ...editingEmployee, status: value });
                } else {
                  setNewEmployee({ ...newEmployee, status: value });
                }
              }}
              className={`w-full rounded-lg border px-4 py-2 text-sm text-black placeholder-zinc-500
                  focus:outline-none focus:ring-2 focus:ring-black
                  dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400 dark:focus:border-zinc-500 dark:focus:ring-zinc-500
                  ${
                    errors.status
                      ? 'border-red-500'
                      : 'border-zinc-700 dark:border-zinc-700 border-zinc-300 bg-white'
                  }`}
            >
              <option value="">Select</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
            </select>
            {errors.status && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={14} color="red" />
                {errors.status}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-500 px-3 py-1 text-white rounded"
          >
            Cancel
          </button>
          <button
            onClick={editingEmployee ? onSubmitUpdate : onSubmitAdd}
            className="bg-blue-500 px-3 py-1 text-white rounded"
          >
            {editingEmployee ? 'Update' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
