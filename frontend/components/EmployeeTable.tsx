'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Employee } from '@/types/employee';
import { fetchAllEmployees, createEmployee, deleteEmployee, updateEmployee, uploadExcel, downloadExcel} from '@/lib/api/employees';
import toast from 'react-hot-toast';


const mockEmployees: Employee[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    phone: '+1 (555) 123-4567',
    department: 'Engineering',
    position: 'Senior Software Engineer',
    hireDate: '2022-01-15',
    salary: 120000,
    status: 'active',
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@company.com',
    phone: '+1 (555) 234-5678',
    department: 'Marketing',
    position: 'Marketing Manager',
    hireDate: '2021-06-10',
    salary: 95000,
    status: 'active',
  },
  {
    id: 3,
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@company.com',
    phone: '+1 (555) 345-6789',
    department: 'Sales',
    position: 'Sales Representative',
    hireDate: '2023-03-20',
    salary: 65000,
    status: 'active',
  },
];

export function EmployeeTable() {
  // const [employees] = useState<Employee[]>(mockEmployees);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Employee | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({});
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletedEmployee, setDeletedEmployee] = useState(0);


  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const res = await fetchAllEmployees();
  
        if (res.status === 429) {
          // const data = await res.json().catch(() => null);
          toast.error("Too many requests. Please try again later.");
          return;
        }
  
        if (!res.ok) {
          // const data = await res.json().catch(() => null);
          toast.error("Failed to load employees...");
          return;
        }
  
        const employees = await res.json();
        setEmployees(employees);
  
      } catch (error) {
        console.error("Error loading employees:", error);
        toast.error("Failed to load employees...");
      }
    };
  
    loadEmployees();
  }, []);
  
  // useMemo hook for caching expensive filtering calculatiosn
  const departments = useMemo(
    () => Array.from(new Set(employees.map((emp) => emp.department))),
    [employees]
  );

  // Filter and sort employees
  const filteredAndSortedEmployees = useMemo(() => {
    const filtered = employees.filter((employee) => {
      const matchesSearch =
        searchTerm === '' ||
        Object.values(employee).some((value) =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesDepartment =
        filterDepartment === 'all' || employee.department === filterDepartment;
      return matchesSearch && matchesDepartment;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc'
            ? aValue - bValue
            : bValue - aValue;
        }

        return 0;
      });
    }

    return filtered;
  }, [employees, searchTerm, filterDepartment, sortConfig]);

  const handleSort = (key: keyof Employee) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getStatusBadge = (status: Employee['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      on_leave: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
      >
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleAddEmployee = async () => {
    console.log("ADDING NEW EMPLOYEE...");
  
    if (!newEmployee.firstName || !newEmployee.lastName) return;
    const payload = {
      firstName: newEmployee.firstName,
      lastName: newEmployee.lastName,
      email: newEmployee.email || "",
      phone: newEmployee.phone || "",
      department: newEmployee.department || "General",
      position: newEmployee.position || "",
      hireDate: newEmployee.hireDate || new Date().toISOString(),
      salary: newEmployee.salary || 0,
      status: newEmployee.status || "active",
    };
  
    try {
      const res = await createEmployee(payload);
  
      if (res.status === 429) {
        // const data = await res.json().catch(() => null);
        toast.error("Too many requests. Please try again later.");
        return;
      }
  
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "Failed to add employee...");
        return;
      }
  
      const createdEmployee = await res.json();
  
      setEmployees([...employees, createdEmployee]);
      setIsFormModalOpen(false);
      setNewEmployee({});
      toast.success("Employee added successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add employee...");
    }
  };
  
  
  const handleUpdateEmployee = async () => {
    if (!editingEmployee) return;
    if (!editingEmployee.firstName || !editingEmployee.lastName) return;
  
    try {
      const res = await updateEmployee(editingEmployee.id, editingEmployee);
      if (res.status === 429) {
        // const data = await res.json().catch(() => null);
        toast.error("Too many requests. Please try again later.");
        return;
      }

      if (!res.ok) {
        // const data = await res.json().catch(() => null);
        toast.error("Failed to update employee...");
        return;
      }
      const updatedEmp = await res.json();
      setEmployees(employees.map(emp =>
        emp.id === updatedEmp.id ? updatedEmp : emp
      ));
      setIsFormModalOpen(false);
      setEditingEmployee(null);
      setNewEmployee({});
      toast.success('Employee updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update employee...');
    }
  };
  
  const handleDelete = async (id: number) => {
    try {
      console.log("Deleting employee:", id);
      const res = await deleteEmployee(id);
      if (res.status === 429) {
        // const data = await res.json();
        toast.error("Too many requests. Please try again later.");
        return;
      }
      if (!res.ok) {
        // const data = await res.json().catch(() => null);
        toast.error("Failed to delete employee...");
        return;
      }
      setEmployees(prev => prev.filter(emp => emp.id !== id)); 
      setIsDeleteModalOpen(false);
      setDeletedEmployee(0);
      toast.success('Employee deleted successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete employee...');
    }
  };

  const handleImportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    try {
      await uploadExcel(file)
      const res = await uploadExcel(file);
      // console.log("res.json:", res.json())
      if (res.status === 429) {
        // const data = await res.json();
        toast.error("Too many requests. Please try again later.");
        return;
      }
  
      if (!res.ok) {
        toast.error("Failed to import Excel file...");
        return;
      }
      toast.success("Excel file imported successfully!");

      const result = await fetchAllEmployees();
      console.log("result:", result)
      setEmployees(result);
  
    } catch (error) {
      console.error(error);
      toast.error("Failed to import Excel file...");
    }
  };

  const handleExportFile = async () => {
    try {
      const res = await downloadExcel();
      if (res.status === 429) {
        // const data = await res.json();
        toast.error("Too many requests. Please try again later.");
        return;
      }

      if (!res.ok) {
        toast.error("Failed to export Excel file...");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "employees.xlsx";
      a.click();
      a.remove(); 
      toast.success("Excel file exported successfully!");
  
    } catch (error) {
      console.error(error);
      toast.error("Failed to export Excel file...");
    }
  };

  const formData = editingEmployee || newEmployee;
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <button
          onClick={() => setIsFormModalOpen(true)}
          className="bg-blue-500 px-3 py-1 text-white rounded"
        >
          Add
        </button>
        <input
          type="file"
          id="excelUpload"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleImportUpload}
        />

        <button
          onClick={() => document.getElementById("excelUpload")!.click()}
          className="bg-blue-500 px-3 py-1 text-white rounded"
        >
          Import
        </button>
        <button
          onClick={handleExportFile}
          className="bg-blue-500 px-3 py-1 text-white rounded"
        > Export </button>
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-black placeholder-zinc-500 focus:border-black focus:outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400 dark:focus:border-zinc-500 dark:focus:ring-zinc-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label
            htmlFor="department-filter"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Department:
          </label>
          <select
            id="department-filter"
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-500"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            <tr>
              <th
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
                onClick={() => handleSort('lastName')}
              >
                <div className="flex items-center gap-2">
                  Name
                  {sortConfig.key === 'lastName' && (
                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
                onClick={() => handleSort('email')}
              >
                <div className="flex items-center gap-2">
                  Email
                  {sortConfig.key === 'email' && (
                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Phone
              </th>
              <th
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
                onClick={() => handleSort('department')}
              >
                <div className="flex items-center gap-2">
                  Department
                  {sortConfig.key === 'department' && (
                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
                onClick={() => handleSort('position')}
              >
                Position
              </th>
              <th
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
                onClick={() => handleSort('hireDate')}
              >
                <div className="flex items-center gap-2">
                  Hire Date
                  {sortConfig.key === 'hireDate' && (
                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
                onClick={() => handleSort('salary')}
              >
                <div className="flex items-center gap-2">
                  Salary
                  {sortConfig.key === 'salary' && (
                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
            {filteredAndSortedEmployees.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400"
                >
                  No employees found.
                </td>
              </tr>
            ) : (
              filteredAndSortedEmployees.map((employee, index) => (
                <tr
                key={`${employee.id}-${index}`}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-black dark:text-zinc-50">
                    {employee.firstName} {employee.lastName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                    {employee.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                    {employee.phone}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                    {employee.department}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                    {employee.position}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                    {formatDate(employee.hireDate)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                    {formatCurrency(employee.salary)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                    {getStatusBadge(employee.status)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                    <button className="rounded-md bg-blue-500 px-2 py-1 text-white hover:bg-blue-600" onClick={() => {setEditingEmployee(employee); setIsFormModalOpen(true)}}>Edit</button>
                    <button className="rounded-md bg-red-500 px-2 py-1 text-white hover:bg-red-600" onClick={()=> {setDeletedEmployee(employee.id); setIsDeleteModalOpen(true)}}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="text-sm text-zinc-600 dark:text-zinc-400">
        Showing {filteredAndSortedEmployees.length} of {employees.length}{' '}
        employees
      </div>
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </h2>
            <div className="flex flex-col gap-2">
              <input
                placeholder="First Name"
                value={formData.firstName || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  editingEmployee
                    ? setEditingEmployee({ ...editingEmployee, firstName: value })
                    : setNewEmployee({ ...newEmployee, firstName: value });
                }}
              />
              <input
                placeholder="Last Name"
                value={formData.lastName || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  editingEmployee
                    ? setEditingEmployee({ ...editingEmployee, lastName: value })
                    : setNewEmployee({ ...newEmployee, lastName: value });
                }}
              />
              <input
                placeholder="Email"
                value={formData.email || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  editingEmployee
                    ? setEditingEmployee({ ...editingEmployee, email: value })
                    : setNewEmployee({ ...newEmployee, email: value });
                }}
              />
              <input
                placeholder="Phone"
                value={formData.phone || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  editingEmployee
                    ? setEditingEmployee({ ...editingEmployee, phone: value })
                    : setNewEmployee({ ...newEmployee, phone: value });
                }}
              />
              <input
                placeholder="Department"
                value={formData.department || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  editingEmployee
                    ? setEditingEmployee({ ...editingEmployee, department: value })
                    : setNewEmployee({ ...newEmployee, department: value });
                }}
              />
              <input
                placeholder="Position"
                value={formData.position || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  editingEmployee
                    ? setEditingEmployee({ ...editingEmployee, position: value })
                    : setNewEmployee({ ...newEmployee, position: value });
                }}
              />
              <input
                placeholder="Hire Date"
                type="date"
                value={formData.hireDate?.split('T')[0] || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  editingEmployee
                    ? setEditingEmployee({ ...editingEmployee, hireDate: value })
                    : setNewEmployee({ ...newEmployee, hireDate: value });
                }}
              />
              <input
                placeholder="Salary"
                type="number"
                value={formData.salary || ''}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  editingEmployee
                    ? setEditingEmployee({ ...editingEmployee, salary: value })
                    : setNewEmployee({ ...newEmployee, salary: value });
                }}
              />
              <select
                value={formData.status || 'active'}
                onChange={(e) => {
                  const value = e.target.value as Employee['status'];
                  editingEmployee
                    ? setEditingEmployee({ ...editingEmployee, status: value })
                    : setNewEmployee({ ...newEmployee, status: value });
                }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
              </select>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="bg-gray-500 px-3 py-1 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={editingEmployee ? handleUpdateEmployee : handleAddEmployee}
                className="bg-blue-500 px-3 py-1 text-white rounded"
              >
                {editingEmployee ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Are you sure you want to delete?</h2>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="bg-gray-500 px-3 py-1 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={()=>handleDelete(deletedEmployee)}
                className="bg-blue-500 px-3 py-1 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}