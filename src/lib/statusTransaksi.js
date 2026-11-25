// Daftar status transaksi peminjaman beserta warnanya, dipakai di dashboard admin dan halaman monitoring.
export const DAFTAR_STATUS = ['Menunggu Konfirmasi', 'Sedang Dipinjam', 'Selesai', 'Ditolak'];

// Warna StatusPil untuk tiap status
export const NADA_STATUS = {
    'Menunggu Konfirmasi': 'kuning',
    'Sedang Dipinjam': 'hijau',
    Selesai: 'netral',
    Ditolak: 'koral',
};

// Warna batang pada grafik ringkasan status (kelas ditulis utuh agar terbaca Tailwind)
export const WARNA_BATANG = {
    'Menunggu Konfirmasi': 'bg-kuning',
    'Sedang Dipinjam': 'bg-hijau',
    Selesai: 'bg-tinta',
    Ditolak: 'bg-koral',
};