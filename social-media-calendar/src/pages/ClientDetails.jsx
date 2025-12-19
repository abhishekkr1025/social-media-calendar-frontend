import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Button } from "@/components/ui/button.jsx";

const BASE_URL = "https://prod.panditjee.com";

export default function ClientDetails() {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", email: "" });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/clients`);
      const data = await res.json();
      setClients(data);
      setFilteredClients(data);
    } catch (error) {
      console.error("Failed to fetch clients", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const value = search.toLowerCase();
    setFilteredClients(
      clients.filter(
        (c) =>
          c.name.toLowerCase().includes(value) ||
          c.email.toLowerCase().includes(value)
      )
    );
  };

  const handleReset = () => {
    setSearch("");
    setFilteredClients(clients);
  };

  const handleAddClient = async () => {
    if (!newClient.name || !newClient.email) {
      alert("Name and Email required");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient),
      });

      if (!res.ok) throw new Error("Failed to add client");

      await fetchClients();
      setNewClient({ name: "", email: "" });
      setShowAdd(false);
    } catch (err) {
      console.error("Add client failed", err);
      alert("Failed to add client");
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-col gap-4">
       <div className="flex items-center w-full">
  <CardTitle className="text-xl">Client Details</CardTitle>

  <Button
    className="ml-auto"
    onClick={() => setShowAdd(!showAdd)}
  >
    {showAdd ? "Cancel" : "Add Client"}
  </Button>
</div>


          <div className="flex gap-2">
            <Input
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button onClick={handleSearch}>Search</Button>
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
          </div>

          {showAdd && (
            <div className="flex gap-2">
              <Input
                placeholder="Client name"
                value={newClient.name}
                onChange={(e) =>
                  setNewClient({ ...newClient, name: e.target.value })
                }
              />
              <Input
                placeholder="Client email"
                value={newClient.email}
                onChange={(e) =>
                  setNewClient({ ...newClient, email: e.target.value })
                }
              />
              <Button onClick={handleAddClient}>Save</Button>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <p className="p-4 text-gray-500">Loading clients...</p>
          ) : filteredClients.length === 0 ? (
            <p className="p-4 text-gray-500">No clients found</p>
          ) : (
            <div className="flex flex-col md:flex-row">
              {/* Left: Client Details Table */}
              <div className="flex-1">
                {/* <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Joined On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{client.id}</td>
                        <td className="px-4 py-3 font-medium">{client.name}</td>
                        <td className="px-4 py-3">{client.email}</td>
                        <td className="px-4 py-3">
                          {new Date(client.joined_on).toLocaleDateString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table> */}
                <table className="w-full text-sm border-collapse">
  <thead className="bg-gray-50 border-b">
    <tr>
      <th className="px-4 py-3 text-left w-16">ID</th>
      <th className="px-4 py-3 text-left w-48">Name</th>
      <th className="px-4 py-3 text-left">Email</th>
      <th className="px-4 py-3 text-left w-40">Joined On</th>
    </tr>
  </thead>

  <tbody>
    {filteredClients.map((client) => (
      <tr
        key={client.id}
        className="border-b hover:bg-gray-50"
      >
        <td className="px-4 py-3 text-left">
          {client.id}
        </td>

        <td className="px-4 py-3 font-medium text-left">
          {client.name}
        </td>

        <td className="px-4 py-3 text-left text-gray-700 break-all">
          {client.email}
        </td>

        <td className="px-4 py-3 text-left whitespace-nowrap">
          {new Date(client.joined_on).toLocaleDateString("en-IN")}
        </td>
      </tr>
    ))}
  </tbody>
</table>

              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
