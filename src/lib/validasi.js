// Pemeriksaan isian formulir di sisi server. Browser boleh memeriksa juga demi kenyamanan,
// tetapi yang menentukan tetap server, karena API bisa dipanggil tanpa lewat formulir.
//
// Setiap fungsi mengembalikan salah satu:
//     { data: {...} }     isian valid, nilainya sudah dirapikan (spasi dibuang, angka diubah dari teks)
//     { pesan: '...' }    ada isian yang salah, pesan siap ditampilkan ke pengguna

const KATEGORI_PENGUMUMAN = ['Operasional', 'Layanan', 'Acara'];
const STATUS_PENGUMUMAN = ['Draft', 'Published'];


function teks(nilai) {
    return (nilai ?? '').toString().trim();
}


export function validasiBuku(body, { ubah = false } = {}) {
    const judul = teks(body?.judul);
    const isbn = teks(body?.isbn);
    const penulis = teks(body?.penulis);
    const penerbit = teks(body?.penerbit);
    const sampul = teks(body?.sampul) || null;
    const tahun = Number(body?.tahun_terbit);
    const kategoriId = Number(body?.category_id);
    const stokTotal = Number(body?.stok_total);
    const maksimalPinjam = Number(body?.maksimal_pinjam);
    const dendaPerHari = Number(body?.denda_per_hari);

    // Pada edit, ISBN tidak dikirim dan tidak diubah
    const semuaTerisi = judul && penulis && penerbit && (ubah || isbn);
    const angkaTerisi = [body?.tahun_terbit, body?.category_id, body?.stok_total, body?.maksimal_pinjam, body?.denda_per_hari].every(
        (nilai) => teks(nilai) !== ''
    );
    if (!semuaTerisi || !angkaTerisi) return { pesan: 'Semua isian wajib diisi' };

    if (judul.length > 200 || penulis.length > 150 || penerbit.length > 150) {
        return { pesan: 'Judul maksimal 200 karakter, penulis dan penerbit maksimal 150 karakter' };
    }
    if (!ubah && !/^[0-9Xx-]{10,20}$/.test(isbn)) {
        return { pesan: 'Format ISBN tidak valid (10 sampai 20 karakter: angka dan tanda hubung)' };
    }


    const tahunMaksimal = new Date().getFullYear();
    if (!Number.isInteger(tahun) || tahun < 1000 || tahun > tahunMaksimal) {
        return { pesan: `Tahun terbit harus antara 1000 dan ${tahunMaksimal}` };
    }
    if (!Number.isInteger(kategoriId) || kategoriId <= 0) {
        return { pesan: 'Pilih kategori buku' };
    }
    if (!Number.isInteger(stokTotal) || stokTotal < 0) {
        return { pesan: 'Stok harus berupa bilangan bulat, minimal 0' };
    }
    if (!Number.isInteger(maksimalPinjam) || maksimalPinjam < 1 || maksimalPinjam > 70) {
        return { pesan: 'Lama pinjam harus berupa bilangan bulat antara 1 dan 70 hari' };
    }
    if (!Number.isFinite(dendaPerHari) || dendaPerHari < 0) {
        return { pesan: 'Tarif denda tidak boleh negatif' };
    }
    if (sampul && !/^(\/|https?:\/\/)/.test(sampul)) {
        return { pesan: 'Sampul harus berupa path yang diawali / (contoh /covers/bumi.svg) atau URL http/https' };
    }

    return {
        data: {
            judul,
            isbn,
            penulis,
            penerbit,
            tahun_terbit: tahun,
            category_id: kategoriId,
            stok_total: stokTotal,
            maksimal_pinjam: maksimalPinjam,
            denda_per_hari: dendaPerHari,
            sampul,
        },
    };
}


export function validasiPengumuman(body) {
    const judul = teks(body?.judul);
    const isi = teks(body?.isi);
    const kategori = teks(body?.kategori);
    const status = teks(body?.status);
    const tanggal = teks(body?.tanggal_rilis); // boleh kosong: server memakai tanggal hari ini

    if (!judul || !isi) return { pesan: 'Judul dan isi pengumuman wajib diisi' };
    if (judul.length > 200) return { pesan: 'Judul maksimal 200 karakter' };
    if (isi.length > 5000) return { pesan: 'Isi pengumuman maksimal 5000 karakter' };
    if (!KATEGORI_PENGUMUMAN.includes(kategori)) {
        return { pesan: 'Pilih kategori: Operasional, Layanan, atau Acara' };
    }
    if (!STATUS_PENGUMUMAN.includes(status)) {
        return { pesan: 'Pilih status: Draft atau Published' };
    }
    if (tanggal) {
        // Cocokkan bentuk YYYY-MM-DD lalu pastikan tanggalnya benar-benar ada (misalnya bukan 2026-02-31)
        const cocok = /^(\d{4})-(\d{2})-(\d{2})$/.exec(tanggal);
        const tanggalJs = cocok ? new Date(Number(cocok[1]), Number(cocok[2]) - 1, Number(cocok[3])) : null;
        const ada = tanggalJs && tanggalJs.getMonth() === Number(cocok[2]) - 1 && tanggalJs.getDate() === Number(cocok[3]);
        if (!ada) return { pesan: 'Tanggal rilis tidak valid' };
    }

    return { data: { judul, isi, kategori, status, tanggal_rilis: tanggal || null } };
}