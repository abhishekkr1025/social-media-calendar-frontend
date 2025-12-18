// Sidebar.jsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Plus, Trash2 } from "lucide-react";

export default function Sidebar({
  clients,
  posts,
  selectedClient,
  setSelectedClient,
  newClient,
  setNewClient,
  showAddClient,
  setShowAddClient,
  addClient,
  deleteClient,
}) {
  return (
    <div className="w-64 fixed left-0 top-0 h-full bg-white border-r shadow-sm p-4 overflow-y-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Clients</CardTitle>
            <Button
              size="sm"
              onClick={() => setShowAddClient(true)}
              className="gap-1"
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          {showAddClient && (
            <div className="flex gap-2 mb-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <Input
                placeholder="Client name"
                value={newClient}
                onChange={(e) => setNewClient(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addClient()}
              />
              <Button size="sm" onClick={addClient}>
                Add
              </Button>
            </div>
          )}

          <Button
            variant={selectedClient === null ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setSelectedClient(null)}
          >
            All Clients ({posts.length})
          </Button>

          {clients.map((client) => (
            <div key={client.id} className="flex items-center gap-2 group">
              <Button
                variant={
                  selectedClient?.id === client.id ? "default" : "ghost"
                }
                className="flex-1 justify-start"
                onClick={() => setSelectedClient(client)}
              >
                {client.name} (
                {posts.filter((p) => p.clientId === client.id).length})
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => deleteClient(client.id)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}

          {clients.length === 0 && !showAddClient && (
            <p className="text-sm text-gray-500 text-center py-4">
              No clients yet. Add one to get started!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
