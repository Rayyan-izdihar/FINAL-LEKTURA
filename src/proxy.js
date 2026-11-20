// Proxy Next.js 16 (dulu bernama middleware). Berjalan SEBELUM halaman dimuat.
// Tugasnya: cek cookie login, lalu izinkan atau alihkan pengguna.
// Aturan: hanya baca cookie, JANGAN memanggil database (pg) di sini.
import { NextResponse } from 'next/server';
import { bacaToken, NAMA_COOKIE } from '@/lib/token';

// Daftar halaman private dan role yang boleh masuk.
// Aturan yang lebih spesifik harus di atas yang lebih umum.
const ATURAN = [
    { awalan: '/dashboard/admin', role: ['admin'] },
    { awalan: '/dashboard/pegawai', role: ['pegawai', 'admin'] },
    { awalan: '/dashboard/mahasiswa', role: ['mahasiswa'] },
    { awalan: '/admin', role: ['admin'] },
    { awalan: '/pegawai', role: ['pegawai', 'admin'] },
];

function alihkan(request, tujuan) {
    return NextResponse.redirect(new URL(tujuan, request.url));
}

export async function proxy(request) {
    const { pathname } = request.nextUrl;

    const token = request.cookies.get(NAMA_COOKIE)?.value;
    const sesi = token ? await bacaToken(token) : null;

    // 1. Halaman login/register: kalau sudah login, tidak perlu ke sini lagi.
    if (pathname === '/login' || pathname === '/register') {
        if (sesi) return alihkan(request, `/dashboard/${sesi.role}`);
        return NextResponse.next();
    }

    // 2. Selain itu adalah halaman private: wajib login.
    if (!sesi) {
        const urlLogin = new URL('/login', request.url);
        urlLogin.searchParams.set('dari', pathname); // untuk kembali setelah login
        return NextResponse.redirect(urlLogin);
    }

    // 3. /dashboard polos diarahkan ke dashboard sesuai role.
    if (pathname === '/dashboard') {
        return alihkan(request, `/dashboard/${sesi.role}`);
    }

    // 4. Cek role terhadap halaman yang dituju.
    const aturan = ATURAN.find((a) => pathname.startsWith(a.awalan));
    if (aturan && !aturan.role.includes(sesi.role)) {
        return alihkan(request, `/dashboard/${sesi.role}`);
    }

    return NextResponse.next();
}


// Proxy hanya dijalankan untuk path berikut (bukan seluruh website).
export const config = {
    matcher: ['/login', '/register', '/dashboard/:path*', '/admin/:path*', '/pegawai/:path*'],
};