'use client';
import { useEffect, useState } from 'react';
import { Bell, CalendarClock, CircleCheck, CircleX, Wallet } from 'lucide-react';
import KondisiKosong from '@/components/KondisiKosong';
import Paginasi from '@/components/Paginasi';
import { kirimAksi } from '@/lib/aksi';
import { kelasPanel, kelasTombolKecil } from '@/lib/gaya';
import { useSekarang } from '@/lib/useSekarang';
import { formatWaktuLalu } from '@/lib/waktuLalu';

// Ikon, warna, dan judul untuk tiap jenis notifikasi (sesuai pilihan di tabel notifications)
const TAMPILAN = {
    jatuh_tempo: { ikon: CalendarClock, bulat: 'bg-kuning-muda text-kuning', judul: 'Jatuh tempo besok' },
    denda_baru: { ikon: Wallet, bulat: 'bg-koral/10 text-koral-tua', judul: 'Denda tercatat' },
    pinjam_disetujui: { ikon: CircleCheck, bulat: 'bg-hijau-muda text-hijau', judul: 'Peminjaman disetujui' },
    pinjam_ditolak: { ikon: CircleX, bulat: 'bg-koral/10 text-koral-tua', judul: 'Peminjaman ditolak' },
    perpanjangan_disetujui: { ikon: CircleCheck, bulat: 'bg-hijau-muda text-hijau', judul: 'Perpanjangan disetujui' },
    perpanjangan_ditolak: { ikon: CircleX, bulat: 'bg-koral/10 text-koral-tua', judul: 'Perpanjangan ditolak' },
};

// Bagian "Notifikasi" di dashboard mahasiswa: log notifikasi dengan penanda belum dibaca.
export default function NotifikasiMahasiswa() {
    const [daftar, setDaftar] = useState(null);
    const [pagination, setPagination] = useState(null);
    const [belumDibaca, setBelumDibaca] = useState(0);
    const [halaman, setHalaman] = useState(1);
    const [versi, setVersi] = useState(0); // naik 1 setiap ada yang ditandai dibaca, memicu muat ulang
    const [galat, setGalat] = useState('');
    const [loadingSemua, setLoadingSemua] = useState(false);

    // Server hanya mengirim detik_lalu pada saat data dimuat. Supaya tulisan "x menit lalu" terus berjalan,
    // simpan kapan data dimuat, lalu tambahkan waktu yang sudah lewat sejak itu (diperbarui tiap menit).
    const [dimuatPada, setDimuatPada] = useState(() => Date.now());
    const sekarang = useSekarang();

    useEffect(() => {
        let dibatalkan = false;
        fetch(`/api/notifications?page=${halaman}&limit=5`)
            .then(async (res) => {
                if (!res.ok) throw new Error('gagal');
                const data = await res.json();
                if (dibatalkan) return;
                setDaftar(data.notifikasi);
                setPagination(data.pagination);
                setBelumDibaca(data.belum_dibaca);
                setDimuatPada(Date.now());
                setGalat('');
            })
            .catch(() => {
                if (!dibatalkan) setGalat('Notifikasi tidak dapat dimuat. Muat ulang halaman untuk mencoba lagi.');
            });
        return () => {
            dibatalkan = true;
        };
    }, [halaman, versi]);

    // Lonceng di topbar menuju /dashboard/mahasiswa#notifikasi. Dashboard menampilkan kerangka dulu dan baru
    useEffect(() => {
        if (window.location.hash !== '#notifikasi') return;

        const id = requestAnimationFrame(() => {
            document.getElementById('notifikasi')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        return () => cancelAnimationFrame(id);
    }, []);
    

    // Setelah mengubah status baca: muat ulang daftar ini, dan beri tahu lonceng di topbar
    function segarkan() {
        setVersi((v) => v + 1);
        window.dispatchEvent(new Event('notifikasi-berubah'));
    }

    async function tandaiDibaca(id) {
        await kirimAksi('/api/notifications/baca', { id });
        segarkan();
    }

    async function tandaiSemua() {
        setLoadingSemua(true);
        await kirimAksi('/api/notifications/baca', { semua: true });
        setLoadingSemua(false);
        segarkan();
    }

    return (
        <section id="notifikasi" aria-labelledby="judul-notifikasi" className="scroll-mt-24">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="judul-notifikasi" className="flex items-center gap-3 font-judul text-2xl">
                    Notifikasi
                    {belumDibaca > 0 && (
                        <span className="rounded-full bg-koral px-2.5 py-0.5 font-isi text-xs font-semibold text-white">
                            {belumDibaca} baru
                        </span>
                    )}
                </h2>
                {belumDibaca > 0 && (
                    <button
                        type="button"
                        onClick={tandaiSemua}
                        disabled={loadingSemua}
                        className={kelasTombolKecil.garis}
                    >
                        {loadingSemua ? 'Memproses...' : 'Tandai semua dibaca'}
                    </button>
                )}
            </div>

            {galat && (
                <p role="alert" className="mt-4 rounded-xl bg-koral/10 px-4 py-3 text-sm text-koral-tua">
                    {galat}
                </p>
            )}

            {daftar === null && !galat && (
                <div className="mt-4 space-y-3">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-20 animate-pulse rounded-2xl bg-garis/60" />
                    ))}
                </div>
            )}

            {daftar?.length === 0 && (
                <div className="mt-4">
                    <KondisiKosong
                        ikon={Bell}
                        judul="Belum ada notifikasi"
                        teks="Pengingat jatuh tempo, denda, dan keputusan pegawai akan muncul di sini."
                    />
                </div>
            )}

            {daftar?.length > 0 && (
                <div className={`${kelasPanel} mt-4 overflow-hidden`}>
                    <ul className="divide-y divide-garis">
                        {daftar.map((n) => {
                            const tampilan = TAMPILAN[n.tipe] ?? TAMPILAN.pinjam_disetujui;
                            const Ikon = tampilan.ikon;

                            return (
                                <li
                                    key={n.id}
                                    className={`flex items-start gap-4 px-4 py-4 sm:px-5 ${
                                        n.dibaca ? '' : 'bg-krem/70'
                                    }`}
                                >
                                    <span
                                        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tampilan.bulat}`}
                                    >
                                        <Ikon size={20} aria-hidden="true" />
                                    </span>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                                            <p className={`text-sm ${n.dibaca ? 'font-medium' : 'font-semibold'}`}>
                                                {tampilan.judul}
                                            </p>
                                            <span className="text-xs text-abu">{formatWaktuLalu(n.detik_lalu + Math.max(0, Math.floor((sekarang - dimuatPada) / 1000)))}</span>
                                            {!n.dibaca && (
                                                <span className="flex items-center gap-1.5 text-xs font-medium text-koral-tua">
                                                    <span aria-hidden="true" className="size-1.5 rounded-full bg-koral" />
                                                    Baru
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-1 text-sm text-tinta-lembut">{n.pesan}</p>
                                    </div>
                                    
                                    {!n.dibaca && (
                                        <button
                                            type="button"
                                            onClick={() => tandaiDibaca(n.id)}
                                            className="mt-2 cursor-pointer text-xs font-medium underline underline-offset-4 hover:text-koral-tua"
                                        >
                                            Tandai dibaca
                                        </button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>

                    {pagination && (
                        <div className="px-5 pb-5">
                            <Paginasi
                                halaman={pagination.halaman}
                                totalHalaman={pagination.totalHalaman}
                                total={pagination.total}
                                limit={pagination.limit}
                                onUbah={setHalaman}
                            />
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}