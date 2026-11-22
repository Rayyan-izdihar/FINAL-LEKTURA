'use client';
import { useState } from 'react';
import { ArrowRight, CalendarClock, Check, X } from 'lucide-react';
import Avatar from '@/components/Avatar';
import Dialog from '@/components/Dialog';
import KondisiKosong from '@/components/KondisiKosong';
import Sampul from '@/components/Sampul';
import StatusPil from '@/components/StatusPil';
import { kirimAksi } from '@/lib/aksi';
import { formatTanggal } from '@/lib/format';
import { kelasPanel, kelasTombol, kelasTombolKecil } from '@/lib/gaya';

// Antrean pengajuan perpanjangan. Menyetujui menambah jatuh tempo otomatis sebesar lama pinjam buku.
export default function AntreanPerpanjangan({ daftar, onSelesai }) {
    const [prosesId, setProsesId] = useState(null);
    const [ditolak, setDitolak] = useState(null);
    const [loadingTolak, setLoadingTolak] = useState(false);

    async function setujui(item) {
        setProsesId(item.id);
        const hasil = await kirimAksi(`/api/pegawai/loans/${item.id}/perpanjangan/setujui`);
        setProsesId(null);
        onSelesai(hasil);
    }

    async function tolak() {
        setLoadingTolak(true);
        
        const hasil = await kirimAksi(`/api/pegawai/loans/${ditolak.id}/perpanjangan/tolak`);
        setLoadingTolak(false);

        setDitolak(null);
        onSelesai(hasil);
    }

    if (daftar.length === 0) {
        return (
            <KondisiKosong
                ikon={CalendarClock}
                judul="Tidak ada pengajuan perpanjangan"
                teks="Pengajuan perpanjangan dari mahasiswa akan muncul di sini."
            />
        );
    }

    return (
        <>
            <ul className="space-y-4">
                {daftar.map((item) => {
                    const terlambat = item.hari_terlambat > 0;

                    return (
                        <li key={item.id} className={`${kelasPanel} flex flex-col gap-4 p-4 sm:flex-row sm:p-5`}>
                            <Sampul src={item.sampul} judul={item.judul} className="w-16 shrink-0 self-start" />

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2.5">
                                    <Avatar nama={item.nama} ukuran={30} />
                                    <span className="font-medium">{item.nama}</span>
                                    <span className="text-xs text-abu">{item.nim}</span>
                                </div>

                                <h3 className="mt-3 font-judul text-lg leading-snug">{item.judul}</h3>

                                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                                    <span className="rounded-lg bg-tinta/5 px-2.5 py-1">
                                        {formatTanggal(item.tanggal_jatuh_tempo)}
                                    </span>

                                    <ArrowRight size={16} aria-hidden="true" className="text-abu" />

                                    <span className="rounded-lg bg-hijau-muda px-2.5 py-1 font-medium text-hijau">
                                        {formatTanggal(item.jatuh_tempo_baru)}
                                    </span>

                                    <span className="text-xs text-abu">(+{item.maksimal_pinjam} hari)</span>
                                </div>

                                <p className="mt-3 text-sm text-tinta-lembut">
                                    <span className="text-abu">Diajukan {formatTanggal(item.tanggal_pengajuan_perpanjangan)}. </span>
                                    {item.alasan_perpanjangan ? `"${item.alasan_perpanjangan}"` : 'Tanpa alasan tertulis.'}
                                </p>

                                {terlambat && (
                                    <div className="mt-3">
                                        <StatusPil nada="koral">Terlambat {item.hari_terlambat} hari</StatusPil>

                                        <p className="mt-2 rounded-xl bg-koral/10 px-3 py-2 text-sm text-koral-tua">
                                            Sudah lewat jatuh tempo, jadi perpanjangan tidak bisa disetujui. Tolak pengajuan
                                            atau proses pengembalian di Meja sirkulasi.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex shrink-0 gap-2 sm:flex-col sm:justify-center">
                                <button
                                    type="button"
                                    onClick={() => setujui(item)}
                                    disabled={terlambat || prosesId === item.id}
                                    className={kelasTombolKecil.hijau}
                                >
                                    <Check size={14} aria-hidden="true" />
                                    {prosesId === item.id ? 'Memproses...' : 'Setujui'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setDitolak(item)}
                                    disabled={prosesId === item.id}
                                    className={kelasTombolKecil.garis}
                                >
                                    <X size={14} aria-hidden="true" />
                                    Tolak
                                </button>
                            </div>
                        </li>
                    );
                })}
            </ul>

            <Dialog buka={ditolak !== null} onTutup={() => setDitolak(null)} judul="Tolak perpanjangan?">
                {ditolak && (
                    <div className="space-y-4">
                        <p className="text-sm text-tinta-lembut">
                            Perpanjangan <span className="font-medium text-tinta">{ditolak.judul}</span> oleh{' '}
                            {ditolak.nama} akan ditolak. Jatuh tempo tetap {formatTanggal(ditolak.tanggal_jatuh_tempo)}.
                        </p>

                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setDitolak(null)} className={kelasTombol.garis}>
                                Batal
                            </button>

                            <button type="button" onClick={tolak} disabled={loadingTolak} className={kelasTombol.koral}>
                                {loadingTolak ? 'Menolak...' : 'Ya, tolak'}
                            </button>
                        </div>
                    </div>
                )}
            </Dialog>
        </>
    );
}