import { EmployeeTable } from '@/components/table/EmployeeTable';
import { Toaster } from 'react-hot-toast';
import EmployeeCharts from '@/components/EmployeeCharts';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full flex flex-col items-center py-32 px-32 bg-white dark:bg-black">
        <div>hello world</div>{/* <EmployeeCharts />
        <div className="mt-6 w-full">
          <EmployeeTable />
        </div>

        <Toaster position="bottom-right" /> */}
      </main>
    </div>
  );
}
