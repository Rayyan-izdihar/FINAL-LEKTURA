'use client';
import { useEffect, useState } from 'react';
import KartuPengumuman from '@/components/KartuPengumuman';

const KATEGORI = ['Operasional', 'Layanan', 'Acara'];
const kelasChip = 'min-h-10 cursor-pointer rounded-full border px-4 text-sm transition-colors';

export default function DaftarPengumuman() {
    const [daftar, setDaftar] = useState(null);
    const [kategori, setKategori] = useState(''); // '' = semua
    const [galat, setGalat] = useState(false);

    useEffect(() => {
        fetch('/api/announcements')
        .then((res) => res.json())
        .then((data) => setDaftar(data.pengumuman))
        .catch(() => setGalat(true));
    }, []);

    // Penyaringan kategori dilakukan di browser karena datanya sedikit.
    const tampil = daftar?.filter((item) => !kategori || item.kategori === kategori);


    return (
        <div className="space-y-6 py-4 md:py-8">
            <div>
                <h1 className="font-judul text-3xl md:text-4xl">Pengumuman</h1>
                <p className="mt-1 text-sm text-tinta-lembut">
                    Informasi operasional, layanan, dan acara perpustakaan.
                </p>
            </div>

            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter kategori pengumuman">
                {['', ...KATEGORI].map((nama) => (
                    <button
                        key={nama || 'semua'}
                        type="button"
                        aria-pressed={kategori === nama}
                        onClick={() => setKategori(nama)}
                        className={`${kelasChip} ${
                        kategori === nama
                            ? 'border-tinta bg-tinta text-krem'
                            : 'border-garis bg-kertas hover:border-tinta/40'
                        }`}
                    >
                        {nama || 'Semua'}
                    </button>
                ))}
            </div>

            {galat && (
                <p role="alert" className="text-sm text-koral-tua">
                    Data tidak dapat dimuat. Periksa koneksi database lalu muat ulang halaman.
                </p>
            )}

            {daftar === null && !galat && <p className="text-sm text-abu">Memuat pengumuman...</p>}

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