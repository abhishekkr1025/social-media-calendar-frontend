import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { User, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ isCollapsed, toggleSidebar }) {
  const navigate = useNavigate();

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-white border-r shadow-sm
        transition-all duration-300
        ${isCollapsed ? "w-16" : "w-64"}
      `}
    >
      {/* 🔹 MENU BUTTON (always visible) */}
      <div className="flex items-center justify-center h-14 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <Menu className="w-6 h-6" />
        </Button>
      </div>

      {/* 🔹 COLLAPSED VIEW */}
      {isCollapsed && (
        <div className="flex flex-col items-center mt-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/client-details")}
          >
            <User className="w-6 h-6" />
          </Button>
        </div>
      )}

      {/* 🔹 EXPANDED VIEW */}
      {!isCollapsed && (
        <Card className="m-4">
          <CardHeader>
            <CardTitle className="text-lg">Navigation</CardTitle>
          </CardHeader>

          <CardContent>
            <Button
              className="w-full justify-start gap-2"
              onClick={() => navigate("/client-details")}
            >
              <User className="w-4 h-4" />
              Client Details
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
