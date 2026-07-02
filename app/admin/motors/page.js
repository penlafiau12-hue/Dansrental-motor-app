"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { fmt } from "@/lib/helpers";
import { Badge, Plate, Field, Input, Select, Button } from "@/components/UI";
import { Plus, Edit2, Trash2 } from "lucide-react";

const blankMotor = { plate: "", name: "", brand: "", type: "Matic", cc: 110, price: 75000, branch_id: "", status: "tersedia", gps_device_id: "" };

export default function AdminMotorsPage() {
  const [motors, setMotors] = useState([]);
  const [branches, setBranches] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [{ data: mt }, { data: br }] = await Promise.all([
      supabase.from("motors").select("*").order("name"),
      supabase.from("branches").select("*").order("name"),
    ]);
    setMotors(mt || []);
    setBranches(br || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const payload = { ...editing };
    const id = payload.id;
    delete payload.id;
    if (id) await supabase.from("motors").update(payload).eq("id", id);
    else await supabase.from("motors").insert(payload);
    setEditing(null);
    load();
  };
  const remove = async (id) => {
    if (!confirm("Hapus motor ini?")) return;
    await supabase.from("motors").delete().eq("id", id);
    load();
  };

  if (loading) return <div className="text-center py-16 text-sm text-muted">Memuat...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div className="font-medium text-sm text-ink">Data motor ({motors.length})</div>
        <Button variant="primary" onClick={() => setEditing({ ...blankMotor, branch_id: branches[0]?.id || "" })} className="flex items-center gap-1">
          <Plus size={13} /> Tambah motor
        </Button>
      </div>

      {editing && (
        <div className="rounded-xl p-4 mb-3 bg-white" style={{ border: "1px solid #FF7A30" }}>
          <div className="grid md:grid-cols-3 gap-2">
            <Field label="Plat nomor"><Input value={editing.plate} onChange={(e) => setEditing({ ...editing, plate: e.target.value })} /></Field>
            <Field label="Nama motor"><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <Field label="Merk"><Input value={editing.brand} onChange={(e) => setEditing({ ...editing, brand: e.target.value })} /></Field>
            <Field label="Tipe">
              <Select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })}>
                <option>Matic</option><option>Sport</option><option>Bebek</option>
              </Select>
            </Field>
            <Field label="CC"><Input type="number" value={editing.cc} onChange={(e) => setEditing({ ...editing, cc: +e.target.value })} /></Field>
            <Field label="Harga/hari"><Input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: +e.target.value })} /></Field>
            <Field label="Cabang">
              <Select value={editing.branch_id} onChange={(e) => setEditing({ ...editing, branch_id: e.target.value })}>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </Select>
            </Field>
            <Field label="Status">
              <Select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                <option value="tersedia">Tersedia</option><option value="disewa">Disewa</option><option value="servis">Servis</option>
              </Select>
            </Field>
            <Field label="ID GPS Tracker (opsional)"><Input value={editing.gps_device_id || ""} onChange={(e) => setEditing({ ...editing, gps_device_id: e.target.value })} placeholder="Contoh: TRK-0001" /></Field>
          </div>
          <div className="flex gap-2 mt-3">
            <Button variant="accent" onClick={save}>Simpan</Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>Batal</Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {motors.map((m) => {
          const b = branches.find((x) => x.id === m.branch_id);
          return (
            <div key={m.id} className="rounded-xl p-3 flex items-center justify-between gap-3 flex-wrap bg-white border border-line">
              <div className="flex items-center gap-3">
                <Plate text={m.plate} />
                <div>
                  <div className="text-sm font-medium text-ink">{m.name} <span className="font-normal text-xs text-muted">({m.cc}cc, {m.type})</span></div>
                  <div className="text-xs text-muted">{b?.name} &middot; {fmt(m.price)}/hari</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={m.status}>{m.status}</Badge>
                <button onClick={() => setEditing(m)} className="p-1.5 rounded-lg bg-paper"><Edit2 size={13} /></button>
                <button onClick={() => remove(m.id)} className="p-1.5 rounded-lg bg-paper"><Trash2 size={13} color="#D64545" /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
