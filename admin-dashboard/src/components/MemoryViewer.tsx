"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Memory = {
  id?: string;
  channel_id: string;
  channel_name?: string | null;
  summary?: string | null;
  message_count?: number | null;
  last_message_at?: string | null;
};

export default function MemoryViewer() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [resettingAll, setResettingAll] = useState(false);
  const [resettingId, setResettingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/memory?limit=50&offset=0`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load memories");
      setMemories(json?.data || []);
    } catch (e: any) {
      setError(e.message || "Failed to load memories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function resetChannel(channelId: string) {
    if (!confirm(`Reset memory for channel ${channelId}?`)) return;
    setResettingId(channelId);
    try {
      const res = await fetch(`/api/memory/${channelId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to reset memory");
      await load();
    } catch (e: any) {
      setError(e.message || "Failed to reset memory");
    } finally {
      setResettingId(null);
    }
  }

  async function resetAll() {
    if (!confirm("Reset all conversation memories? This cannot be undone.")) return;
    setResettingAll(true);
    try {
      const res = await fetch(`/api/memory/reset-all`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to reset all");
      await load();
    } catch (e: any) {
      setError(e.message || "Failed to reset all");
    } finally {
      setResettingAll(false);
    }
  }

  const filtered = query
    ? memories.filter(m =>
        m.channel_id.includes(query) || (m.summary || "").toLowerCase().includes(query.toLowerCase())
      )
    : memories;

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={() => { setError(null); load(); }}>Retry</Button>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Input placeholder="Search by channel or summary" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Button variant="outline" onClick={load} disabled={loading}>{loading ? "Loading..." : "Refresh"}</Button>
        <Button variant="destructive" onClick={resetAll} disabled={resettingAll}>
          {resettingAll ? "Resetting..." : "Reset All"}
        </Button>
      </div>
      <div className="border border-slate-200 rounded-md bg-white">
        <div className="grid grid-cols-5 gap-2 p-3 font-medium text-sm border-b bg-orange-50">
          <div className="col-span-2">Channel</div>
          <div>Messages</div>
          <div>Last Message</div>
          <div className="text-right">Actions</div>
        </div>
        <div className="divide-y divide-slate-200">
          {loading ? (
            <>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="grid grid-cols-5 gap-2 p-3 items-center text-sm opacity-60">
                  <div className="col-span-2 h-4 bg-orange-100 rounded" />
                  <div className="h-4 bg-orange-100 rounded" />
                  <div className="h-4 bg-orange-100 rounded" />
                  <div className="h-6 bg-orange-100 rounded" />
                </div>
              ))}
            </>
          ) : filtered.length === 0 ? (
            <div className="p-3 text-sm text-gray-400">No memories found.</div>
          ) : (
            filtered.map((m) => (
              <div key={m.channel_id} className="grid grid-cols-5 gap-2 p-3 items-center text-sm hover:bg-orange-50">
                <div className="col-span-2 truncate text-slate-900" title={m.channel_id}>
                  <div className="font-medium">{m.channel_name || "Unnamed Channel"}</div>
                  <div className="text-xs text-slate-500">{m.channel_id}</div>
                </div>
                <div className="text-slate-900">{m.message_count ?? 0}</div>
                <div className="text-slate-900">{m.last_message_at ? new Date(m.last_message_at).toLocaleString() : "-"}</div>
                <div className="text-right">
                  <Button size="sm" variant="outline" onClick={() => resetChannel(m.channel_id)} disabled={resettingId === m.channel_id}>
                    {resettingId === m.channel_id ? "Resetting..." : "Reset"}
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
