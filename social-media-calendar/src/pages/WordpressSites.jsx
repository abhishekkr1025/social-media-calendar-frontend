import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function WordPressSites() {
    const [sites, setSites] = useState([]);
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState("all");
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({
        client_id: "",
        site_url: "",
        site_path: "",
        language: "",
        username: "",
        app_password: "",
        default_media_id: ""
    });
    const [editSite, setEditSite] = useState(null);
    const [syncingId, setSyncingId] = useState(null);
    const navigate = useNavigate();




    useEffect(() => {
        fetchAll();
    }, []);

    const BASE_URL = 'https://prod.panditjee.com'
    // const BASE_URL = 'http://localhost:5000'

    async function fetchAll() {
        try {
            setLoading(true);

            const [sitesRes, clientsRes] = await Promise.all([
                fetch(`${BASE_URL}/api/wordpress-sites`),
                fetch(`${BASE_URL}/api/clients`)
            ]);

            const sitesData = await sitesRes.json();
            const clientsData = await clientsRes.json();

            setSites(sitesData);
            setClients(clientsData);
        } catch (err) {
            console.error("Failed to load WordPress sites", err);
        } finally {
            setLoading(false);
        }
    }

    async function createSite() {
        await fetch(`${BASE_URL}/api/add/wordpress-sites`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
        });
        setShowAdd(false);
        fetchAll();
    }

    async function updateSite() {
        if (!editSite) return;

        await fetch(`${BASE_URL}/api/wordpress-sites/${editSite.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                client_id: editSite.client_id,
                site_url: editSite.site_url,
                site_path: editSite.site_path,
                language: editSite.language,
                username: editSite.username,
                app_password: editSite.app_password,
                default_media_id: editSite.default_media_id
            })
        });

        setEditSite(null);
        fetchAll();
    }


    async function testConnection(id) {
        const res = await fetch(
            `${BASE_URL}/api/wordpress-sites/${id}/test`,
            { method: "POST" }
        );
        const data = await res.json();
        alert(data.success ? "Connection OK" : "Connection Failed");
    }




    function openEdit(site) {
        setEditSite({
            ...site,
            app_password: "" // 🔒 never prefill password
        });
    }

    async function syncCategories(id) {
        setSyncingId(id);
        try {
            const res = await fetch(
                `${BASE_URL}/api/wordpress-sites/${id}/sync-categories`,
                { method: "POST" }
            );
            const data = await res.json();
            alert(data.success ? "Synced!" : "Failed!");
        } catch (err) {
            alert("Error syncing");
        } finally {
            setSyncingId(null);
        }
    }




    const filteredSites =
        selectedClient === "all"
            ? sites
            : sites.filter(s => String(s.client_id) === selectedClient);

    return (
        <div className="p-6">
            <h1 className="text-xl font-semibold mb-4">WordPress Sites</h1>

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Left: Client Filter */}
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">
                        Client
                    </label>

                    <select
                        className="border rounded px-3 py-2 text-sm min-w-[200px]"
                        value={selectedClient}
                        onChange={e => setSelectedClient(e.target.value)}
                    >
                        <option value="all">All Clients</option>
                        {clients.map(client => (
                            <option key={client.id} value={client.id}>
                                {client.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Right: Add Button */}
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium whitespace-nowrap"
                    onClick={() => setShowAdd(true)}
                >
                    + Connect WordPress Site
                </button>
            </div>





            {loading ? (
                <p className="text-gray-500 text-sm">Loading...</p>
            ) : filteredSites.length === 0 ? (
                <p className="text-gray-500 text-sm">No WordPress sites found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-gray-200">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-2 text-left">Client</th>
                                <th className="px-4 py-2 text-left">Site</th>
                                <th className="px-4 py-2 text-left">Language</th>
                                <th className="px-4 py-2 text-left">Username</th>
                                <th className="px-4 py-2 text-left">Media ID</th>
                                <th className="px-4 py-2 text-left">Connected On</th>
                                <th className="px-4 py-2 text-left">Actions</th>


                            </tr>
                        </thead>

                        <tbody>
                            {filteredSites.map(site => (
                                <tr
                                    key={site.id}
                                    className="border-b hover:bg-gray-50"
                                >

                                    <td className="px-4 py-2">
                                        {site.client_name}
                                    </td>

                                    <td className="px-4 py-2">
                                        <a
                                            href={`${site.site_url}${site.site_path || ""}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            {site.site_url}
                                            {site.site_path || ""}
                                        </a>
                                    </td>

                                    <td className="px-4 py-2">
                                        {site.language}
                                    </td>

                                    <td className="px-4 py-2">
                                        {site.username}
                                    </td>

                                    <td className="px-4 py-2">
                                        {site.default_media_id}
                                    </td>

                                    <td className="px-4 py-2 text-gray-600">
                                        {new Date(site.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-2 flex gap-2">
                                        <button
                                            className="text-blue-600 hover:underline"
                                            onClick={() => openEdit(site)}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="text-green-600 hover:underline"
                                            onClick={() => testConnection(site.id)}
                                        >
                                            Test
                                        </button>

                                        <button
                                            disabled={syncingId === site.id}
                                            className="text-purple-600 hover:underline disabled:text-gray-400"
                                            onClick={() => syncCategories(site.id)}
                                        >
                                            {syncingId === site.id ? "Syncing..." : "Sync Categories"}
                                        </button>

                                        <button
                                            className="text-indigo-600 hover:underline"
                                            onClick={() =>
                                                navigate(`/wordpress-sites/${site.id}/categories`)
                                            }
                                        >
                                            View
                                        </button>


                                        {/* <button
                                            className={`hover:underline ${site.is_default ? "text-yellow-600 font-semibold" : "text-gray-500"
                                                }`}
                                            onClick={() => setDefault(site.id)}
                                        >
                                            {site.is_default ? "Default" : "Set Default"}
                                        </button> */}
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showAdd && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded p-6 w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-4">Connect WordPress Site</h2>

                        <select
                            className="w-full border p-2 mb-2"
                            onChange={e => setForm({ ...form, client_id: e.target.value })}
                        >
                            <option>Select Client</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>

                        <input
                            placeholder="Site URL"
                            className="w-full border p-2 mb-2"
                            onChange={e => setForm({ ...form, site_url: e.target.value })}
                        />

                        <input
                            placeholder="Site Path (optional)"
                            className="w-full border p-2 mb-2"
                            onChange={e => setForm({ ...form, site_path: e.target.value })}
                        />

                        <input
                            placeholder="Username"
                            className="w-full border p-2 mb-2"
                            onChange={e => setForm({ ...form, username: e.target.value })}
                        />

                        <input
                            placeholder="App Password"
                            className="w-full border p-2 mb-2"
                            onChange={e => setForm({ ...form, app_password: e.target.value })}
                        />

                        <input
                            placeholder="Language"
                            className="w-full border p-2 mb-2"
                            onChange={e => setForm({ ...form, language: e.target.value })}
                        />

                        <input
                            placeholder="Default Media ID"
                            className="w-full border p-2 mb-4"
                            onChange={e => setForm({ ...form, default_media_id: e.target.value })}
                        />

                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowAdd(false)}>Cancel</button>
                            <button
                                className="bg-purple-600 text-white px-4 py-2 rounded"
                                onClick={createSite}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {editSite && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded p-6 w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-4">Edit WordPress Site</h2>

                        {/* Client (readonly) */}
                        <select
                            className="w-full border p-2 mb-2 bg-gray-100"
                            disabled
                            value={editSite.client_id}
                        >
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>

                        <input
                            className="w-full border p-2 mb-2"
                            value={editSite.site_url}
                            onChange={e =>
                                setEditSite({ ...editSite, site_url: e.target.value })
                            }
                            placeholder="Site URL"
                        />

                        <input
                            className="w-full border p-2 mb-2"
                            value={editSite.site_path || ""}
                            onChange={e =>
                                setEditSite({ ...editSite, site_path: e.target.value })
                            }
                            placeholder="Site Path (optional)"
                        />

                        <select
                            className="w-full border p-2 mb-2"
                            value={editSite.language}
                            onChange={e =>
                                setEditSite({ ...editSite, language: e.target.value })
                            }
                        >
                            <option value="English">English</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Tamil">Tamil</option>
                            <option value="Telugu">Telugu</option>
                        </select>

                        <input
                            className="w-full border p-2 mb-2"
                            value={editSite.username}
                            onChange={e =>
                                setEditSite({ ...editSite, username: e.target.value })
                            }
                            placeholder="Username"
                        />

                        <input
                            className="w-full border p-2 mb-2"
                            type="password"
                            value={editSite.app_password}
                            onChange={e =>
                                setEditSite({ ...editSite, app_password: e.target.value })
                            }
                            placeholder="New App Password (leave blank to keep existing)"
                        />

                        <input
                            className="w-full border p-2 mb-4"
                            value={editSite.default_media_id || ""}
                            onChange={e =>
                                setEditSite({
                                    ...editSite,
                                    default_media_id: e.target.value
                                })
                            }
                            placeholder="Default Media ID"
                        />

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setEditSite(null)}
                                className="px-4 py-2"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={updateSite}
                                className="bg-purple-600 text-white px-4 py-2 rounded"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
}
