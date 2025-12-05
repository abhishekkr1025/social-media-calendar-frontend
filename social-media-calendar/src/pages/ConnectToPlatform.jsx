import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../components/ui/select";

import {
    Linkedin, Instagram, Twitter, Facebook, Youtube,
    Send, MessageCircle, CheckCircle, XCircle
} from "lucide-react";
import { SiWordpress } from "react-icons/si";

const BASE_URL = "https://prod.panditjee.com"


const platforms = [
    { id: "linkedin", label: "LinkedIn", icon: <Linkedin className="w-5 h-5" />, color: "bg-blue-600" },
    { id: "instagram", label: "Instagram", icon: <Instagram className="w-5 h-5" />, color: "bg-pink-500" },
    { id: "twitter", label: "Twitter", icon: <Twitter className="w-5 h-5" />, color: "bg-sky-400" },
    { id: "facebook", label: "Facebook", icon: <Facebook className="w-5 h-5" />, color: "bg-blue-700" },
    { id: "youtube", label: "YouTube", icon: <Youtube className="w-5 h-5" />, color: "bg-red-600" },
    { id: "telegram", label: "Telegram", icon: <Send className="w-5 h-5" />, color: "bg-blue-400" },
    { id: "whatsapp", label: "WhatsApp Channel", icon: <MessageCircle className="w-5 h-5" />, color: "bg-green-500" },
    { id: "wordpress", label: "WordPress Website", icon: <SiWordpress className="w-5 h-5" />, color: "bg-[#21759B]" },
];

export default function ConnectToPlatforms() {

    const [clients, setClients] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState(null);
    const [status, setStatus] = useState({});
    const [loading, setLoading] = useState(false);

    const [showWPModal, setShowWPModal] = useState(false);
    const [wpData, setWpData] = useState({
        site_url: "",
        username: "",
        app_password: "",
    });

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        const res = await fetch(`${BASE_URL}/api/clients`);
        setClients(await res.json());
    };

const loadPlatformStatus = async (clientId) => {
        setLoading(true);
        let newStatus = {};

        for (let p of platforms) {
            try {
                const res = await fetch(`${BASE_URL}/api/clients/${clientId}/${p.id}/account`);
                const data = await res.json();
                console.log(data)
                // Connected if response is OK AND data array is not empty
                newStatus[p.id] = res.ok && data && data.length !== 0;
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
        window.location.href = `${BASE_URL}/auth/${platform}/login/${selectedClientId}`;
    };

    const disconnectPlatform = async (platform) => {
        const res = await fetch(
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

        const res = await fetch(`${BASE_URL}/auth/wordpress/login`, {
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
                                        <Button variant="outline"  className="text-red-600 border-red-400" onClick={() => disconnectPlatform(p.id)}>
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
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h2 className="text-lg font-semibold mb-4">Connect WordPress</h2>

                        <input className="border p-2 w-full mb-2" placeholder="https://example.com"
                            value={wpData.site_url} onChange={(e) => setWpData({ ...wpData, site_url: e.target.value })} />

                        <input className="border p-2 w-full mb-2" placeholder="Username"
                            value={wpData.username} onChange={(e) => setWpData({ ...wpData, username: e.target.value })} />

                        <input className="border p-2 w-full mb-4" placeholder="App Password"
                            type="password" value={wpData.app_password}
                            onChange={(e) => setWpData({ ...wpData, app_password: e.target.value })} />

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowWPModal(false)}>Cancel</Button>
                            <Button className="bg-[#21759B] text-white" onClick={submitWordPressCredentials}>
                                Connect
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}




