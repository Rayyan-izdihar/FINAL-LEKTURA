
'use client';

import { useEffect, useState } from 'react';
import KartuPengumuman from '@/components/KartuPengumuman';
import { kelasChip } from '@/lib/gaya';

export default function DaftarPengumuman() {
    const [daftar, setDaftar] = useState(null);
    const [kategori, setKategori] = useState([]);
    const [kategoriDipilih, setKategoriDipilih] = useState('');
    const [galat, setGalat] = useState(false);

    useEffect(() => {
        fetch('/api/announcements')
            .then((res) => {
                if (!res.ok) throw new Error('Gagal mengambil data');
                return res.json();
            })
            .then((data) => {
                setDaftar(data.pengumuman);
                setKategori(data.kategori);
            })
            .catch(() => setGalat(true));
    }, []);

    // Penyaringan kategori dilakukan di browser karena datanya sedikit.
    const tampil = daftar?.filter(
        (item) => !kategoriDipilih || item.kategori === kategoriDipilih
    );

    return (
        <div className="space-y-6 py-4 md:py-8">
            <div>
                <h1 className="font-judul text-3xl md:text-4xl">Pengumuman</h1>
                <p className="mt-1 text-sm text-tinta-lembut">
                    Informasi operasional, layanan, dan acara perpustakaan.
                </p>
            </div>

            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter kategori pengumuman">
                <button
                    type="button"
                    aria-pressed={kategoriDipilih === ''}
                    onClick={() => setKategoriDipilih('')}
                    className={`${kelasChip} ${
                        kategoriDipilih === ''
                            ? 'border-tinta bg-tinta text-krem'
                            : 'border-garis bg-kertas hover:border-tinta/40'
                    }`}
                >
                    Semua
                </button>

                {kategori.map((item) => (
                    <button
                        key={item.kategori}
                        type="button"
                        aria-pressed={kategoriDipilih === item.kategori}
                        onClick={() => setKategoriDipilih(item.kategori)}
                        className={`inline-flex items-center gap-2 ${kelasChip} ${
                            kategoriDipilih === item.kategori
                                ? 'border-tinta bg-tinta text-krem'
                                : 'border-garis bg-kertas hover:border-tinta/40'
                        }`}
                    >
                        {item.kategori}
                        <span
                            className={`rounded-full px-2 py-0.5 text-xs ${
                                kategoriDipilih === String(item.kategori) ? 'bg-krem/20 text-krem' : 'bg-tinta/10 text-tinta'
                            }`}
                        >
                            {item.jumlah}
                        </span>
                    </button>
                ))}
            </div>

            {galat && (
                <p role="alert" className="text-sm text-koral-tua">
                    Data tidak dapat dimuat. Periksa koneksi database lalu muat ulang halaman.
                </p>
            )}

            {daftar === null && !galat && (
                <p className="text-sm text-abu">Memuat pengumuman...</p>
            )}

            {tampil?.length === 0 && (
                <p className="py-10 text-center text-sm text-tinta-lembut">
                    Tidak ada pengumuman untuk kategori ini.
                </p>
            )}

            {tampil?.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                    {tampil.map((item) => (
                        <KartuPengumuman key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
}