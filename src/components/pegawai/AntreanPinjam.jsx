'use client';
import { useState } from 'react';
import { CalendarDays, Check, Clock, Inbox, X } from 'lucide-react';
import Avatar from '@/components/Avatar';
import Dialog from '@/components/Dialog';
import KondisiKosong from '@/components/KondisiKosong';
import Sampul from '@/components/Sampul';
import StatusPil from '@/components/StatusPil';
import { kirimAksi } from '@/lib/aksi';
import { formatTanggal } from '@/lib/format';
import { kelasAksi, kelasBaris, kelasInput, kelasPeminjam, kelasTombol, kelasTombolAksi, kelasTombolKecil } from '@/lib/gaya';

// Antrean pengajuan pinjam. Pegawai memeriksa mahasiswa di meja sirkulasi, lalu Setujui atau Tolak.
// onSelesai(hasil) dipanggil setelah aksi, supaya halaman induk menampilkan pesan dan memuat ulang data.
export default function AntreanPinjam({ daftar, onSelesai }) {
    const [prosesId, setProsesId] = useState(null); // transaksi yang sedang dikirim ke server
    const [ditolak, setDitolak] = useState(null); // transaksi yang sedang akan ditolak (dialog terbuka)
    const [alasan, setAlasan] = useState('');
    const [loadingTolak, setLoadingTolak] = useState(false);

    async function setujui(item) {
        setProsesId(item.id);
        const hasil = await kirimAksi(`/api/pegawai/loans/${item.id}/setujui`);
        setProsesId(null);
        onSelesai(hasil);
    }

    function bukaDialogTolak(item) {
        setAlasan('');
        setDitolak(item);
    }

    async function kirimTolak(e) {
        e.preventDefault();
        setLoadingTolak(true);
        
        const hasil = await kirimAksi(`/api/pegawai/loans/${ditolak.id}/tolak`, { alasan });
        setLoadingTolak(false);

        // Dialog hanya ditutup kalau berhasil, supaya alasan yang sudah diketik tidak hilang saat gagal
        if (hasil.ok) setDitolak(null);
        onSelesai(hasil);
    }

    if (daftar.length === 0) {
        return (
            <KondisiKosong
                ikon={Inbox}
                judul="Antrean pinjam kosong"
                teks="Belum ada pengajuan baru. Pengajuan dari mahasiswa akan muncul di sini."
            />
        );
    }


    return (
        <>
            <ul className="space-y-4">
                {daftar.map((item) => {
                    const stokHabis = item.stok_tersedia <= 0;
                    const tidakBisa = item.terblokir || stokHabis;

                    return (
                        <li key={item.id} className={kelasBaris}>
                            <Sampul src={item.sampul} judul={item.judul} className="w-20 shrink-0 self-start sm:w-24" />

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                    <span className={kelasPeminjam}>
                                        <Avatar nama={item.nama} ukuran={26} />
                                        <span className="font-medium">{item.nama}</span>
                                        <span className="text-xs text-abu">{item.nim}</span>
                                    </span>

                                    <p className="flex items-center gap-1.5 text-xs text-abu">
                                        <CalendarDays size={13} aria-hidden="true" />
                                        Diajukan {formatTanggal(item.tanggal_pengajuan)}
                                    </p>
                                </div>

                                <h3 className="mt-4 font-judul text-xl leading-snug">{item.judul}</h3>
                                <p className="text-sm text-tinta-lembut">{item.penulis}</p>

                                <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
                                    <StatusPil nada={stokHabis ? 'koral' : 'hijau'}>
                                        {stokHabis ? 'Stok habis' : `Stok tersedia ${item.stok_tersedia}`}
                                    </StatusPil>

                                    <span className="inline-flex items-center gap-1.5 text-xs text-abu">
                                        <Clock size={13} aria-hidden="true" />
                                        Lama pinjam {item.maksimal_pinjam} hari
                                    </span>
                                </div>

                                {item.terblokir && (
                                    <p className="mt-3 rounded-xl bg-koral/10 px-3 py-2 text-sm text-koral-tua">
                                        Mahasiswa ini masih punya denda tertunggak, jadi pengajuan tidak dapat disetujui.
                                    </p>
                                )}
                            </div>

                            <div className={kelasAksi}>
                                <button
                                    type="button"
                                    onClick={() => setujui(item)}
                                    disabled={tidakBisa || prosesId === item.id}
                                    className={`${kelasTombolKecil.hijau} ${kelasTombolAksi}`}
                                >
                                    <Check size={14} aria-hidden="true" />
                                    {prosesId === item.id ? 'Memproses...' : 'Setujui'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => bukaDialogTolak(item)}
                                    disabled={prosesId === item.id}
                                    className={`${kelasTombolKecil.garis} ${kelasTombolAksi}`}
                                >
                                    <X size={14} aria-hidden="true" />
                                    Tolak
                                </button>
                            </div>
                        </li>
                    );
                })}
            </ul>

            <Dialog buka={ditolak !== null} onTutup={() => setDitolak(null)} judul="Tolak pengajuan pinjam">
                {ditolak && (
                    <form onSubmit={kirimTolak} className="space-y-4">
                        <p className="text-sm text-tinta-lembut">
                            {ditolak.nama} mengajukan <span className="font-medium text-tinta">{ditolak.judul}</span>.
                            Alasan penolakan akan terlihat oleh mahasiswa.
                        </p>
                        <label className="block">
                            <span className="mb-1.5 block text-sm font-medium">Alasan penolakan</span>
                            <textarea
                                value={alasan}
                                onChange={(e) => setAlasan(e.target.value)}
                                maxLength={200}
                                rows={3}
                                required
                                placeholder="Contoh: kartu identitas belum dibawa"
                                className={`${kelasInput} py-2.5`}
                            />
                        </label>
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setDitolak(null)} className={kelasTombol.garis}>
                                Batal
                            </button>
                            <button type="submit" disabled={loadingTolak} className={kelasTombol.koral}>
                                {loadingTolak ? 'Menolak...' : 'Tolak pengajuan'}
                            </button>
                        </div>
                    </form>
                )}
            </Dialog>
        </>
    );
}