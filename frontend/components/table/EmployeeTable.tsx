'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import type { Employee } from '@/types/Employee';
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
  ArrowLeft,
  ArrowRight,
  Search,
  Upload,
  Download,
} from '@deemlol/next-icons';
import { formatCurrency } from '@/utils/formatCurrency';
import { getStatusBadge } from '@/utils/getStatusBadge';
import { formatDate } from '@/utils/formatDate';
import { TableCell } from './TableCell';
import { Action } from '@/types/Action';
import { FormModal } from '../modals/FormModal';
import { DeleteModal } from '../modals/DeleteModal';
import { departmentOptions } from '@/constants/departments';

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
  // const [pendingDeletes, setPendingDeletes] = useState<Record<number, PendingDelete>>({});
  const pendingDeletesRef = useRef<Set<number>>(new Set());


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
  }, [page, pageSize, filterDepartment, sortConfig]); // search


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

    // console.log('payload:', payload);

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
    // console.log('UPDATING EMPLOYE...');
    // console.log('editingEmployee', editingEmployee);
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
      setIsFormModalOpen(false);
      setEditingEmployee(null);
      setNewEmployee({});
      toast.success('Employee updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update employee...');
    }
  };

  const handleDelete = (id: number) => {
    setEmployees((prev) => {
      const index = prev.findIndex((emp) => emp.id === id);
      if (index === -1) return prev;
      const empToDelete = prev[index];
      const updated = prev.filter((emp) => emp.id !== id);
      setIsDeleteModalOpen(false);
      setDeletedEmployee(0);
  
      // this employee is a pending delte
      pendingDeletesRef.current.add(id);
  
      toast.success(
        (t) => (
          <div className="flex items-center gap-3">
            <span>Employee deleted successfully!</span>
            <button
              onClick={() => {
                undo(); 
                toast.dismiss(t.id);
              }}
              className="rounded bg-zinc-800 px-2 py-1 text-xs text-white"
            >
              Undo
            </button>
          </div>
        ),
        { duration: 5000 }
      );
  
      // schedule backend delete after 7 seconds
      const timeoutId = setTimeout(async () => {
        if (!pendingDeletesRef.current.has(id)) {
          // console.log("delete canceled...");
          return;
        }
        pendingDeletesRef.current.delete(id);
        try {
          console.log("Deleting employee:", id);
          const res = await deleteEmployee(id);
  
          if (res.status === 429) {
            toast.error("Too many requests. Please try again later.");
            return;
          }
  
          if (!res.ok) {
            toast.error("Failed to delete employee...");
            return;
          }
        } catch (error) {
          console.error(error);
          toast.error("Failed to delete employee...");
        } finally {
          setUndoStack((stack) =>
            stack.filter((action) => action.employeeId !== id)
          );
        }
      }, 7000);
  
      // push action onto undo stack
      setUndoStack((stack) => [
        ...stack,
        {
          type: "delete" as const,
          employeeId: id,
          previousData: empToDelete,
          index,
          timeoutId,
        },
      ]);
  
      return updated;
    });
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
    if (formData.phone) {
      const digitsOnly = formData.phone.replace(/\D/g, ""); 
      if (digitsOnly.length !== 10) {
        newErrors.phone = "Phone number must be 10 digits long";
      }
    }
    

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const undo = () => {
    setUndoStack((prevStack) => {
      if (prevStack.length === 0) return prevStack;
  
      const lastAction = prevStack[prevStack.length - 1];
  
      if (lastAction.type === "delete") {
        const { employeeId, timeoutId, previousData, index } = lastAction;
  
        pendingDeletesRef.current.delete(employeeId);
        clearTimeout(timeoutId);
        setEmployees((prevEmployees) => {
          if (prevEmployees.some((e) => e.id === previousData.id)) {
            return prevEmployees; 
          }
          const newEmployees = [...prevEmployees];
          newEmployees.splice(index, 0, previousData);
          return newEmployees;
        });
        toast.success("Undo successful! Employee restored.", {
          duration: 3000,
        });
      }
  
      // remove last action from undo stack
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

        {/* <button onClick={undo} disabled={undoStack.length === 0}>
          Undo
        </button> */}
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
              {departments.map((dept) => {
                const option = departmentOptions.find((opt) => opt.value === dept);

                return (
                  <option key={dept} value={dept}>
                    {option?.label ?? dept}
                  </option>
                );
              })}
            </select>
          </div>
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
                      Edit
                    </span>
                    <span
                      // className="rounded-md bg-red-800 px-2 py-1 text-white hover:bg-red-600"
                      className="cursor-pointer text-red-700"
                      onClick={() => {
                        setDeletedEmployee(employee.id);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      Delete
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

        <span className="text-sm text-zinc-700 dark:text-zinc-300">
          <span className="font-semibold">{page}</span> /{' '}
          <span className="font-semibold">{totalPages}</span>
        </span>
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
      <FormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        formData={formData}
        errors={errors}
        editingEmployee={editingEmployee}
        newEmployee={newEmployee}
        setEditingEmployee={setEditingEmployee}
        setNewEmployee={setNewEmployee}
        onSubmitAdd={handleAddEmployee}
        onSubmitUpdate={handleUpdateEmployee}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => handleDelete(deletedEmployee)}
        title="Are you sure you want to delete?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </div>
  );
}
