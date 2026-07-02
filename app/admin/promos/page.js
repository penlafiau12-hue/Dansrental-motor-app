"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { fmt } from "@/lib/helpers";
import { Field, Input, Select, Button } from "@/components/UI";
import { Plus, Edit2, Trash2, Tag } from "lucide-react";

const blank = { code: "", type: "percent", value: 10, min_days: 1, expiry: "2026-12-31", quota: 50, used: 0, branch_id: "" };

export default function AdminPromosPage() {
  const [promos, setPromos] = useState([]);
  const [branches, setBranches] = useState([]);
  const [editing, setEditing] = useState(null);
  const [origCode, setOrigCode] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [{ data: pr }, { data: br }] = await Promise.all([
      supabase.from("promos").select("*").order("code"),
      supabase.from("branches").select("*").order("name"),
    ]);
    setPromos(pr || []);
    setBranches(br || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const payload = { ...editing, code: editing.code.toUpperCase(), branch_id: editing.branch_id || null };
    if (origCode) await supabase.from("promos").update(payload).eq("code", origCode);
    else await supabase.from("promos").insert(payload);
    setEditing(null);
    setOrigCode(null);
    load();
  };
  const remove = async (code) => {
    if (!confirm("Hapus promo ini?")) return;
    await supabase.from("promos").delete().eq("code", code);
    load();
  };

  if (loading) return <div className="text-center py-16 text-sm text-muted">Memuat...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div className="font-medium text-sm text-ink">Kode promo ({promos.length})</div>
        <Button variant="primary" onClick={() => { setEditing(blank); setOrigCode(null); }} className="flex items-center gap-1">
          <Plus size={13} /> Buat promo
        </Button>
      </div>

      {editing && (
        <div className="rounded-xl p-4 mb-3 bg-white" style={{ border: "1px solid #FF7A30" }}>
          <div className="grid md:grid-cols-3 gap-2">
            <Field label="Kode"><Input value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value })} /></Field>
            <Field label="Tipe diskon">
              <Select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })}>
                <option value="percent">Persentase (%)</option><option value="fixed">Nominal tetap (Rp)</option>
              </Select>
            </Field>
            <Field label="Nilai"><Input type="number" value={editing.value} onChange={(e) => setEditing({ ...editing, value: +e.target.value })} /></Field>
            <Field label="Min. hari sewa"><Input type="number" value={editing.min_days} onChange={(e) => setEditing({ ...editing, min_days: +e.target.value })} /></Field>
            <Field label="Berlaku sampai"><Input type="date" value={editing.expiry} onChange={(e) => setEditing({ ...editing, expiry: e.target.value })} /></Field>
            <Field label="Kuota"><Input type="number" value={editing.quota} onChange={(e) => setEditing({ ...editing, quota: +e.target.value })} /></Field>
            <Field label="Khusus cabang (opsional)">
              <Select value={editing.branch_id || ""} onChange={(e) => setEditing({ ...editing, branch_id: e.target.value })}>
                <option value="">Semua cabang</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </Select>
            </Field>
          </div>
          <div className="flex gap-2 mt-3">
            <Button variant="accent" onClick={save}>Simpan</Button>
            <Button variant="ghost" onClick={() => { setEditing(null); setOrigCode(null); }}>Batal</Button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-3">
        {promos.map((p) => {
          const br = branches.find((b) => b.id === p.branch_id);
          const expired = p.expiry && new Date(p.expiry) < new Date();
          return (
            <div key={p.code} className="rounded-xl p-4 bg-white border border-line">
              <div className="flex justify-between items-start mb-1">
                <div className="font-bold text-sm flex items-center gap-1.5 text-ink"><Tag size={13} color="#FF7A30" /> {p.code}</div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(p); setOrigCode(p.code); }} className="p-1.5 rounded-lg bg-paper"><Edit2 size={12} /></button>
                  <button onClick={() => remove(p.code)} className="p-1.5 rounded-lg bg-paper"><Trash2 size={12} color="#D64545" /></button>
                </div>
              </div>
              <div className="text-xs text-muted">{p.type === "percent" ? `${p.value}% off` : `${fmt(p.value)} off`} &middot; min {p.min_days} hari</div>
              <div className="text-xs text-muted">Berlaku sampai {p.expiry} {expired && <span style={{ color: "#D64545" }}>(kedaluwarsa)</span>}</div>
              <div className="text-xs text-muted">Terpakai {p.used}/{p.quota} &middot; {br ? br.name : "Semua cabang"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
