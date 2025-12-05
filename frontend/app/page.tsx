import Image from "next/image";
import Link from "next/link";
import { EmployeeTable } from "@/components/EmployeeTable";
import { Toaster } from "react-hot-toast";

export default function Home() {
  return (
    <div className="flex min-h-screen justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col items-center  py-32 px-16 bg-white dark:bg-black">
        <EmployeeTable />
        <Toaster position="bottom-right" />
      </main>
    </div>
  );
}
