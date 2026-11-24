'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Library, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import Dialog from '@/components/Dialog';
import KondisiKosong from '@/components/KondisiKosong';
import PesanAksi from '@/components/PesanAksi';
import Sampul from '@/components/Sampul';
import Paginasi from '@/components/Paginasi';
import StatusPil from '@/components/StatusPil';
import { kirimAksi } from '@/lib/aksi';
import { kelasInput, kelasPanel, kelasTombol, kelasTombolKecil } from '@/lib/gaya';

// Tombol hapus berwarna merah lembut (di luar varian bawaan gaya.js)
const kelasHapus =
    'inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-koral/40 px-4 text-xs font-medium text-koral-tua transition-colors hover:bg-koral/10';

export default function KelolaBuku() {
    const [buku, setBuku] = useState(null);
    const [kategori, setKategori] = useState([]);
    const [galat, setGalat] = useState('');
    const [cari, setCari] = useState('');
    const [filterKategori, setFilterKategori] = useState('');
    const [versi, setVersi] = useState(0); // naik 1 setiap selesai menghapus, memicu muat ulang
    const [dihapus, setDihapus] = useState(null); // buku yang sedang akan dihapus (dialog terbuka)
    const [loadingHapus, setLoadingHapus] = useState(false);
    const [pesan, setPesan] = useState(null);
    const [halaman, setHalaman] = useState(1);
    const [pagination, setPagination] = useState(null);

    const tutupPesan = useCallback(() => setPesan(null), []);

    // Setelah tambah atau ubah buku, halaman ini dibuka dengan ?pesan=... untuk ditampilkan sekali
    useEffect(() => {
        const pesan = new URLSearchParams(window.location.search).get('pesan');
        if (pesan) {
            setPesan({ ok: true, pesan });
            window.history.replaceState(null, '', '/dashboard/pegawai/buku');
        }
    }, []);

    useEffect(() => {
        fetch('/api/categories')
            .then((res) => res.json())
            .then((data) => setKategori(data.kategori))
            .catch(() => {});
    }, []);

    useEffect(() => {
        let dibatalkan = false;
        const params = new URLSearchParams({ page: String(halaman), limit: '10' });
        if (cari.trim()) params.set('q', cari.trim());
        if (filterKategori) params.set('kategori', filterKategori);

        fetch(`/api/books?${params.toString()}`)
            .then(async (res) => {
                if (!res.ok) throw new Error('gagal');
                const data = await res.json();
                if (!dibatalkan) {
                    setBuku(data.buku ?? []);
                    setPagination(data.pagination ?? null);
                    setGalat('');
                }
            })
            .catch(() => {
                if (!dibatalkan) setGalat('Data tidak dapat dimuat. Periksa koneksi database lalu muat ulang halaman.');
            });
        return () => {
            dibatalkan = true;
        };
    }, [versi, halaman, cari, filterKategori]);

    async function hapus() {
        setLoadingHapus(true);

        const hasil = await kirimAksi(`/api/pegawai/buku/${dihapus.id}/hapus`);
        setLoadingHapus(false);

        setDihapus(null);
        setPesan(hasil);
        if (hasil.ok) setVersi((v) => v + 1);
    }

    const tampil = buku;

    return (
        <div className="space-y-6 py-4 md:py-8">
            <Link
                href="/dashboard/pegawai"
                className="inline-flex items-center gap-1.5 text-sm text-tinta-lembut hover:text-tinta"
            >
                <ArrowLeft size={16} aria-hidden="true" /> Kembali ke dashboard
            </Link>

            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-abu">Kelola</p>
                    <h1 className="mt-1 font-judul text-3xl md:text-4xl">Koleksi buku</h1>
                    <p className="mt-1 text-sm text-tinta-lembut">
                        {pagination ? `${pagination.total} judul dalam katalog` : 'Memuat koleksi...'}
                    </p>
                </div>
                <Link href="/dashboard/pegawai/buku/baru" className={kelasTombol.gelap}>
                    <Plus size={16} aria-hidden="true" />
                    Tambah buku
                </Link>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Search
                        size={16}
                        aria-hidden="true"
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-abu"
                    />
                    <input
                        type="search"
                        value={cari}
                        onChange={(e) => { setCari(e.target.value); setHalaman(1); }}
                        aria-label="Cari judul atau penulis"
                        placeholder="Cari judul atau penulis..."
                        className={`${kelasInput} rounded-full pl-10`}
                    />
                </div>
                <select
                    value={filterKategori}
                    onChange={(e) => { setFilterKategori(e.target.value); setHalaman(1); }}
                    aria-label="Filter kategori"
                    className="min-h-11 cursor-pointer rounded-full border border-garis bg-kertas px-4 text-sm"
                >
                    <option value="">Semua kategori</option>
                    {kategori.map((k) => (
                        <option key={k.id} value={k.id}>
                            {k.nama}
                        </option>
                    ))}
                </select>
            </div>

            {galat && (
                <p role="alert" className="rounded-xl bg-koral/10 px-4 py-3 text-sm text-koral-tua">
                    {galat}
                </p>
            )}

            {buku === null && !galat && (
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="h-28 animate-pulse rounded-2xl bg-garis/60" />
                    ))}
                </div>
            )}

            {tampil?.length === 0 && (
                <KondisiKosong
                    ikon={Library}
                    judul="Tidak ada buku yang cocok"
                    teks="Coba kata kunci atau kategori lain, atau tambahkan buku baru."
                />
            )}

            {tampil?.length > 0 && (
                <>
                <ul className="space-y-3">
                    {tampil.map((b) => {
                        const dipinjam = b.stok_total - b.stok_tersedia;
                        const persen = b.stok_total > 0 ? (b.stok_tersedia / b.stok_total) * 100 : 0;
                        const warnaBatang = b.stok_tersedia === 0 ? 'bg-koral' : persen <= 40 ? 'bg-kuning' : 'bg-hijau';

                        return (                            
                            <li
                                key={b.id}
                                className={`${kelasPanel} grid grid-cols-[64px_minmax(0,1fr)] items-center gap-4 p-4 sm:grid-cols-[76px_minmax(0,1fr)_auto] sm:gap-5 sm:p-5`}
                            >
                                {/* Sampul */}
                                <Sampul
                                    src={b.sampul}
                                    judul={b.judul}
                                    className="w-16 shrink-0 sm:w-[76px]"
                                />

                                {/* Informasi buku */}
                                <div className="min-w-0 self-center">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="font-judul text-lg font-medium leading-snug">
                                            {b.judul}
                                        </h2>
                                        <StatusPil>{b.kategori}</StatusPil>
                                    </div>

                                    <p className="mt-1 text-sm text-tinta-lembut">
                                        {b.penulis} <span className="mx-1 text-abu">·</span> {b.tahun_terbit}
                                    </p>

                                    <div className="mt-4 max-w-md">
                                        <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                                            <span className="text-tinta-lembut">
                                                Ketersediaan buku
                                            </span>
                                            <span className="font-medium text-tinta">
                                                {b.stok_tersedia} / {b.stok_total} tersedia
                                            </span>
                                        </div>

                                        <div className="h-1.5 overflow-hidden rounded-full bg-tinta/10">
                                            <div
                                                className={`h-full rounded-full transition-all ${
                                                    b.stok_tersedia === 0
                                                        ? 'bg-koral'
                                                        : persen <= 40
                                                        ? 'bg-kuning'
                                                        : 'bg-hijau'
                                                }`}
                                                style={{ width: `${persen}%` }}
                                            />
                                        </div>
                                        {dipinjam > 0 && (
                                            <p className="mt-1.5 text-xs text-tinta-lembut">
                                                {dipinjam} sedang dipinjam
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Aksi */}
                                <div className="col-start-2 flex flex-wrap items-center gap-2 sm:col-start-auto sm:justify-end">
                                    <Link
                                        href={`/dashboard/pegawai/buku/${b.id}`}
                                        className={kelasTombolKecil.garis}
                                    >
                                        <Pencil size={14} aria-hidden="true" />
                                        Ubah
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={() => setDihapus(b)}
                                        className={kelasHapus}
                                    >
                                        <Trash2 size={14} aria-hidden="true" />
                                        Hapus
                                    </button>
                                </div>
                            </li>

                        );
                    })}
                </ul>
                <Paginasi
                    halaman={pagination?.halaman ?? halaman}
                    totalHalaman={pagination?.totalHalaman ?? 1}
                    total={pagination?.total ?? tampil.length}
                    limit={pagination?.limit ?? 8}
                    onUbah={setHalaman}
                />
                </>
            )}

            <Dialog buka={dihapus !== null} onTutup={() => setDihapus(null)} judul="Hapus buku?">
                {dihapus && (
                    <div className="space-y-4">
                        <p className="text-sm text-tinta-lembut">
                            <span className="font-medium text-tinta">{dihapus.judul}</span> akan dihapus dari koleksi.
                            Buku yang sedang dipinjam atau punya riwayat transaksi tidak dapat dihapus.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setDihapus(null)} className={kelasTombol.garis}>
                                Batal
                            </button>
                            <button type="button" onClick={hapus} disabled={loadingHapus} className={kelasTombol.koral}>
                                {loadingHapus ? 'Menghapus...' : 'Ya, hapus'}
                            </button>
                        </div>
                    </div>
                )}
            </Dialog>

            <PesanAksi pesan={pesan} onTutup={tutupPesan} />
        </div>
    );
}