interface TableCellProps {
    value: string | number | null | undefined;
    formatter?: (value: any) => string;
  }
  
  export function TableCell({ value, formatter }: TableCellProps) {
    const safeValue =
      value === "" || value === null || value === undefined ? "—" : value;
  
    const formatted =
      safeValue === "—" ? "—" : formatter ? formatter(safeValue) : safeValue;
  
    const isPlaceholder = formatted === "—";
  
    return (
      <td
        className={`whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400 ${
          isPlaceholder ? "text-center" : ""
        }`}
      >
        {formatted}
      </td>
    );
  }
  