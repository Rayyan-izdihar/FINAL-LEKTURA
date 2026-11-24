'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Megaphone, Pencil, Plus, Trash2 } from 'lucide-react';
import Dialog from '@/components/Dialog';
import KondisiKosong from '@/components/KondisiKosong';
import PesanAksi from '@/components/PesanAksi';
import StatusPil from '@/components/StatusPil';
import { kirimAksi } from '@/lib/aksi';
import { formatTanggal } from '@/lib/format';
import { kelasPanel, kelasTombol, kelasTombolKecil } from '@/lib/gaya';
import { gayaKategori } from '@/lib/kategoriPengumuman';

const kelasHapus =
    'inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-koral/40 px-4 text-xs font-medium text-koral-tua transition-colors hover:bg-koral/10';

const kelasChip = 'inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm transition-colors';

export default function KelolaPengumuman() {
    const [daftar, setDaftar] = useState(null);
    const [galat, setGalat] = useState('');
    const [filter, setFilter] = useState(''); // '' = semua, atau 'Published' / 'Draft'
    const [versi, setVersi] = useState(0);
    const [dihapus, setDihapus] = useState(null);
    const [loadingHapus, setLoadingHapus] = useState(false);
    const [pesan, setPesan] = useState(null);

    const tutupPesan = useCallback(() => setPesan(null), []);

    // Pesan hasil simpan dari halaman formulir (?pesan=...)
    useEffect(() => {
        const pesan = new URLSearchParams(window.location.search).get('pesan');
        if (pesan) {
            setPesan({ ok: true, pesan });
            window.history.replaceState(null, '', '/dashboard/pegawai/pengumuman');
        }
    }, []);

    useEffect(() => {
        let dibatalkan = false;
        fetch('/api/pegawai/pengumuman')
            .then(async (res) => {
                if (!res.ok) throw new Error('gagal');
                const data = await res.json();
                if (!dibatalkan) {
                    setDaftar(data.pengumuman);
                    setGalat('');
                }
            })
            .catch(() => {
                if (!dibatalkan) setGalat('Data tidak dapat dimuat. Periksa koneksi database lalu muat ulang halaman.');
            });
        return () => {
            dibatalkan = true;
        };
    }, [versi]);

    async function hapus() {
        setLoadingHapus(true);
        const hasil = await kirimAksi(`/api/pegawai/pengumuman/${dihapus.id}/hapus`);
        setLoadingHapus(false);
        setDihapus(null);
        setPesan(hasil);
        if (hasil.ok) setVersi((v) => v + 1);
    }

    const jumlahPublished = daftar?.filter((p) => p.status === 'Published').length ?? 0;
    const jumlahDraft = daftar?.filter((p) => p.status === 'Draft').length ?? 0;
    const tampil = daftar?.filter((p) => !filter || p.status === filter);

    const daftarFilter = [
        { nilai: '', label: 'Semua', jumlah: daftar?.length ?? 0 },
        { nilai: 'Published', label: 'Published', jumlah: jumlahPublished },
        { nilai: 'Draft', label: 'Draft', jumlah: jumlahDraft },
    ];

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
                    <h1 className="mt-1 font-judul text-3xl md:text-4xl">Pengumuman</h1>
                    <p className="mt-1 text-sm text-tinta-lembut">
                        Kabar operasional, layanan, dan acara perpustakaan.
                    </p>
                </div>
                <Link href="/dashboard/pegawai/pengumuman/baru" className={kelasTombol.koral}>
                    <Plus size={16} aria-hidden="true" />
                    Tulis pengumuman
                </Link>
            </div>

            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter status">
                {daftarFilter.map((f) => (
                    <button
                        key={f.label}
                        type="button"
                        aria-pressed={filter === f.nilai}
                        onClick={() => setFilter(f.nilai)}
                        className={`${kelasChip} ${
                            filter === f.nilai
                                ? 'border-tinta bg-tinta text-krem'
                                : 'border-garis bg-kertas hover:border-tinta/40'
                        }`}
                    >
                        {f.label}
                        <span
                            className={`rounded-full px-2 py-0.5 text-xs ${
                                filter === f.nilai ? 'bg-krem/20 text-krem' : 'bg-tinta/10 text-tinta'
                            }`}
                        >
                            {f.jumlah}
                        </span>
                    </button>
                ))}
            </div>

            {galat && (
                <p role="alert" className="rounded-xl bg-koral/10 px-4 py-3 text-sm text-koral-tua">
                    {galat}
                </p>
            )}

            {daftar === null && !galat && (
                <div className="grid gap-4 md:grid-cols-2">
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="h-44 animate-pulse rounded-2xl bg-garis/60" />
                    ))}
                </div>
            )}

            {tampil?.length === 0 && (
                <KondisiKosong
                    ikon={Megaphone}
                    judul="Belum ada pengumuman"
                    teks="Tulis pengumuman pertama untuk ditampilkan di beranda."
                />
            )}

            {tampil?.length > 0 && (
                <ul className="grid gap-4 md:grid-cols-2">
                    {tampil.map((p) => {
                        const gaya = gayaKategori(p.kategori);

                        return (
                            <li key={p.id} className={`${kelasPanel} flex flex-col p-5`}>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <StatusPil nada={p.status === 'Published' ? 'hijau' : 'kuning'}>{p.status}</StatusPil>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className={`rounded-full px-2.5 py-1 text-xs font-medium ${gaya.latar}`}>
                                            <p className={` ${gaya.teks}`}>
                                                {p.kategori}
                                            </p>
                                        </div>
                                        <time dateTime={p.tanggal_rilis} className="text-xs text-abu">
                                            {formatTanggal(p.tanggal_rilis)}
                                        </time>
                                    </div>
                                </div>

                                <h2 className="mt-3 font-judul text-xl leading-snug">{p.judul}</h2>
                                <p className="mt-1.5 line-clamp-2 text-sm text-tinta-lembut">{p.cuplikan}</p>
                                <p className="mt-3 text-xs text-abu">Ditulis oleh {p.penulis}</p>

                                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                                    <Link href={`/dashboard/pegawai/pengumuman/${p.id}`} className={kelasTombolKecil.garis}>
                                        <Pencil size={14} aria-hidden="true" />
                                        Ubah
                                    </Link>
                                    {p.status === 'Published' && (
                                        <Link href={`/pengumuman/${p.id}`} className={kelasTombolKecil.garis}>
                                            <ExternalLink size={14} aria-hidden="true" />
                                            Lihat
                                        </Link>
                                    )}
                                    <button type="button" onClick={() => setDihapus(p)} className={kelasHapus}>
                                        <Trash2 size={14} aria-hidden="true" />
                                        Hapus
                                    </button>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            )}

            <Dialog buka={dihapus !== null} onTutup={() => setDihapus(null)} judul="Hapus pengumuman?">
                {dihapus && (
                    <div className="space-y-4">
                        <p className="text-sm text-tinta-lembut">
                            <span className="font-medium text-tinta">{dihapus.judul}</span> akan dihapus permanen dan
                            tidak tampil lagi di halaman publik.
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