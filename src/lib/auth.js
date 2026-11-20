import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { NAMA_COOKIE, UMUR_SESI, buatToken, bacaToken } from '@/lib/token';

// Simpan token ke cookie setelah login berhasil.
export async function simpanSesi(user) {
    const token = await buatToken(user);
    const toko = await cookies();
    toko.set(NAMA_COOKIE, token, {
        httpOnly: true, // tidak bisa dibaca JavaScript di browser (lebih aman)
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: UMUR_SESI,
    });
}

// Hapus cookie saat logout.
export async function hapusSesi() {
    const toko = await cookies();
    toko.delete(NAMA_COOKIE);
}

// Ambil data user yang sedang login: { id, nama, role } atau null.
export async function ambilSesi() {
    const toko = await cookies();
    const token = toko.get(NAMA_COOKIE)?.value;
    if (!token) return null;
    return bacaToken(token);
}

// Penjaga untuk route handler. Cara pakai:
//
//   const { sesi, error } = await cekAkses(['pegawai', 'admin']);
//   if (error) return error;          // belum login (401) atau role salah (403)
//   // lanjut, data user ada di sesi.id, sesi.role
//
// Ini lapisan keamanan kedua: proxy.js hanya menjaga HALAMAN,
// sedangkan API tetap bisa dipanggil langsung, jadi harus dicek di sini juga.
export async function cekAkses(roleDiizinkan) {
    const sesi = await ambilSesi();
    if (!sesi) {
        return {
            error: NextResponse.json({ pesan: 'Silakan login terlebih dahulu' }, { status: 401 }),
        };
    }
    
    if (!roleDiizinkan.includes(sesi.role)) {
        return {
            error: NextResponse.json({ pesan: 'Kamu tidak punya akses ke fitur ini' }, { status: 403 }),
        };
    }

    return { sesi };
}