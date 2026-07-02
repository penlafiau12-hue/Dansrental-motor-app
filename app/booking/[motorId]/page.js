"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { fmt, daysBetween } from "@/lib/helpers";
import { Field, Input, Plate, Button } from "@/components/UI";
import { Bike, MapPin, Tag, ArrowLeft } from "lucide-react";

export default function BookingPage() {
  const { motorId } = useParams();
  const router = useRouter();
  const [motor, setMotor] = useState(null);
  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoResult, setPromoResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const { data: m } = await supabase.from("motors").select("*").eq("id", motorId).single();
      if (m) {
        const { data: b } = await supabase.from("branches").select("*").eq("id", m.branch_id).single();
        setMotor(m);
        setBranch(b);
      }
      const today = new Date().toISOString().slice(0, 10);
      const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
      setStartDate(today);
      setEndDate(tomorrow);
      setLoading(false);
    })();
  }, [motorId]);

  const days = startDate && endDate ? daysBetween(startDate, endDate) : 0;
  const subtotal = motor ? days * motor.price : 0;

  const checkPromo = async () => {
    if (!promoCode) { setPromoResult(null); return; }
    const { data: p } = await supabase.from("promos").select("*").ilike("code", promoCode).maybeSingle();
    if (!p) return setPromoResult({ error: "Kode promo tidak ditemukan." });
    if (p.branch_id && p.branch_id !== motor.branch_id) return setPromoResult({ error: "Kode promo tidak berlaku untuk cabang ini." });
    if (p.expiry && new Date(p.expiry) < new Date()) return setPromoResult({ error: "Kode promo sudah kedaluwarsa." });
    if (p.used >= p.quota) return setPromoResult({ error: "Kuota kode promo sudah habis." });
    if (days < p.min_days) return setPromoResult({ error: `Minimal sewa ${p.min_days} hari untuk kode ini.` });
    setPromoResult({ promo: p });
  };

  useEffect(() => { checkPromo(); /* eslint-disable-next-line */ }, [promoCode, days]);

  const discount = promoResult?.promo
    ? promoResult.promo.type === "percent"
      ? subtotal * (promoResult.promo.value / 100)
      : promoResult.promo.value
    : 0;
  const total = Math.max(0, subtotal - discount);
  const canSubmit = motor && name && phone && email && days > 0 && new Date(endDate) > new Date(startDate);

  const submit = async () => {
    setSubmitting(true);
    setError("");
    const { error: insertErr } = await supabase.from("bookings").insert({
      motor_id: motor.id,
      branch_id: motor.branch_id,
      customer_name: name,
      phone,
      email,
      start_date: startDate,
      end_date: endDate,
      days,
      price_per_day: motor.price,
      subtotal,
      discount,
      total,
      promo_code: promoResult?.promo ? promoResult.promo.code : null,
      status: "pending",
    });
    if (insertErr) {
      setError("Gagal membuat pesanan: " + insertErr.message);
      setSubmitting(false);
      return;
    }
    // Set motor jadi disewa & tambah pemakaian promo (idealnya lewat DB trigger/RPC, ini versi simpel)
    await supabase.from("motors").update({ status: "disewa" }).eq("id", motor.id);
    if (promoResult?.promo) {
      await supabase.from("promos").update({ used: promoResult.promo.used + 1 }).eq("code", promoResult.promo.code);
    }
    router.push("/orders");
  };

  if (loading) return <div className="text-center py-16 text-sm text-muted">Memuat...</div>;
  if (!motor) return <div className="text-center py-16 text-sm text-muted">Motor tidak ditemukan.</div>;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <button onClick={() => router.push("/")} className="text-xs flex items-center gap-1 mb-3 text-muted">
          <ArrowLeft size={13} /> Kembali ke daftar motor
        </button>
        <div className="rounded-xl p-4 bg-white border border-line">
          <div className="flex gap-3 items-start mb-3">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 bg-paper">
              <Bike size={28} className="text-ink" />
            </div>
            <div>
              <div className="font-semibold text-ink">{motor.name}</div>
              <div className="text-xs text-muted">{motor.cc}cc &middot; {motor.type}</div>
              <Plate text={motor.plate} />
            </div>
          </div>
          <div className="text-xs flex items-center gap-1 mb-1 text-muted"><MapPin size={12} /> {branch?.name}, {branch?.address}</div>
          <div className="text-xs text-muted">Jam operasional: {branch?.hours}</div>
        </div>

        <div className="rounded-xl p-4 mt-4 bg-white border border-line">
          <div className="font-medium text-sm mb-3 text-ink">Ringkasan biaya</div>
          <div className="flex justify-between text-sm py-0.5 text-muted"><span>{fmt(motor.price)} x {days} hari</span><span className="text-ink font-medium">{fmt(subtotal)}</span></div>
          {discount > 0 && <div className="flex justify-between text-sm py-0.5"><span className="text-muted">Diskon promo</span><span style={{ color: "#2FA88C" }}>-{fmt(discount)}</span></div>}
          <div className="h-px my-2 bg-line" />
          <div className="flex justify-between text-sm font-bold text-ink"><span>Total</span><span>{fmt(total)}</span></div>
        </div>
      </div>

      <div className="rounded-xl p-4 bg-white border border-line">
        <div className="font-medium text-sm mb-3 text-ink">Detail pemesanan</div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Field label="Tanggal mulai"><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></Field>
          <Field label="Tanggal selesai"><Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></Field>
        </div>
        <div className="mb-3"><Field label="Nama lengkap"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama sesuai KTP" /></Field></div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Field label="No. HP"><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0812xxxxxxx" /></Field>
          <Field label="Email"><Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" /></Field>
        </div>
        <div className="mb-1">
          <Field label="Kode promo (opsional)">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-line">
              <Tag size={14} className="text-muted" />
              <input value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} placeholder="Contoh: LIBURAN10" className="w-full outline-none text-sm bg-transparent" />
            </div>
          </Field>
        </div>
        {promoResult && (
          <p className="text-xs mb-3" style={{ color: promoResult.promo ? "#2FA88C" : "#D64545" }}>
            {promoResult.promo ? `Promo diterapkan: ${promoResult.promo.code}` : promoResult.error}
          </p>
        )}
        {error && <p className="text-xs mb-3" style={{ color: "#D64545" }}>{error}</p>}
        <Button variant="accent" disabled={!canSubmit || submitting} onClick={submit} className="w-full text-center py-2.5">
          {submitting ? "Memproses..." : "Konfirmasi Pemesanan"}
        </Button>
      </div>
    </div>
  );
}
