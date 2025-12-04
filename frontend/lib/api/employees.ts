import type { Employee } from '@/types/employee';

const API_BASE_URL = 'http://localhost:8000/api'; // process.env.NEXT_PUBLIC_API_URL || ;

export async function fetchAllEmployees(): Promise<Employee[]> {
  console.log("fetching all employees...")
  try {
    const response = await fetch(`${API_BASE_URL}/employees/all/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // caching the response for 60 seconds
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch employees: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
}

export async function fetchEmployeeById(id: number): Promise<Employee> {
  try {
    const response = await fetch(`${API_BASE_URL}/employees/${id}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch employee: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching employee ${id}:`, error);
    throw error;
  }
}

export async function createEmployee(employeeData: Omit<Employee, 'id'>): Promise<Employee> {
  console.log("creating employee... with data", employeeData)
  try {
    const response = await fetch(`${API_BASE_URL}/employees/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employeeData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create employee: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating employee:', error);
    throw error;
  }
}

export async function updateEmployee(id: number, employeeData: Partial<Employee>): Promise<Employee> {
  try {
    const response = await fetch(`${API_BASE_URL}/employees/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employeeData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update employee: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error updating employee ${id}:`, error);
    throw error;
  }
}

export async function deleteEmployee(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/employees/${id}/`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete employee: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`Error deleting employee ${id}:`, error);
    throw error;
  }
}

