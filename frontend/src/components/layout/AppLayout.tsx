import { Outlet } from "react-router-dom";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
