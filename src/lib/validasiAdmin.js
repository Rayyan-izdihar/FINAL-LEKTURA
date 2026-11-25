// Pemeriksaan isian formulir khusus admin (pengguna dan kategori), di sisi server.
// Sama seperti lib/validasi.js, setiap fungsi mengembalikan salah satu:
//     { data: {...} }     isian valid dan sudah dirapikan
//     { pesan: '...' }    ada isian yang salah

export const DAFTAR_ROLE = ['admin', 'pegawai', 'mahasiswa'];

const FORMAT_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function teks(nilai) {
    return (nilai ?? '').toString().trim();
}

// ubah = false: tambah pengguna (butuh NIM dan password). ubah = true: edit (nama, email, role, status aktif).
export function validasiUser(body, { ubah = false } = {}) {
    const nama = teks(body?.nama);
    const email = teks(body?.email).toLowerCase();
    const role = teks(body?.role);
    const password = (body?.password ?? '').toString();

    if (!nama || !email || !role) return { pesan: 'Semua data wajib diisi' };
    if (!ubah && !password) return { pesan: 'Semua data wajib diisi' };

    if (nama.length > 100) return { pesan: 'Nama maksimal 100 karakter' };
    if (email.length > 150 || !FORMAT_EMAIL.test(email)) return { pesan: 'Format email tidak valid' };
    if (!DAFTAR_ROLE.includes(role)) return { pesan: 'Pilih peran: Admin, Pegawai, atau Mahasiswa' };

    if (ubah) {
        if (typeof body?.aktif !== 'boolean') return { pesan: 'Pilih status akun: aktif atau nonaktif' };
        return { data: { nama, email, role, aktif: body.aktif } };
    }

    if (password.length < 8) return { pesan: 'Password minimal 8 karakter' };
    return { data: { nama, email, role, password } };
}

export function validasiKategori(body) {
    const nama = teks(body?.nama);
    const kode = teks(body?.kode).toUpperCase();
    const deskripsi = teks(body?.deskripsi);

    if (!nama || !kode) return { pesan: 'Nama dan kode kategori wajib diisi' };
    if (nama.length > 100) return { pesan: 'Nama kategori maksimal 100 karakter' };
    if (kode.length > 20 || !/^[A-Z0-9.-]+$/.test(kode)) {
        return { pesan: 'Kode hanya boleh berisi huruf, angka, titik, dan tanda hubung (maksimal 20 karakter)' };
    }
    if (deskripsi.length > 300) return { pesan: 'Deskripsi maksimal 300 karakter' };

    return { data: { nama, kode, deskripsi: deskripsi || null } };
}