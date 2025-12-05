'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Employee } from '@/types/employee';
import {
  fetchEmployees,
  fetchAllEmployees,
  createEmployee,
  deleteEmployee,
  updateEmployee,
  uploadExcel,
  downloadExcel,
} from '@/lib/api/employees';
import toast from 'react-hot-toast';
import { formatPhone, formatPhoneInput } from '@/utils/formatPhone';
import { isValidEmail } from '@/utils/emailValidator';
import {
  AlertCircle,
  X,
  ArrowLeft,
  ArrowRight,
  Search,
  Upload,
  Download,
} from '@deemlol/next-icons';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { TableCell } from './table/TableCell';

import { Action } from '@/types/action';

// const mockEmployees: Employee[] = [
//   {
//     id: 1,
//     firstName: 'John',
//     lastName: 'Doe',
//     email: 'john.doe@company.com',
//     phone: '+1 (555) 123-4567',
//     department: 'Engineering',
//     position: 'Senior Software Engineer',
//     hireDate: '2022-01-15',
//     salary: 120000,
//     status: 'active',
//   },
//   {
//     id: 2,
//     firstName: 'Jane',
//     lastName: 'Smith',
//     email: 'jane.smith@company.com',
//     phone: '+1 (555) 234-5678',
//     department: 'Marketing',
//     position: 'Marketing Manager',
//     hireDate: '2021-06-10',
//     salary: 95000,
//     status: 'active',
//   },
//   {
//     id: 3,
//     firstName: 'Mike',
//     lastName: 'Johnson',
//     email: 'mike.johnson@company.com',
//     phone: '+1 (555) 345-6789',
//     department: 'Sales',
//     position: 'Sales Representative',
//     hireDate: '2023-03-20',
//     salary: 65000,
//     status: 'active',
//   },
// ];

