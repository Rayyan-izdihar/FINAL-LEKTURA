'use client';
import { useEffect, useState } from 'react';
import KartuPengumuman from '@/components/KartuPengumuman';
import PengumumanUnggulan from '@/components/PengumumanUnggulan';
import { kelasChip } from '@/lib/gaya';

const KATEGORI = ['Acara', 'Layanan', 'Operasional'];

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
    const unggulan = tampil?.[0];
    const lainnya = tampil?.slice(1);

    // Jumlah pengumuman per kategori, ditampilkan di tombol filter
    function jumlah(nama) {
        if (!daftar) return null;
        return nama ? daftar.filter((item) => item.kategori === nama).length : daftar.length;
    }

    return (
        <div className="space-y-6 py-4 md:py-8">
            <div>
                <h1 className="font-judul text-3xl md:text-4xl">Pengumuman</h1>
                <p className="mt-1 text-sm text-tinta-lembut">
                    Informasi operasional, layanan, dan acara perpustakaan.
                </p>
            </div>

            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter kategori pengumuman">
                {['', ...KATEGORI].map((nama) => {
                    const aktif = kategori === nama;
                    return (
                        <button
                            key={nama || 'semua'}
                            type="button"
                            aria-pressed={aktif}
                            onClick={() => setKategori(nama)}
                            className={`${kelasChip} inline-flex items-center gap-2 ${
                                aktif
                                    ? 'border-tinta bg-tinta text-krem'
                                    : 'border-garis bg-kertas hover:border-tinta/40'
                            }`}
                        >
                            {nama || 'Semua'}
                            {jumlah(nama) !== null && (
                                <span
                                    className={`rounded-full px-2 py-0.5 text-xs ${
                                        aktif ? 'bg-krem/20' : 'bg-tinta/5'
                                    }`}
                                >
                                    {jumlah(nama)}
                                </span>
                            )}
                        </button>
                    );
                })}
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

            {unggulan && <PengumumanUnggulan item={unggulan} />}

            {lainnya?.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {lainnya.map((item) => (
                        <KartuPengumuman key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
}