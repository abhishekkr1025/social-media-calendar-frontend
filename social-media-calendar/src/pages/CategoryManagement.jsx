import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const BASE_URL = "https://prod.panditjee.com";

export default function CategoryManagement() {
  const { id } = useParams(); // site id

  const [siteInfo, setSiteInfo] = useState(null);
  const [masterCategories, setMasterCategories] = useState([]);
  const [siteCategories, setSiteCategories] = useState([]);
  const [mapping, setMapping] = useState({});
  const [loading, setLoading] = useState(true);
  const [newMasterName, setNewMasterName] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const [siteRes, masterRes, siteCatRes, mappingRes] =
      await Promise.all([
        fetch(`${BASE_URL}/api/wordpress-sites/${id}`),
        fetch(`${BASE_URL}/api/master-categories`),
        fetch(`${BASE_URL}/api/wordpress-sites/${id}/categories`),
        fetch(`${BASE_URL}/api/site-category-mapping/${id}`)
      ]);

    const site = await siteRes.json();
    const masters = await masterRes.json();
    const siteCats = await siteCatRes.json();
    const mappings = await mappingRes.json();

    const mappingObj = {};
    mappings.forEach(m => {
      mappingObj[m.master_category_id] = m.wp_category_id;
    });

    setSiteInfo(site);
    setMasterCategories(masters);
    setSiteCategories(siteCats);
    setMapping(mappingObj);
    setLoading(false);
  }

  async function addMasterCategory() {
    if (!newMasterName.trim()) return;

    await fetch(`${BASE_URL}/api/master-categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newMasterName })
    });

    setNewMasterName("");
    loadData();
  }

  async function saveMapping() {
    const payload = Object.entries(mapping).map(
      ([masterId, wpCategoryId]) => ({
        master_category_id: masterId,
        wp_category_id: wpCategoryId
      })
    );

    await fetch(`${BASE_URL}/api/site-category-mapping/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    alert("Mappings Saved");
  }

  async function autoMatch() {
    const res = await fetch(
      `${BASE_URL}/api/site-category-mapping/${id}/auto-match`,
      { method: "POST" }
    );

    const data = await res.json();
    setMapping(data.mapping);
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">
        Category Management – {siteInfo.language}
      </h1>

      <div className="mb-4 flex gap-2">
        <button
          onClick={autoMatch}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          Auto Match by Slug
        </button>

        <button
          onClick={saveMapping}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Save Mapping
        </button>
      </div>

      {/* Add Master Category */}
      <div className="mb-6">
        <input
          value={newMasterName}
          onChange={e => setNewMasterName(e.target.value)}
          placeholder="New Master Category"
          className="border p-2 mr-2"
        />
        <button
          onClick={addMasterCategory}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      {/* Mapping Table */}
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Master Category</th>
            <th className="px-4 py-2 text-left">Site Category</th>
          </tr>
        </thead>
        <tbody>
          {masterCategories.map(master => (
            <tr key={master.id} className="border-t">
              <td className="px-4 py-2">{master.name}</td>
              <td className="px-4 py-2">
                <select
                  value={mapping[master.id] || ""}
                  onChange={e =>
                    setMapping({
                      ...mapping,
                      [master.id]: e.target.value
                    })
                  }
                  className="border p-2 w-full"
                >
                  <option value="">Select</option>
                  {siteCategories.map(cat => (
                    <option
                      key={cat.wp_category_id}
                      value={cat.wp_category_id}
                    >
                      {cat.name} (ID {cat.wp_category_id})
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
