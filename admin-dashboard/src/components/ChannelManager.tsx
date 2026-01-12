"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pencil, Trash2, Plus } from "lucide-react";

type Channel = {
  id: string;
  channel_id: string;
  channel_name?: string | null;
  server_id?: string | null;
  server_name?: string | null;
  is_active?: boolean;
};

export default function ChannelManager() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [channelId, setChannelId] = useState("");
  const [channelName, setChannelName] = useState("");
  const [serverId, setServerId] = useState("");
  const [serverName, setServerName] = useState("");
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/channels", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load channels");
      setChannels(json?.data || []);
    } catch (e: any) {
      setError(e.message || "Failed to load channels");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function addChannel() {
    setAdding(true);
    setError(null);
    try {
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel_id: channelId,
          channel_name: channelName || undefined,
          server_id: serverId || undefined,
          server_name: serverName || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to add channel");
      setChannelId("");
      setChannelName("");
      setServerId("");
      setServerName("");
      setIsDialogOpen(false);
      await load();
    } catch (e: any) {
      setError(e.message || "Failed to add channel");
    } finally {
      setAdding(false);
    }
  }

  async function removeChannel(id: string) {
    if (!confirm("Remove this channel from the allow-list?")) return;
    setRemovingId(id);
    try {
      const res = await fetch(`/api/channels/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to remove channel");
      await load();
    } catch (e: any) {
      setError(e.message || "Failed to remove channel");
    } finally {
      setRemovingId(null);
    }
  }

  const canSubmit = !!channelId && !adding && !loading;

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={() => { setError(null); load(); }}>Retry</Button>
          </div>
        </div>
      )}

      {/* Add Channel Dialog */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Channel Management</h3>
          <p className="text-sm text-slate-600">Manage allowed channels</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white shadow-md">
              <Plus className="w-4 h-4 mr-2" />
              Add Channel
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-slate-900">Add New Channel</DialogTitle>
              <DialogDescription className="text-slate-600">
                Enter the channel details below. Channel ID is required.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="channelId" className="text-sm font-medium text-slate-900">
                  Channel ID <span className="text-red-500">*</span>
                </label>
                <Input
                  id="channelId"
                  placeholder="123456789012345678"
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  disabled={adding}
                  className="border-slate-300 text-slate-900"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="channelName" className="text-sm font-medium text-slate-900">
                  Channel Name
                </label>
                <Input
                  id="channelName"
                  placeholder="general-chat"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  disabled={adding}
                  className="border-slate-300 text-slate-900"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="serverId" className="text-sm font-medium text-slate-900">
                  Server ID
                </label>
                <Input
                  id="serverId"
                  placeholder="987654321098765432"
                  value={serverId}
                  onChange={(e) => setServerId(e.target.value)}
                  disabled={adding}
                  className="border-slate-300 text-slate-900"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="serverName" className="text-sm font-medium text-slate-900">
                  Server Name
                </label>
                <Input
                  id="serverName"
                  placeholder="My Discord Server"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  disabled={adding}
                  className="border-slate-300 text-slate-900"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={adding}
                className="border-slate-300 text-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={addChannel}
                disabled={!canSubmit}
                className="bg-orange-500 hover:bg-orange-600 text-white shadow-md"
              >
                {adding ? "Adding..." : "Add Channel"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Channels Table */}
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
        <div className="grid grid-cols-12 gap-4 p-4 font-medium text-sm border-b border-orange-200 bg-orange-50 text-slate-900">
          <div className="col-span-2">No.</div>
          <div className="col-span-4">Channel</div>
          <div className="col-span-4">Server</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        <div className="divide-y divide-slate-200">
          {loading ? (
            <div className="p-4 text-sm text-slate-600">Loading channels...</div>
          ) : channels.length === 0 ? (
            <div className="p-4 text-sm text-slate-500">No channels yet. Click "Add Channel" to get started.</div>
          ) : (
            channels.map((ch, index) => (
              <div key={ch.id} className="grid grid-cols-12 gap-4 p-4 items-center text-sm hover:bg-orange-50 transition-colors">
                <div className="col-span-2 text-slate-900 font-semibold">{index + 1}</div>
                <div className="col-span-4 truncate text-slate-900" title={ch.channel_id + (ch.channel_name ? ` • ${ch.channel_name}` : "")}>
                  <div className="font-medium">{ch.channel_name || "Unnamed Channel"}</div>
                  <div className="text-xs text-slate-500">{ch.channel_id}</div>
                </div>
                <div className="col-span-4 truncate text-slate-900" title={ch.server_id + (ch.server_name ? ` • ${ch.server_name}` : "")}>
                  {ch.server_name ? (
                    <>
                      <div className="font-medium">{ch.server_name}</div>
                      <div className="text-xs text-slate-500">{ch.server_id}</div>
                    </>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </div>
                <div className="col-span-2 flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-orange-500 hover:text-orange-600 hover:bg-orange-100"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeChannel(ch.id)}
                    disabled={removingId === ch.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
