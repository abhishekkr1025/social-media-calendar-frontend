import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../components/ui/select";
import { authFetch } from '../lib/auth';

import {
    Linkedin, Instagram, Twitter, Facebook, Youtube,
    Send, MessageCircle, CheckCircle, XCircle
} from "lucide-react";
import { SiWordpress } from "react-icons/si";

const BASE_URL = "https://prod.panditjee.com";
// const PANDITJEE_BASE  = "https://prod.panditjee.com"
// const BASE_URL = "http://localhost:5000";
const TELEGRAM_BOT_USERNAME = "cliqsocialbot"; // without @



const platforms = [
    { id: "linkedin", label: "LinkedIn", icon: <Linkedin className="w-5 h-5" />, color: "bg-blue-600"  },
    { id: "instagram", label: "Instagram", icon: <Instagram className="w-5 h-5" />, color: "bg-pink-500" },
    { id: "twitter", label: "Twitter", icon: <Twitter className="w-5 h-5" />, color: "bg-sky-400" },
    { id: "facebook", label: "Facebook", icon: <Facebook className="w-5 h-5" />, color: "bg-blue-700" },
    { id: "youtube", label: "YouTube", icon: <Youtube className="w-5 h-5" />, color: "bg-red-600" },
    { id: "telegram", label: "Telegram", icon: <Send className="w-5 h-5" />, color: "bg-blue-400" },
    { id: "whatsapp", label: "WhatsApp Channel", icon: <MessageCircle className="w-5 h-5" />, color: "bg-green-500" },
    { id: "wordpress", label: "WordPress Website", icon: <SiWordpress className="w-5 h-5" />, color: "bg-[#21759B]" },
    { id: "panditjee", label: "Panditjee", icon: <Send />, color: "bg-orange-500" }
];

