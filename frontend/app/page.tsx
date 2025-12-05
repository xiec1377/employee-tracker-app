import Image from "next/image";
import Link from "next/link";
import { EmployeeTable } from "@/components/EmployeeTable";
import { Toaster } from "react-hot-toast";
import EmployeeCharts from "@/components/EmployeeCharts";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full flex flex-col items-center py-32 px-32 bg-white dark:bg-black">
        <EmployeeCharts />
        <div className="mt-6 w-full">
          <EmployeeTable />
        </div>

        <Toaster position="bottom-right" />
      </main>
    </div>
  );
}





  {/* <div className="flex min-h-screen justify-center bg-zinc-50 font-sans dark:bg-black">
  <main className="flex w-full max-w-3xl flex-col items-center  py-32 px-16 bg-white dark:bg-black"> */}