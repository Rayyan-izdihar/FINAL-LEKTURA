'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Pencil, Plus, Tag, Tags, Trash2 } from 'lucide-react';
import Dialog from '@/components/Dialog';
import KondisiKosong from '@/components/KondisiKosong';
import PesanAksi from '@/components/PesanAksi';
import StatusPil from '@/components/StatusPil';
import FormKategori from '@/components/admin/FormKategori';
import { kirimAksi } from '@/lib/aksi';
import { kelasPanel, kelasTombol, kelasTombolKecil } from '@/lib/gaya';

const kelasHapus =
    'inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-koral/40 px-4 text-xs font-medium text-koral-tua transition-colors hover:bg-koral/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent';

export default function KelolaKategori() {
    const [daftar, setDaftar] = useState(null);
    const [galat, setGalat] = useState('');
    const [versi, setVersi] = useState(0);
    const [form, setForm] = useState({ terbuka: false, kategori: null }); // dialog tambah/ubah
    const [dihapus, setDihapus] = useState(null);
    const [loadingHapus, setLoadingHapus] = useState(false);
    const [pesan, setPesan] = useState(null);

    const tutupPesan = useCallback(() => setPesan(null), []);

    useEffect(() => {
        let dibatalkan = false;
        fetch('/api/admin/kategori')
            .then(async (res) => {
                if (!res.ok) throw new Error('gagal');
                const data = await res.json();
                if (!dibatalkan) {
                    setDaftar(data.kategori);
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

    function tutupForm() {
        setForm({ terbuka: false, kategori: null });
    }

    function suksesForm(hasil) {
        tutupForm();
        setPesan(hasil);
        setVersi((v) => v + 1);
    }

    async function hapus() {
        setLoadingHapus(true);
        const hasil = await kirimAksi(`/api/admin/kategori/${dihapus.id}/hapus`);
        setLoadingHapus(false);
        setDihapus(null);
        setPesan(hasil);
        if (hasil.ok) setVersi((v) => v + 1);
    }

    return (
        <div className="space-y-6 py-4 md:py-8">
            <Link
                href="/dashboard/admin"
                className="inline-flex items-center gap-1.5 text-sm text-tinta-lembut hover:text-tinta"
            >
                <ArrowLeft size={16} aria-hidden="true" /> Kembali ke dashboard
            </Link>

            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-abu">Kelola</p>
                    <h1 className="mt-1 font-judul text-3xl md:text-4xl">Kategori buku</h1>
                    <p className="mt-1 text-sm text-tinta-lembut">
                        {daftar ? `${daftar.length} kategori` : 'Memuat kategori...'}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setForm({ terbuka: true, kategori: null })}
                    className={kelasTombol.gelap}
                >
                    <Plus size={16} aria-hidden="true" />
                    Tambah kategori
                </button>
            </div>

            {galat && (
                <p role="alert" className="rounded-xl bg-koral/10 px-4 py-3 text-sm text-koral-tua">
                    {galat}
                </p>
            )}

            {daftar === null && !galat && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-48 animate-pulse rounded-2xl bg-garis/60" />
                    ))}
                </div>
            )}

            {daftar?.length === 0 && (
                <KondisiKosong
                    ikon={Tags}
                    judul="Belum ada kategori"
                    teks="Tambahkan kategori pertama agar buku bisa dikelompokkan."
                />
            )}

            {daftar?.length > 0 && (
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {daftar.map((k) => (
                        <li key={k.id} className={`${kelasPanel} flex flex-col p-5`}>
                            <div className="flex items-start justify-between gap-3">
                                <span className="flex size-11 items-center justify-center rounded-xl bg-kuning-muda text-kuning">
                                    <Tag size={20} aria-hidden="true" />
                                </span>
                                <StatusPil>{k.kode}</StatusPil>
                            </div>

                            <h2 className="mt-4 font-judul text-xl leading-snug">{k.nama}</h2>
                            <p className="mt-1 line-clamp-2 text-sm text-tinta-lembut">
                                {k.deskripsi || 'Tanpa deskripsi.'}
                            </p>
                            <p className="mt-3 text-sm text-tinta-lembut">
                                <span className="font-medium text-tinta">{k.total_buku}</span> buku
                            </p>

                            <div className="mt-auto pt-4">
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setForm({ terbuka: true, kategori: k })}
                                        className={kelasTombolKecil.garis}
                                    >
                                        <Pencil size={14} aria-hidden="true" />
                                        Ubah
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDihapus(k)}
                                        disabled={k.total_buku > 0}
                                        className={kelasHapus}
                                    >
                                        <Trash2 size={14} aria-hidden="true" />
                                        Hapus
                                    </button>
                                </div>
                                {k.total_buku > 0 && (
                                    <p className="mt-2 text-xs text-abu">Tidak bisa dihapus selama masih dipakai buku.</p>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <Dialog
                buka={form.terbuka}
                onTutup={tutupForm}
                judul={form.kategori ? 'Ubah kategori' : 'Tambah kategori'}
            >
                {form.terbuka && (
                    <FormKategori
                        key={form.kategori?.id ?? 'baru'}
                        kategori={form.kategori}
                        onSukses={suksesForm}
                        onBatal={tutupForm}
                    />
                )}
            </Dialog>

            <Dialog buka={dihapus !== null} onTutup={() => setDihapus(null)} judul="Hapus kategori?">
                {dihapus && (
                    <div className="space-y-4">
                        <p className="text-sm text-tinta-lembut">
                            Kategori <span className="font-medium text-tinta">{dihapus.nama}</span> akan dihapus
                            permanen.
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