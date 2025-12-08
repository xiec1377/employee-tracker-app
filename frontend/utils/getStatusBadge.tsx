import type { Employee } from "@/types/Employee";

export function getStatusBadge(status: Employee["status"]) {
  const styles: Record<Employee["status"], string> = {
    active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    inactive: "bg-gray-100 text-gray-800 dark:bg-red-800 dark:text-gray-200",
    on_leave: "bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {status.replace("_", " ").toUpperCase()}
    </span>
  );
}
