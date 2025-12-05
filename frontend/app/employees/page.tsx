import { EmployeeTable } from '@/components/EmployeeTable';

export const metadata = {
  title: 'Employees | Employee Tracker',
  description: 'View and manage employees',
};

export default function EmployeesPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">Employees</h1>
          <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
            Manage your employee database
          </p>
        </div>
        <EmployeeTable />
      </main>
    </div>
  );
}
