import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// PENTING: endpoint ini pakai Service Role Key (bukan anon key) karena
// dipanggil oleh server GPS tracker, bukan oleh browser pengguna.
// Tambahkan SUPABASE_SERVICE_ROLE_KEY di Environment Variables Vercel
// (JANGAN pernah taruh key ini di kode sisi client / NEXT_PUBLIC_*).
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Contoh pemanggilan dari platform GPS tracker (via webhook/HTTP POST):
// POST /api/gps/ingest
// Headers: { "x-api-key": "<INGEST_SECRET>" }
// Body: { "gps_device_id": "TRK-0001", "lat": -6.914744, "lng": 107.60981, "speed_kmh": 32 }
export async function POST(req) {
  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== process.env.GPS_INGEST_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { gps_device_id, lat, lng, speed_kmh } = body;
  if (!gps_device_id || lat == null || lng == null) {
    return NextResponse.json({ error: "gps_device_id, lat, lng wajib diisi" }, { status: 400 });
  }

  const { data: motor, error: motorErr } = await supabaseAdmin
    .from("motors")
    .select("id")
    .eq("gps_device_id", gps_device_id)
    .maybeSingle();

  if (motorErr || !motor) {
    return NextResponse.json({ error: "Motor dengan gps_device_id ini tidak ditemukan" }, { status: 404 });
  }

  const { error: insertErr } = await supabaseAdmin.from("gps_positions").insert({
    motor_id: motor.id,
    lat,
    lng,
    speed_kmh: speed_kmh ?? null,
  });

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
