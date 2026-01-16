import { useState } from "react";
import { Outlet } from "react-router-dom";
import { IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar from "@/components/Sidebar";

export default function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">

            {/* ================= HEADER ================= */}
            <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
                <div className="flex items-center justify-between bg-black text-white px-6 py-4 w-full">
                    <div className="flex items-center gap-3">
                        <IconButton
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            sx={{ color: "white" }}
                        >
                            <MenuIcon />
                        </IconButton>

                        <h1 className="text-xl font-semibold">Social Media Calendar</h1>
                    </div>
                </div>
            </header>

            {/* ============== BODY (Sidebar + Content) ============== */}
            <div className="flex flex-1 overflow-hidden">

                {/* Sidebar */}
                <div
                    className={`shrink-0 border-r bg-black text-white transition-all duration-300 ${sidebarOpen ? "w-[240px]" : "w-[64px]"
                        }`}
                >
                    <Sidebar collapsed={!sidebarOpen} />
                </div>


                {/* Main Content */}
                <main className="flex-1 overflow-y-auto px-6 py-6">
                    <Outlet />
                </main>
            </div>

        </div>
    );
}
