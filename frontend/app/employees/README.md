# Employee Table Structure

This directory contains the employee table implementation for the Next.js application.

## File Structure

```
frontend/
├── app/
│   └── employees/
│       ├── page.tsx          # Main page component
│       └── README.md         # This file
├── components/
│   └── EmployeeTable.tsx     # Reusable employee table component
├── types/
│   └── employee.ts           # TypeScript type definitions
└── lib/
    └── api/
        └── employees.ts      # API utility functions
```

## Components

### `EmployeeTable` Component

A fully-featured employee table component with:
- **Search functionality**: Filter employees by any field
- **Department filtering**: Filter by specific department
- **Sorting**: Click column headers to sort (ascending/descending)
- **Responsive design**: Works on mobile, tablet, and desktop
- **Dark mode support**: Automatic dark mode styling
- **Status badges**: Visual indicators for employee status
- **Currency formatting**: Properly formatted salary display
- **Date formatting**: Human-readable date formats

### Features

1. **Client-side filtering and sorting**: Fast, instant results
2. **Type-safe**: Full TypeScript support
3. **Accessible**: Proper semantic HTML and ARIA labels
4. **Modern UI**: Clean design using Tailwind CSS

## Usage

### Basic Usage (Mock Data)

The component currently uses mock data. To use it:

```tsx
import { EmployeeTable } from '@/components/EmployeeTable';

export default function EmployeesPage() {
  return <EmployeeTable />;
}
```

### Using Real API Data

To connect to your backend API:

1. **Update the EmployeeTable component** to fetch data:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { fetchEmployees } from '@/lib/api/employees';
import type { Employee } from '@/types/employee';

export function EmployeeTable() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEmployees() {
      try {
        setLoading(true);
        const data = await fetchEmployees();
        setEmployees(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load employees');
      } finally {
        setLoading(false);
      }
    }

    loadEmployees();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // ... rest of component
}
```

2. **Or use Server Components** (recommended for Next.js 13+):

```tsx
// app/employees/page.tsx
import { fetchEmployees } from '@/lib/api/employees';
import { EmployeeTable } from '@/components/EmployeeTable';

export default async function EmployeesPage() {
  const employees = await fetchEmployees();

  return <EmployeeTable initialEmployees={employees} />;
}
```

## Employee Type Definition

```typescript
interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  hireDate: string; // ISO date string
  salary?: number;  // Optional
  status: 'active' | 'inactive' | 'on_leave';
}
```

## API Integration

The `lib/api/employees.ts` file provides utility functions for:
- `fetchEmployees()` - Get all employees
- `fetchEmployeeById(id)` - Get single employee
- `createEmployee(data)` - Create new employee
- `updateEmployee(id, data)` - Update employee
- `deleteEmployee(id)` - Delete employee

Set the `NEXT_PUBLIC_API_URL` environment variable to configure the API endpoint.

## Customization

### Styling
The component uses Tailwind CSS and follows the existing design system. Colors and spacing can be customized by modifying the Tailwind classes.

### Adding Columns
1. Update the `Employee` type in `types/employee.ts`
2. Add table header in `EmployeeTable.tsx`
3. Add table cell with employee data
4. Optionally add sorting functionality

### Modifying Filters
Add new filter controls in the component's search/filter section and update the `filteredAndSortedEmployees` useMemo hook.

## Next Steps

1. Connect to your Django backend API
2. Add pagination for large datasets
3. Add edit/delete functionality
4. Add form for creating new employees
5. Add export functionality (CSV, PDF)
6. Add bulk actions

