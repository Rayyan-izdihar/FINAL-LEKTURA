'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import KartuBuku from '@/components/KartuBuku';
import { kelasInput, kelasChip } from '@/lib/gaya';

const OPSI_URUT = [
    { nilai: 'judul', label: 'Judul A-Z' },
    { nilai: 'tahun', label: 'Tahun terbit terbaru' },
    { nilai: 'rating', label: 'Rating tertinggi' },
];


export default function KatalogClient() {
    const router = useRouter();
    const params = useSearchParams();

    // Alamat URL adalah sumber kebenaran: ?q=...&kategori=...&urut=...
    // Mengubah filter berarti mengubah URL, lalu data diambil ulang dari API.
    const q = params.get('q') ?? '';
    const kategori = params.get('kategori') ?? '';
    const urut = params.get('urut') ?? 'judul';
    const kunci = params.toString();

    const [buku, setBuku] = useState([]);
    const [daftarKategori, setDaftarKategori] = useState([]);
    const [loading, setLoading] = useState(true);
    const [galat, setGalat] = useState(false);


    // Kategori untuk tombol filter, diambil sekali.
    useEffect(() => {
        fetch('/api/categories')
            .then((res) => res.json())
            .then((data) => setDaftarKategori(data.kategori))
            .catch(() => setGalat(true));
    }, []);

    // Buku diambil ulang setiap filter (isi URL) berubah.
    useEffect(() => {
        let dibatalkan = false; // mencegah hasil lama menimpa hasil baru kalau filter diganti cepat
        setLoading(true);
        setGalat(false);

        fetch(`/api/books?${kunci}`)
            .then((res) => res.json())
            .then((data) => {
                if (!dibatalkan) {
                    setBuku(data.buku ?? []);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (!dibatalkan) {
                    setGalat(true);
                    setLoading(false);
                }
            });

        return () => {
            dibatalkan = true;
        };
    }, [kunci]);


    // Ubah satu atau beberapa parameter URL. Nilai kosong berarti parameter dihapus.
    function ubahParam(perubahan) {
        const baru = new URLSearchParams(params.toString());

        for (const [nama, nilai] of Object.entries(perubahan)) {
            if (nilai) baru.set(nama, nilai);
            else baru.delete(nama);
        }

        const teks = baru.toString();
        router.push(teks ? `/katalog?${teks}` : '/katalog');
    }

    function kirimPencarian(e) {
        e.preventDefault();
        ubahParam({ q: new FormData(e.currentTarget).get('q').trim() });
    }


    return (
        <div className="space-y-6 py-4 md:py-8">
            <div>
                <h1 className="font-judul text-3xl md:text-4xl">Katalog buku</h1>
                <p className="mt-1 text-sm text-tinta-lembut">
                    {loading ? 'Memuat...' : `${buku.length} buku ditemukan`}
                </p>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* key={q}: kolom ini dibuat ulang saat q berubah dari luar (misalnya tombol reset) */}
                <form key={q} onSubmit={kirimPencarian} role="search" className="relative w-full md:max-w-sm">
                    <Search
                        size={16}
                        aria-hidden="true"
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-abu"
                    />

                    <input
                        type="search"
                        name="q"
                        defaultValue={q}
                        aria-label="Cari judul atau pengarang"
                        placeholder="Cari judul atau pengarang..."
                        className={`${kelasInput} rounded-full pl-10`}
                    />
                </form>

                <label className="flex items-center gap-2 text-sm">
                    <span className="text-tinta-lembut">Urutkan</span>
                    <select
                        value={urut}
                        onChange={(e) => ubahParam({ urut: e.target.value === 'judul' ? '' : e.target.value })}
                        className="min-h-11 cursor-pointer rounded-full border border-garis bg-kertas px-4 text-sm"
                    >
                        {OPSI_URUT.map((opsi) => (
                            <option key={opsi.nilai} value={opsi.nilai}>
                                {opsi.label}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter kategori">
                <button
                    type="button"
                    aria-pressed={kategori === ''}
                    onClick={() => ubahParam({ kategori: '' })}
                    className={`${kelasChip} ${
                        kategori === '' ? 'border-tinta bg-tinta text-krem' : 'border-garis bg-kertas hover:border-tinta/40'
                    }`}
                >
                    Semua
                </button>

                {daftarKategori.map((k) => (
                    <button
                        key={k.id}
                        type="button"
                        aria-pressed={kategori === String(k.id)}
                        onClick={() => ubahParam({ kategori: String(k.id) })}
                        className={`inline-flex items-center gap-2 ${kelasChip} ${
                        kategori === String(k.id)
                            ? 'border-tinta bg-tinta text-krem'
                            : 'border-garis bg-kertas hover:border-tinta/40'
                        }`}
                    >
                        {k.nama} 
                        <span
                            className={`rounded-full px-2 py-0.5 text-xs ${
                                kategori === String(k.id) ? 'bg-krem/20 text-krem' : 'bg-tinta/10 text-tinta'
                            }`}
                        >
                            {k.total_buku}
                        </span>
                    </button>
                ))}
            </div>

            {galat && (
                <p role="alert" className="text-sm text-koral-tua">
                    Data tidak dapat dimuat. Periksa koneksi database lalu muat ulang halaman.
                </p>
            )}

            {!loading && !galat && buku.length === 0 && (
                <div className="rounded-2xl border border-dashed border-garis py-16 text-center">
                    <p className="font-judul text-xl">Tidak ada buku yang cocok</p>
                    <p className="mt-1 text-sm text-tinta-lembut">Coba kata kunci atau kategori lain.</p>

                    <button
                        type="button"
                        onClick={() => router.push('/katalog')}
                        className="mt-4 text-sm underline underline-offset-4"
                    >
                        Hapus semua filter
                    </button>
                </div>
            )}

            {buku.length > 0 && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {buku.map((item) => (
                        <KartuBuku key={item.id} buku={item} />
                    ))}
                </div>
            )}
        </div>
    );
}