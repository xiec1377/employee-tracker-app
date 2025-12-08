import type { Employee } from '@/types/employee';

const API_BASE_URL = "https://employee-tracker-app-75l7.onrender.com/api"; // process.env.NEXT_PUBLIC_API_URL || ;


// switch between local and prod backend url
// const API_BASE_URL = 
//   window.location.hostname === "localhost"
//     ? "http://localhost:8000/api"
//     : "https://employee-tracker-app-75l7.onrender.com/api";



// export async function fetchEmployees(params: {
//   page: number;
//   page_size: number;
//   search?: string;
//   department?: string;
//   ordering?: string;
// }) {
//   try {
//     const query = new URLSearchParams();
//     console.log('page:', String(params.page));
//     console.log('page size;', String(params.page_size));

//     query.set('page', String(params.page));
//     query.set('page_size', String(params.page_size));

//     if (params.search) query.set('search', params.search);
//     if (params.department) query.set('department', params.department);
//     if (params.ordering) query.set('ordering', params.ordering);

//     const res = await fetch(`${API_BASE_URL}/employees/all?${query.toString()}`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });
//     console.log("Res:", res.json())
//     return res;
//   } catch (error) {
//     console.error('Error fetching employees:', error);
//     throw error;
//   }
// }

export async function fetchEmployees(params: {
  page: number;
  page_size: number;
  search?: string;
  department?: string;
  ordering?: string;
}) {
  try {
    const query = new URLSearchParams();
    console.log('page:', String(params.page));
    console.log('page size;', String(params.page_size));

    query.set('page', String(params.page));
    query.set('page_size', String(params.page_size));

    if (params.search) query.set('search', params.search);
    if (params.department) query.set('department', params.department);
    if (params.ordering) query.set('ordering', params.ordering);

    const res = await fetch(`${API_BASE_URL}/employees/all/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 },
    });
    return res;
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
}

export async function fetchAllEmployees(): Promise<Response> {
  console.log('fetching all employees...');
  try {
    const res = await fetch(`${API_BASE_URL}/employees/all/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // caching the response for 60 seconds
      next: { revalidate: 60 },
    });
    return res;
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
}

export async function fetchEmployeeById(id: number): Promise<Response> {
  try {
    const res = await fetch(`${API_BASE_URL}/employees/${id}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return res;
  } catch (error) {
    console.error(`Error fetching employee ${id}:`, error);
    throw error;
  }
}

export async function createEmployee(employeeData: Omit<Employee, 'id'>): Promise<Response> {
  console.log('creating employee... with data', employeeData);
  try {
    const res = await fetch(`${API_BASE_URL}/employees/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employeeData),
    });
    return res;
  } catch (error) {
    console.error('Error creating employee:', error);
    throw error;
  }
}

export async function updateEmployee(
  id: number,
  employeeData: Partial<Employee>,
): Promise<Response> {
  try {
    const res = await fetch(`${API_BASE_URL}/employees/${id}/edit/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employeeData),
    });
    return res;
  } catch (error) {
    console.error(`Error updating employee ${id}:`, error);
    throw error;
  }
}

export async function deleteEmployee(id: number): Promise<Response> {
  try {
    const res = await fetch(`${API_BASE_URL}/employees/${id}/`, {
      method: 'DELETE',
    });
    return res;
  } catch (error) {
    console.error(`Error deleting employee ${id}:`, error);
    throw error;
  }
}

export async function uploadExcel(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE_URL}/employees/import/`, {
    method: 'POST',
    body: formData,
  });
  // console.log('res import:', res);
  return res;
}

export async function downloadExcel() {
  const res = await fetch(`${API_BASE_URL}/employees/export/`, {
    method: 'GET',
  });
  // console.log("res:", res)
  return res;
}