export function EmployeeTable() {
  // const [employees] = useState<Employee[]>(mockEmployees);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Employee | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({});
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletedEmployee, setDeletedEmployee] = useState(0);

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState<Partial<Record<keyof Employee, string>>>({});

  // undo stack
  const [undoStack, setUndoStack] = useState<Action[]>([]);

  // pagination
  const loadEmployees = async () => {
    try {
      setIsLoading(true);

      const res = await fetchEmployees({
        page,
        page_size: pageSize,
        search: searchTerm || undefined,
        department: filterDepartment !== 'all' ? filterDepartment : undefined,
        ordering: sortConfig.key
          ? `${sortConfig.direction === 'desc' ? '-' : ''}${sortConfig.key}`
          : undefined,
      });

      if (res.status === 429) {
        toast.error('Too many requests. Please try again later.');
        return;
      }

      if (!res.ok) {
        toast.error('Failed to load employees...');
        return;
      }

      const data = await res.json();
      console.log('data:', data.results);
      setEmployees(data.results || data || []);
      setTotalCount(data.count ?? data.length ?? 0);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Failed to load employees...');
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    loadEmployees();
  }, [page, pageSize, searchTerm, filterDepartment, sortConfig]);

  useEffect(() => {
    console.log('employees, ', employees);
  }, [employees]);

  const totalPages = Math.ceil(totalCount / pageSize);

  // all data
  // useEffect(() => {
  //   const loadEmployees = async () => {
  //     try {
  //       const res = await fetchAllEmployees();

  //       if (res.status === 429) {
  //         // const data = await res.json().catch(() => null);
  //         toast.error("Too many requests. Please try again later.");
  //         return;
  //       }

  //       if (!res.ok) {
  //         // const data = await res.json().catch(() => null);
  //         toast.error("Failed to load employees...");
  //         return;
  //       }

  //       const employees = await res.json();
  //       console.log("employees-------------:", employees)
  //       setEmployees(employees);

  //     } catch (error) {
  //       console.error("Error loading employees:", error);
  //       toast.error("Failed to load employees...");
  //     }
  //   };

  //   loadEmployees();
  // }, []);

  // useMemo hook for caching expensive filtering calculatiosn
  const departments = useMemo(
    () => Array.from(new Set(employees.map((emp) => emp.department))),
    [employees],
  );

  // Filter and sort employees
  const filteredAndSortedEmployees = useMemo(() => {
    const filtered = employees.filter((employee) => {
      const matchesSearch =
        searchTerm === '' ||
        Object.values(employee).some((value) =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase()),
        );
      const matchesDepartment =
        filterDepartment === 'all' || employee.department === filterDepartment;
      const matchesStatus = filterStatus === 'all' || employee.status === filterStatus;
      return matchesSearch && matchesDepartment && matchesStatus;
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
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        return 0;
      });
    }

    return filtered;
  }, [employees, searchTerm, filterDepartment, sortConfig]);

  const handleSort = (key: keyof Employee) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getStatusBadge = (status: Employee['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-red-800 dark:text-gray-200',
      on_leave: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200',
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
      >
        {status && status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const handleAddEmployee = async () => {
    if (!validateFields()) return;
    console.log('ADDING NEW EMPLOYEE...');

    if (!newEmployee.firstName || !newEmployee.lastName) return;
    const payload: Omit<Employee, 'id'> = {
      firstName: newEmployee.firstName,
      lastName: newEmployee.lastName,
      email: newEmployee.email ?? '', // fallback to empty string if undefined
      phone: newEmployee.phone ?? '', // optional, default to empty string
      department: newEmployee.department ?? '',
      position: newEmployee.position ?? '',
      hireDate: newEmployee.hireDate ?? null, // explicitly allow null
      salary: newEmployee.salary ?? 0, // default to 0 if undefined
      status: newEmployee.status ?? 'active', // default to active
    };

    console.log('payload:', payload);

    try {
      const res = await createEmployee(payload);

      if (res.status === 429) {
        // const data = await res.json().catch(() => null);
        toast.error('Too many requests. Please try again later.');
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || 'Failed to add employee...');
        return;
      }

      const createdEmployee = await res.json();

      setEmployees([...employees, createdEmployee]);
      setIsFormModalOpen(false);
      setNewEmployee({});
      toast.success('Employee added successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to add employee...');
    }
  };

  const handleUpdateEmployee = async () => {
    console.log('UPDATING EMPLOYE...');
    console.log('editingEmployee', editingEmployee);
    if (!editingEmployee) return;
    if (!editingEmployee.firstName || !editingEmployee.lastName) return;
    if (!validateFields()) return;

    try {
      const res = await updateEmployee(editingEmployee.id, editingEmployee);
      if (res.status === 429) {
        // const data = await res.json().catch(() => null);
        toast.error('Too many requests. Please try again later.');
        return;
      }

      if (!res.ok) {
        // const data = await res.json().catch(() => null);
        toast.error('Failed to update employee...');
        return;
      }
      const updatedEmpRes = await res.json();
      const updatedEmp = updatedEmpRes.data;

      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) => (emp.id === updatedEmp.id ? updatedEmp : emp)),
      );
      // setEmployees(prev => {
      //   // Find the employee to update
      //   const empToUpdate = prev.find(emp => emp.id === editingEmployee.id);
      //   if (!empToUpdate) return prev;

      //   // Push previous state to undo stack once
      //   setUndoStack(stack => [
      //     ...stack,
      //     { type: "edit", employeeId: empToUpdate.id.toString(), previousData: empToUpdate }
      //   ]);

      //   // Return updated employees array
      //   return prev.map(emp =>
      //     emp.id === editingEmployee.id ? updatedEmp : emp
      //   );
      // });
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
    setEmployees((prev) => {
      const index = prev.findIndex((emp) => emp.id === id);
      const empToDelete = prev[index];

      // Schedule backend delete after 5 seconds
      const timeoutId = setTimeout(async () => {
        try {
          console.log('Deleting employee:', id);
          const res = await deleteEmployee(id);
          if (res.status === 429) {
            // const data = await res.json();
            toast.error('Too many requests. Please try again later.');
            return;
          }
          if (!res.ok) {
            // const data = await res.json().catch(() => null);
            toast.error('Failed to delete employee...');
            return;
          }

          setIsDeleteModalOpen(false);
          setDeletedEmployee(0);
          toast.success('Employee deleted successfully!');
        } catch (error) {
          console.error(error);
          toast.error('Failed to delete employee...');
        }
      }, 5000);

      setUndoStack((stack) => [
        ...stack,
        { type: 'delete', employeeId: id.toString(), previousData: empToDelete, index, timeoutId },
      ]);

      return prev.filter((emp) => emp.id !== id);
    });
    // try {
    //   console.log("Deleting employee:", id);
    //   const res = await deleteEmployee(id);
    //   if (res.status === 429) {
    //     // const data = await res.json();
    //     toast.error("Too many requests. Please try again later.");
    //     return;
    //   }
    //   if (!res.ok) {
    //     // const data = await res.json().catch(() => null);
    //     toast.error("Failed to delete employee...");
    //     return;
    //   }
    //   // setEmployees(prev => prev.filter(emp => emp.id !== id));

    //   setIsDeleteModalOpen(false);
    //   setDeletedEmployee(0);
    //   toast.success('Employee deleted successfully!');
    // } catch (error) {
    //   console.error(error);
    //   toast.error('Failed to delete employee...');
    // }
  };

  const handleImportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadExcel(file);
      const res = await uploadExcel(file);
      // console.log("res.json:", res.json())
      if (res.status === 429) {
        // const data = await res.json();
        toast.error('Too many requests. Please try again later.');
        return;
      }

      if (!res.ok) {
        toast.error('Failed to import Excel file...');
        return;
      }
      toast.success('Excel file imported successfully!');

      loadEmployees();

      // console.log("result------:", result)
      // setEmployees(result.result);
    } catch (error) {
      console.error(error);
      toast.error('Failed to import Excel file...');
    }
  };

  const handleExportFile = async () => {
    try {
      const res = await downloadExcel();
      if (res.status === 429) {
        // const data = await res.json();
        toast.error('Too many requests. Please try again later.');
        return;
      }

      if (!res.ok) {
        toast.error('Failed to export Excel file...');
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'employees.xlsx';
      a.click();
      a.remove();
      toast.success('Excel file exported successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to export Excel file...');
    }
  };

  function validateFields(): boolean {
    const newErrors: typeof errors = {};

    if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email?.trim()) newErrors.email = 'Email is required';
    if (!formData.department?.trim()) newErrors.department = 'Department is required';
    if (!formData.status) newErrors.status = 'Status is required';
    if (!formData.position?.trim()) newErrors.position = 'Position is required';
    // if (!formData.hireDate?.trim()) newErrors.hireDate = "Hire date is required";
    // if (!formData.salary) newErrors.salary = "Salary is required";

    // email format
    if (formData.email && !isValidEmail(formData.email)) newErrors.email = 'Invalid email';

    // phone format
    // if (formData.phone) {
    //   const phoneRegex = /^\(\d{3}\)-\d{3}-\d{4}$/;
    //   if (!phoneRegex.test(formData.phone)) {
    //     newErrors.phone = "Phone number must be in the format (xxx)-xxx-xxxx";
    //   }
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const undo = () => {
    setUndoStack((prevStack) => {
      if (prevStack.length === 0) return prevStack;

      const lastAction = prevStack[prevStack.length - 1];

      setEmployees((prevEmployees) => {
        if (lastAction.type === 'delete') {
          clearTimeout(lastAction.timeoutId);

          const newEmployees = [...prevEmployees];
          newEmployees.splice(lastAction.index, 0, lastAction.previousData);

          (async () => {
            try {
              const payload = lastAction.previousData;
              const res = await createEmployee(payload);

              if (res.status === 429) {
                toast.error('Too many requests. Please try again later.');
                return;
              }

              if (!res.ok) {
                const data = await res.json().catch(() => null);
                toast.error(data?.error || 'Failed to add employee...');
                return;
              }

              const createdEmployee = await res.json();
              console.log('Re-added employee:', createdEmployee);
            } catch (err) {
              console.error('Failed to re-add employee in backend', err);
            }
          })();

          return newEmployees;
        } else if (lastAction.type === 'edit') {
          return prevEmployees.map((emp) =>
            emp.id.toString() === lastAction.employeeId ? lastAction.previousData : emp,
          );
        }
        return prevEmployees;
      });

      // Remove last action from stack
      return prevStack.slice(0, -1);
    });
  };

  const formData = editingEmployee || newEmployee;
  return (
    <div className="space-y-6 rounded-2xl border border-zinc-200 bg-gradient-to-b from-white via-white to-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-zinc-300 dark:border-zinc-700">
        <button
          onClick={() => {
            setIsFormModalOpen(true);
            setEditingEmployee(null);
            setNewEmployee({});
            setErrors({});
          }}
          className="bg-blue-500 px-3 py-1 text-white rounded"
        >
          + Add Employee
        </button>

        <button onClick={undo} disabled={undoStack.length === 0}>
          Undo
        </button>
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={20} color="#9ca3af" />
          </div>

          <input
            type="text"
            placeholder="Search employees, email, department, position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white pl-10 pr-4 py-2 text-sm text-black placeholder-zinc-500 
                focus:border-black focus:outline-none focus:ring-2 focus:ring-black 
                dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400 dark:focus:border-zinc-500 dark:focus:ring-zinc-500"
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between">
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
              <option value="all">All</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
          {/* <div className="flex items-center gap-2">
          <label
            htmlFor="status-filter"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Status:
          </label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-500"
          >
            <option value="all">All</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div> */}

          <div className="flex flex-row gap-2">
            <input
              type="file"
              id="excelUpload"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleImportUpload}
            />

            <button
              onClick={() => document.getElementById('excelUpload')!.click()}
              className="px-3 py-1 text-white rounded flex items-center gap-2"
              style={{ backgroundColor: '#6366f1' }}
            >
              <Upload size={20} color="#FFFFFF" />
              <span>Upload</span>
            </button>
            <button
              onClick={handleExportFile}
              className="px-3 py-1 text-white rounded flex items-center gap-2"
              style={{ backgroundColor: '#8b5cf6' }}
            >
              {' '}
              <Download size={20} color="#FFFFFF" />
              <span>Download</span>
            </button>
          </div>
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
                  colSpan={9}
                  className="px-6 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400"
                >
                  {isLoading ? 'Loading employees...' : 'No employees found.'}
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
                  <TableCell value={employee.email} />
                  <TableCell value={employee.phone} formatter={formatPhone} />
                  <TableCell value={employee.department} />
                  <TableCell value={employee.position} />
                  <TableCell value={employee.hireDate} formatter={formatDate} />
                  <TableCell value={employee.salary} formatter={formatCurrency} />
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                    {getStatusBadge(employee.status)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-4">
                    <span
                      // className="rounded-md bg-blue-500 px-2 py-1 text-white hover:bg-blue-600"
                      className="cursor-pointer text-blue-500"
                      onClick={() => {
                        setEditingEmployee(employee);
                        setIsFormModalOpen(true);
                        setErrors({});
                      }}
                    >
                      edit
                    </span>
                    <span
                      // className="rounded-md bg-red-800 px-2 py-1 text-white hover:bg-red-600"
                      className="cursor-pointer text-red-700"
                      onClick={() => {
                        setDeletedEmployee(employee.id);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      delete
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="text-sm text-zinc-600 dark:text-zinc-400">
        Showing {filteredAndSortedEmployees.length} of {employees.length} employees
      </div>

      <div className="flex items-center justify-center space-x-4 mt-4">
        {/* Previous Arrow */}
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className={`p-1 rounded-full text-lg transition ${
            page === 1
              ? 'text-zinc-400 cursor-not-allowed'
              : 'text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white'
          }`}
        >
          <ArrowLeft size={24} />
        </button>

        {/* Page Info */}
        <span className="text-sm text-zinc-700 dark:text-zinc-300">
          <span className="font-semibold">{page}</span> /{' '}
          <span className="font-semibold">{totalPages}</span>
        </span>

        {/* Next Arrow */}
        <button
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
          className={`p-1 rounded-full text-lg transition ${
            page === totalPages
              ? 'text-zinc-400 cursor-not-allowed'
              : 'text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white'
          }`}
        >
          <ArrowRight size={24} />
        </button>
      </div>

      {/* <button 
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
      >
        Prev
      </button>

      <button 
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
      >
        Next
      </button> */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-md">
            <button
              onClick={() => setIsFormModalOpen(false)}
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
                      editingEmployee
                        ? setEditingEmployee({ ...editingEmployee, firstName: value })
                        : setNewEmployee({ ...newEmployee, firstName: value });
                    }}
                    className={`w-full rounded-lg border px-4 py-2 text-sm text-black placeholder-zinc-500
                  focus:outline-none focus:ring-2 focus:ring-black
                  dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400 dark:focus:border-zinc-500 dark:focus:ring-zinc-500
                  ${errors.firstName ? 'border-red-500' : 'border-zinc-700 dark:border-zinc-700 border-zinc-300 bg-white'}`}
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
                      editingEmployee
                        ? setEditingEmployee({ ...editingEmployee, lastName: value })
                        : setNewEmployee({ ...newEmployee, lastName: value });
                    }}
                    className={`w-full rounded-lg border px-4 py-2 text-sm text-black placeholder-zinc-500
                  focus:outline-none focus:ring-2 focus:ring-black
                  dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400 dark:focus:border-zinc-500 dark:focus:ring-zinc-500
                  ${errors.lastName ? 'border-red-500' : 'border-zinc-700 dark:border-zinc-700 border-zinc-300 bg-white'}`}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={14} color="red" />
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
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
                    editingEmployee
                      ? setEditingEmployee({ ...editingEmployee, email: value })
                      : setNewEmployee({ ...newEmployee, email: value });
                  }}
                  className={`w-full rounded-lg border px-4 py-2 text-sm text-black placeholder-zinc-500
                focus:outline-none focus:ring-2 focus:ring-black
                dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400 dark:focus:border-zinc-500 dark:focus:ring-zinc-500
                ${errors.email ? 'border-red-500' : 'border-zinc-700 dark:border-zinc-700 border-zinc-300 bg-white'}`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={14} color="red" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
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
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-black placeholder-zinc-500 focus:border-black focus:outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400 dark:focus:border-zinc-500 dark:focus:ring-zinc-500"
                />
              </div>

              {/* Department */}
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
                    editingEmployee
                      ? setEditingEmployee({ ...editingEmployee, department: value })
                      : setNewEmployee({ ...newEmployee, department: value });
                  }}
                  className={`w-full rounded-lg border px-4 py-2 text-sm text-black placeholder-zinc-500
                  focus:outline-none focus:ring-2 focus:ring-black
                  dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400 dark:focus:border-zinc-500 dark:focus:ring-zinc-500
                  ${errors.department ? 'border-red-500' : 'border-zinc-700 dark:border-zinc-700 border-zinc-300 bg-white'}`}
                >
                  <option value="">Select</option>
                  <option value="accounting">Accounting</option>
                  <option value="administration">Administration</option>
                  <option value="customer_support">Customer Support</option>
                  <option value="design">Design</option>
                  <option value="engineering">Engineering</option>
                  <option value="finance">Finance</option>
                  <option value="hr">Human Resources</option>
                  <option value="it">Information Technology</option>
                  <option value="legal">Legal</option>
                  <option value="marketing">Marketing</option>
                  <option value="operations">Operations</option>
                  <option value="sales">Sales</option>
                  <option value="security">Security</option>
                </select>
                {errors.department && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={14} color="red" />
                    {errors.department}
                  </p>
                )}
              </div>

              {/* Position */}
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
                    editingEmployee
                      ? setEditingEmployee({ ...editingEmployee, position: value })
                      : setNewEmployee({ ...newEmployee, position: value });
                  }}
                  className={`w-full rounded-lg border px-4 py-2 text-sm text-black placeholder-zinc-500
                focus:outline-none focus:ring-2 focus:ring-black
                dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400 dark:focus:border-zinc-500 dark:focus:ring-zinc-500
                ${errors.position ? 'border-red-500' : 'border-zinc-700 dark:border-zinc-700 border-zinc-300 bg-white'}`}
                />
                {errors.position && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={14} color="red" />
                    {errors.position}
                  </p>
                )}
              </div>

              {/* Hire Date */}
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

              {/* Salary */}
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
                    editingEmployee
                      ? setEditingEmployee({ ...editingEmployee, salary: value })
                      : setNewEmployee({ ...newEmployee, salary: value });
                  }}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-black placeholder-zinc-500 focus:border-black focus:outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400 dark:focus:border-zinc-500 dark:focus:ring-zinc-500"
                />
              </div>

              {/* Status */}
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
                    editingEmployee
                      ? setEditingEmployee({ ...editingEmployee, status: value })
                      : setNewEmployee({ ...newEmployee, status: value });
                  }}
                  className={`w-full rounded-lg border px-4 py-2 text-sm text-black placeholder-zinc-500
                  focus:outline-none focus:ring-2 focus:ring-black
                  dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400 dark:focus:border-zinc-500 dark:focus:ring-zinc-500
                  ${errors.status ? 'border-red-500' : 'border-zinc-700 dark:border-zinc-700 border-zinc-300 bg-white'}`}
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

            {/* Buttons */}
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
          <div className="relative bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-md">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              aria-label="Close"
            >
              <X size={24} color="#FFFFFF" />
            </button>
            <h2 className="text-lg font-bold mb-4">Are you sure you want to delete?</h2>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="bg-gray-500 px-3 py-1 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletedEmployee)}
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
