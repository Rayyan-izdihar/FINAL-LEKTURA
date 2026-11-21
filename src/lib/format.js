// Fungsi kecil untuk menampilkan angka dan tanggal dengan format Indonesia.

// formatRupiah(1000) -> "Rp 1.000"
export function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(angka);
}

// Menerima teks 'YYYY-MM-DD' (bentuk yang dikirim API), hasilnya misalnya "21 November 2026".
// Teks dipecah manual agar tidak bergeser sehari karena perbedaan zona waktu.
export function formatTanggal(teks) {
    if (!teks) return '-';

    const [tahun, bulan, hari] = teks.slice(0, 10).split('-').map(Number);
    return new Date(tahun, bulan - 1, hari).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

// formatRating(4.2) -> "4,2"
export function formatRating(nilai) {
    return Number(nilai).toFixed(1).replace('.', ',');
}