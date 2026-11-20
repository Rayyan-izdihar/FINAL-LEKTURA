import { NextResponse } from 'next/server';
import { ambilSesi } from '@/lib/auth';

// GET /api/auth/me
// Dipanggil dari komponen client (lewat useEffect) untuk tahu siapa yang sedang login,
// misalnya untuk menampilkan nama dan menu sesuai role di sidebar.
export async function GET() {
  const sesi = await ambilSesi();
  if (!sesi) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user: { id: sesi.id, nama: sesi.nama, role: sesi.role } });
}