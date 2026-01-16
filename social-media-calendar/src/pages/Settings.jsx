import {
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Divider,
  Button,
} from "@mui/material";
import { useState } from "react";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [compactSidebar, setCompactSidebar] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Settings
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Manage your application preferences
        </p>
      </div>

      {/* ===== Appearance Settings ===== */}
      <Card className="rounded-xl shadow-sm">
        <CardContent className="space-y-4">
          <h3 className="text-lg font-medium">Appearance</h3>

          <Divider />

          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
            }
            label="Dark Mode"
          />

          <FormControlLabel
            control={
              <Switch
                checked={compactSidebar}
                onChange={() => setCompactSidebar(!compactSidebar)}
              />
            }
            label="Compact Sidebar by default"
          />
        </CardContent>
      </Card>

      {/* ===== Account Settings ===== */}
      <Card className="rounded-xl shadow-sm">
        <CardContent className="space-y-4">
          <h3 className="text-lg font-medium">Account</h3>

          <Divider />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email</p>
              <p className="text-sm text-gray-500">user@example.com</p>
            </div>

            <Button variant="outlined">Change</Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-gray-500">Last updated 2 months ago</p>
            </div>

            <Button variant="outlined">Update</Button>
          </div>
        </CardContent>
      </Card>

      {/* ===== Danger Zone ===== */}
      <Card className="rounded-xl border border-red-200">
        <CardContent className="space-y-4">
          <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>

          <Divider />

          <Button color="error" variant="contained">
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
