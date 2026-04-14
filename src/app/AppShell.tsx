import { Outlet } from "react-router-dom";
import { Sidebar } from "@/app/Sidebar";
import { Header } from "@/app/Header";

export function AppShell() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
