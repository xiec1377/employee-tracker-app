'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Employee } from '@/types/employee';
import { fetchAllEmployees, createEmployee, deleteEmployee} from '@/lib/api/employees';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({});


  useEffect(() => {
    (async () => {
      const data = await fetchAllEmployees();
      setEmployees(data);
    })();
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

  const handleAddEmployee = () => {
    console.log("ADDING NEW EMPLOYEE..")
    if (!newEmployee.firstName || !newEmployee.lastName) return;
    const newEmp: Employee = {
      id: employees.length + 1,
      firstName: newEmployee.firstName!,
      lastName: newEmployee.lastName!,
      email: newEmployee.email || '',
      phone: newEmployee.phone || '',
      department: newEmployee.department || 'General',
      position: newEmployee.position || '',
      hireDate: newEmployee.hireDate || new Date().toISOString(),
      salary: newEmployee.salary || 0,
      status: newEmployee.status || 'active',
    };
    // setEmployees([...employees, newEmp]);
    setIsModalOpen(false);
    setNewEmployee({});
    createEmployee(newEmp)
  };

  const handleDelete = async (id: number) => {
    // if (!confirm("Delete this employee?")) return;
    try {
      console.log("deleting emplkoyee, ", id)
      await deleteEmployee(id); 
      setEmployees(prev => prev.filter(emp => emp.id !== id)); // UI update
    } catch (err) {
      console.error(err);
      alert("Failed to delete employee");
    }
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 px-3 py-1 text-white rounded"
        >
          Add
        </button>
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
              filteredAndSortedEmployees.map((employee) => (
                <tr
                  key={employee.id}
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
                    <button className="rounded-md bg-blue-500 px-2 py-1 text-white hover:bg-blue-600">Edit</button>
                    <button className="rounded-md bg-red-500 px-2 py-1 text-white hover:bg-red-600" onClick={()=> handleDelete(employee.id)}>Delete</button>
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
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Add New Employee</h2>
            <div className="flex flex-col gap-2">
              <input
                placeholder="First Name"
                value={newEmployee.firstName || ''}
                onChange={(e) => setNewEmployee({ ...newEmployee, firstName: e.target.value })}
              />
              <input
                placeholder="Last Name"
                value={newEmployee.lastName || ''}
                onChange={(e) => setNewEmployee({ ...newEmployee, lastName: e.target.value })}
              />
              <input
                placeholder="Email"
                value={newEmployee.email || ''}
                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
              />
              <input
                placeholder="Phone"
                value={newEmployee.phone || ''}
                onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
              />
              <input
                placeholder="Department"
                value={newEmployee.department || ''}
                onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
              />
              <input
                placeholder="Position"
                value={newEmployee.position || ''}
                onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
              />
              <input
                placeholder="Hire Date"
                type="date"
                value={newEmployee.hireDate?.split('T')[0] || ''}
                onChange={(e) => setNewEmployee({ ...newEmployee, hireDate: e.target.value })}
              />
              <input
                placeholder="Salary"
                type="number"
                value={newEmployee.salary || ''}
                onChange={(e) => setNewEmployee({ ...newEmployee, salary: Number(e.target.value) })}
              />
              <select
                value={newEmployee.status || 'active'}
                onChange={(e) => setNewEmployee({ ...newEmployee, status: e.target.value as Employee['status'] })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
              </select>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-500 px-3 py-1 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEmployee}
                className="bg-blue-500 px-3 py-1 text-white rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