export default function ConnectToPlatforms() {

    const [clients, setClients] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState(null);
    const [status, setStatus] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPanditjeeModal, setShowPanditjeeModal] = useState(false);
    const [panditjeeData, setPanditjeeData] = useState({
        phone: "",
        otp: "",
        step: 1
    });

    const [showWPModal, setShowWPModal] = useState(false);
    const [wpData, setWpData] = useState({
        site_url: "",
        site_path: "",
        language: "English",
        username: "",
        app_password: ""
    });

    const [wpSites, setWpSites] = useState([
        {
            site_url: "",
            site_path: "",
            language: "English",
            username: "",
            app_password: ""
        }
    ]);


    const [showTelegramModal, setShowTelegramModal] = useState(false);

    const addWpRow = () => {
        setWpSites(prev => [
            ...prev,
            {
                site_url: "",
                site_path: "",
                language: "English",
                username: "",
                app_password: ""
            }
        ]);
    };

    const removeWpRow = (index) => {
        setWpSites(prev => prev.filter((_, i) => i !== index));
    };

    const updateWpRow = (index, field, value) => {
        setWpSites(prev =>
            prev.map((row, i) =>
                i === index ? { ...row, [field]: value } : row
            )
        );
    };



    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        const res = await authFetch(`${BASE_URL}/api/clients`);
        // console.log(await res.json());
        setClients(await res.json());
    };

    const loadPlatformStatus = async (clientId) => {
        setLoading(true);
        let newStatus = {};

        for (let p of platforms) {
            try {
                const res = await authFetch(`${BASE_URL}/api/clients/${clientId}/${p.id}/account`);
                const data = await res.json();
                console.log(`clientId: ${clientId}`)
                console.log(`${BASE_URL}/api/clients/${clientId}/${p.id}/account`)
                // console.log(data)
                // Connected if response is OK AND data array is not empty
                // newStatus[p.id] = res.ok && data && data.length !== 0;
                // // newStatus[p.id] = res.ok && data && !data.error;
                // if(p.id==="wordpress"){
                //      newStatus[p.id] = res.ok && data && data.sites.length>0;
                // }

                if (p.id === "wordpress" || p.id === "panditjee") {
                    // ✅ WordPress uses `connected` flag
                    newStatus[p.id] = res.ok && data?.connected === true;
                }
                 else {
                    // ✅ Other platforms: object presence is enough
                    newStatus[p.id] = res.ok && data && data.length !== 0;
                }

            } catch {
                newStatus[p.id] = false;
            }
        }

        setStatus(newStatus);
        setLoading(false);
    };

    const handleClientChange = (clientId) => {
        setSelectedClientId(clientId);
        loadPlatformStatus(clientId);
    };

    const connectPlatform = (platform) => {
        if (!selectedClientId) return alert("Please select a client first.");

        if (platform === "wordpress") {
            setShowWPModal(true);
            return;
        }

        if (platform === "panditjee") {
            setShowPanditjeeModal(true);
            return;
        }

        // ✅ TELEGRAM SPECIAL FLOW
        if (platform === "telegram") {
            // 1️⃣ Open Telegram bot
            window.open(`https://t.me/${TELEGRAM_BOT_USERNAME}`, "_blank");

            // 2️⃣ Ask user to click Start
            setShowTelegramModal(true);
            return;
        }
        window.location.href = `${BASE_URL}/auth/${platform}/login/${selectedClientId}`;
    };

    const disconnectPlatform = async (platform) => {
        const res = await authFetch(
            `${BASE_URL}/api/clients/${selectedClientId}/${platform}/disconnect`,
            { method: "DELETE" }
        );
        if (res.ok) {
            alert(`${platform} disconnected`);
            loadPlatformStatus(selectedClientId);
        }
    };

    const submitWordPressCredentials = async () => {
        if (!wpData.site_url || !wpData.username || !wpData.app_password)
            return alert("All fields are required.");

        const res = await authFetch(`${BASE_URL}/auth/wordpress/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clientId: selectedClientId, ...wpData }),
        });

        const data = await res.json();
        if (data.success) {
            alert("🎉 WordPress Connected!");
            setShowWPModal(false);
            loadPlatformStatus(selectedClientId);
        } else {
            alert("❌ " + data.error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-10">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Connect Platforms</h1>

                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Select Client</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Select onValueChange={handleClientChange}>
                            <SelectTrigger><SelectValue placeholder="Choose Client" /></SelectTrigger>
                            <SelectContent>
                                {clients.map(client => (
                                    <SelectItem key={client.id} value={client.id.toString()}>
                                        {client.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                {loading && <p className="text-gray-500 mb-3">Loading connections...</p>}

                {selectedClientId && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {platforms.map((p) => (
                            <Card key={p.id}>
                                <CardContent className="p-5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`${p.color} p-2 rounded-lg text-white`}>{p.icon}</div>
                                        <div>
                                            <p className="font-semibold">{p.label}</p>
                                            {status[p.id] ? (
                                                <Badge className="bg-green-600"><CheckCircle className="w-3 h-3" /> Connected</Badge>
                                            ) : (
                                                <Badge className="bg-red-500"><XCircle className="w-3 h-3" /> Not Connected</Badge>
                                            )}
                                        </div>
                                    </div>

                                    {status[p.id] ? (
                                        <Button variant="outline" className="text-red-600 border-red-400" onClick={() => disconnectPlatform(p.id)}>
                                            Disconnect
                                        </Button>
                                    ) : (
                                        <Button onClick={() => connectPlatform(p.id)}>Connect</Button>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* WORDPRESS CREDENTIAL MODAL */}
            {showWPModal && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
                    <div className="bg-white rounded-xl shadow-lg w-[900px] p-6">

                        <h2 className="text-xl font-semibold mb-4">
                            Connect WordPress Multisite
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="w-full border text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border px-2 py-2">Base URL</th>
                                        <th className="border px-2 py-2">Site Path</th>
                                        <th className="border px-2 py-2">Language</th>
                                        <th className="border px-2 py-2">Username</th>
                                        <th className="border px-2 py-2">App Password</th>
                                        <th className="border px-2 py-2">Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {wpSites.map((row, index) => (
                                        <tr key={index}>
                                            <td className="border p-1">
                                                <input
                                                    className="border rounded p-1 w-full"
                                                    placeholder="https://example.com"
                                                    value={row.site_url}
                                                    onChange={e =>
                                                        updateWpRow(index, "site_url", e.target.value)
                                                    }
                                                />
                                            </td>

                                            <td className="border p-1">
                                                <input
                                                    className="border rounded p-1 w-full"
                                                    placeholder="/english"
                                                    value={row.site_path}
                                                    onChange={e =>
                                                        updateWpRow(index, "site_path", e.target.value)
                                                    }
                                                />
                                            </td>

                                            <td className="border p-1">
                                                <select
                                                    className="border rounded p-1 w-full"
                                                    value={row.language}
                                                    onChange={e =>
                                                        updateWpRow(index, "language", e.target.value)
                                                    }
                                                >
                                                    <option>English</option>
                                                    <option>Hindi</option>
                                                    <option>Marathi</option>
                                                    <option>Gujarati</option>
                                                    <option>Tamil</option>
                                                </select>
                                            </td>

                                            <td className="border p-1">
                                                <input
                                                    className="border rounded p-1 w-full"
                                                    placeholder="admin"
                                                    value={row.username}
                                                    onChange={e =>
                                                        updateWpRow(index, "username", e.target.value)
                                                    }
                                                />
                                            </td>

                                            <td className="border p-1">
                                                <input
                                                    className="border rounded p-1 w-full"
                                                    type="password"
                                                    placeholder="xxxx xxxx xxxx"
                                                    value={row.app_password}
                                                    onChange={e =>
                                                        updateWpRow(index, "app_password", e.target.value)
                                                    }
                                                />
                                            </td>

                                            <td className="border p-1 text-center">
                                                {wpSites.length > 1 && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-red-600"
                                                        onClick={() => removeWpRow(index)}
                                                    >
                                                        Remove
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-between mt-4">
                            <Button variant="outline" onClick={addWpRow}>
                                + Add Site
                            </Button>

                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setShowWPModal(false)}>
                                    Cancel
                                </Button>

                                <Button
                                    className="bg-[#21759B] text-white"
                                    onClick={async () => {
                                        for (const site of wpSites) {
                                            await authFetch(`${BASE_URL}/auth/wordpress/login`, {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({
                                                    clientId: selectedClientId,
                                                    ...site
                                                })
                                            });
                                        }

                                        alert("🎉 All WordPress sites connected!");
                                        setShowWPModal(false);
                                        loadPlatformStatus(selectedClientId);
                                    }}
                                >
                                    Save All Sites
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}



            {showTelegramModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h2 className="text-lg font-semibold mb-3">
                            Connect Telegram
                        </h2>

                        <ol className="text-sm text-gray-700 space-y-2 mb-4">
                            <li>1️⃣ Telegram bot opened in new tab</li>
                            <li>2️⃣ Click <b>Start</b> in the bot</li>
                            <li>3️⃣ Click <b>Confirm</b> below</li>
                        </ol>

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowTelegramModal(false)}
                            >
                                Cancel
                            </Button>

                            <Button
                                className="bg-blue-500 text-white"
                                onClick={async () => {
                                    const res = await authFetch(
                                        `${BASE_URL}/auth/telegram/connect/${selectedClientId}`
                                    );
                                    const text = await res.text();

                                    console.log("Telegram response:", text);

                                    if (res.ok) {
                                        alert("🎉 Telegram Connected!");
                                        setShowTelegramModal(false);
                                        loadPlatformStatus(selectedClientId);
                                    } else {
                                        alert("❌ Telegram connection failed. Did you click Start?");
                                    }
                                }}
                            >
                                Confirm
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {showPanditjeeModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg w-96">

      <h2 className="text-lg font-semibold mb-3">
        Connect Panditjee
      </h2>

      {panditjeeData.step === 1 && (
        <>
          <input
            className="border p-2 w-full mb-3"
            placeholder="+91XXXXXXXXXX"
            value={panditjeeData.phone}
            onChange={(e) =>
              setPanditjeeData({ ...panditjeeData, phone: e.target.value })
            }
          />

          <Button
            className="w-full"
            onClick={async () => {
              const res = await authFetch(`${BASE_URL}/api/panditjee/connect`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  clientId: selectedClientId,
                  phone: panditjeeData.phone
                })
              });

              if (res.ok) {
                alert("OTP sent!");
                setPanditjeeData({ ...panditjeeData, step: 2 });
              } else {
                alert("Failed to send OTP");
              }
            }}
          >
            Send OTP
          </Button>
        </>
      )}

      {panditjeeData.step === 2 && (
        <>
          <input
            className="border p-2 w-full mb-3"
            placeholder="Enter OTP"
            value={panditjeeData.otp}
            onChange={(e) =>
              setPanditjeeData({ ...panditjeeData, otp: e.target.value })
            }
          />

          <Button
            className="w-full"
            onClick={async () => {
              const res = await authFetch(`${BASE_URL}/api/panditjee/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  clientId: selectedClientId,
                  phone: panditjeeData.phone,
                  otp: panditjeeData.otp
                })
              });

              const data = await res.json();
              console.log(data.data);

              if (data.success) {
                alert("🎉 Panditjee Connected!");
                setShowPanditjeeModal(false);
                setPanditjeeData({ phone: "", otp: "", step: 1 });
                loadPlatformStatus(selectedClientId);
              } else {
                alert("❌ Invalid OTP");
              }
            }}
          >
            Verify OTP
          </Button>
        </>
      )}

      <div className="flex justify-end mt-3">
        <Button
          variant="outline"
          onClick={() => {
            setShowPanditjeeModal(false);
            setPanditjeeData({ phone: "", otp: "", step: 1 });
          }}
        >
          Cancel
        </Button>
      </div>

    </div>
  </div>
)}

        </div>
    );
}




