"use client";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function SystemInstructionsEditor() {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/instructions", { cache: "no-store" });
        const json = await res.json();
        if (!cancelled) {
          if (!res.ok) throw new Error(json?.error || "Failed to load");
          setValue(json?.data?.instructions || "");
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Failed to load instructions");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 2000);
      return () => clearTimeout(t);
    }
  }, [success]);

  async function reload() {
    setError(null);
    setSuccess(null);
    try {
      setLoading(true);
      const res = await fetch("/api/instructions", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load");
      setValue(json?.data?.instructions || "");
      setSuccess("Loaded latest instructions");
    } catch (e: any) {
      setError(e.message || "Failed to reload");
    } finally {
      setLoading(false);
    }
  }

  async function onSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/instructions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructions: value }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to save");
      setSuccess("Instructions updated");
    } catch (e: any) {
      setError(e.message || "Failed to save instructions");
    } finally {
      setSaving(false);
    }
  }

  const count = value.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">System Instructions</label>
        <span className="text-xs text-gray-400">{count} chars</span>
      </div>
      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
          {success}
        </div>
      )}
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={10}
        aria-busy={loading}
        disabled={loading}
        placeholder={loading ? "Loading..." : "Enter system instructions"}
      />
      <div className="flex items-center gap-3">
        <Button onClick={onSave} disabled={saving || loading}>
          {saving ? "Saving..." : "Save"}
        </Button>
        <Button variant="outline" onClick={reload} disabled={loading || saving}>
          {loading ? "Loading..." : "Reload"}
        </Button>
      </div>
    </div>
  );
}
