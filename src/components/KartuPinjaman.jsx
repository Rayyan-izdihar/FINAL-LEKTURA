'use client';
import { useState } from 'react';
import { Hourglass } from 'lucide-react';
import Sampul from '@/components/Sampul';
import StatusPil from '@/components/StatusPil';
import { kelasPanel, kelasTombol } from '@/lib/gaya';
import { formatRupiah, formatTanggal } from '@/lib/format';
import { kirimAksi } from '@/lib/aksi';

function teksSisaHari(sisa) {
    if (sisa < 0) return `Terlambat ${-sisa} hari`;
    if (sisa === 0) return 'Jatuh tempo hari ini';
    if (sisa === 1) return 'Jatuh tempo besok';
    return `Sisa ${sisa} hari`;
}

// Warna label sisa hari: hijau kalau masih lama, kuning kalau dekat, merah kalau terlambat
function nadaSisaHari(sisa) {
    if (sisa < 0) return 'koral';
    if (sisa <= 1) return 'kuning';
    return 'hijau';
}

const NADA_PERPANJANGAN = { Diajukan: 'kuning', Disetujui: 'hijau', Ditolak: 'koral' };

// Satu pinjaman aktif (menunggu konfirmasi atau sedang dipinjam) di dashboard mahasiswa.
// onUbah = fungsi dari halaman induk untuk memuat ulang data setelah perpanjangan diajukan.
export default function KartuPinjaman({ pinjaman, onUbah }) {
    const [formTerbuka, setFormTerbuka] = useState(false);
    const [alasan, setAlasan] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const menunggu = pinjaman.status === 'Menunggu Konfirmasi';
    const terlambat = pinjaman.sisa_hari !== null && pinjaman.sisa_hari < 0;

    // Pengajuan yang menunggu tapi stoknya tidak cukup untuk semua pengaju: perlu menunggu buku dikembalikan
    const stokHabis = pinjaman.stok_tersedia <= 0;
    const perluAntre = menunggu && stokHabis;

    async function kirimPerpanjangan(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        const res = await kirimAksi(`/api/loans/${pinjaman.id}/perpanjangan`, { alasan })
        setLoading(false);

        if (!res.ok) {
            setError(res.pesan);
            return;
        }

        setFormTerbuka(false);
        setAlasan('');
        onUbah();
    }


    return (
        <li className={`${kelasPanel} flex gap-4 p-4 sm:gap-5 sm:p-5`}>
            <Sampul src={pinjaman.sampul} judul={pinjaman.judul} className="w-20 shrink-0 self-start sm:w-24" />

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <StatusPil nada={menunggu ? 'kuning' : 'tinta'}>{pinjaman.status}</StatusPil>

                    {menunggu && perluAntre && !stokHabis && (
                        <StatusPil nada="netral">Antrean ke-{pinjaman.posisi_antrean}</StatusPil>
                    )}

                    {!menunggu && <StatusPil nada={nadaSisaHari(pinjaman.sisa_hari)}>{teksSisaHari(pinjaman.sisa_hari)}</StatusPil>}

                    {pinjaman.status_perpanjangan !== 'Tidak Ada' && (
                        <StatusPil nada={NADA_PERPANJANGAN[pinjaman.status_perpanjangan]}>
                            Perpanjangan {pinjaman.status_perpanjangan.toLowerCase()}
                        </StatusPil>
                    )}
                </div>

                <h3 className="mt-3 font-judul text-xl leading-snug">{pinjaman.judul}</h3>
                <p className="text-sm text-tinta-lembut">{pinjaman.penulis}</p>

                {menunggu && (
                    <p className="mt-4 rounded-xl bg-krem px-3 py-2 text-sm text-tinta-lembut">
                        Diajukan {formatTanggal(pinjaman.tanggal_pengajuan)}.{' '}
                        {perluAntre ? 'Pengajuanmu tetap tercatat.' : 'Datang ke meja sirkulasi untuk verifikasi.'}
                    </p>
                )}

                {perluAntre && (
                    <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-kuning-muda px-3 py-2.5 text-sm text-kuning">
                        <Hourglass size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
                        <p>
                            {stokHabis && 'Stok buku ini sedang habis. Kamu perlu menunggu sampai ada buku yang dikembalikan, baru pengajuan bisa disetujui.'}
                        </p>
                    </div>
                )}

                {!menunggu && (
                    <>
                        <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-garis bg-garis text-sm">
                            <div className="bg-krem px-3 py-2">
                                <p className="text-xs text-abu">Dipinjam</p>
                                <p className="font-medium">{formatTanggal(pinjaman.tanggal_pinjam)}</p>
                            </div>
                            <div className="bg-krem px-3 py-2">
                                <p className="text-xs text-abu">Jatuh tempo</p>
                                <p className={`font-medium ${terlambat ? 'text-koral-tua' : ''}`}>
                                    {formatTanggal(pinjaman.tanggal_jatuh_tempo)}
                                </p>
                            </div>
                        </div>

                        {terlambat && (
                            <p className="mt-3 rounded-xl bg-koral/10 px-3 py-2 text-sm font-medium text-koral-tua">
                                Denda berjalan {formatRupiah(pinjaman.denda)} ({pinjaman.hari_terlambat} hari x{' '}
                                {formatRupiah(pinjaman.denda_per_hari)})
                            </p>
                        )}
                    </>
                )}

                {/* Bagian perpanjangan */}
                {pinjaman.status_perpanjangan === 'Diajukan' && (
                    <p className="mt-3 text-sm text-tinta-lembut">
                        Perpanjangan menunggu persetujuan pegawai.
                    </p>
                )}
                {pinjaman.status_perpanjangan === 'Disetujui' && (
                    <p className="mt-3 text-sm text-tinta-lembut">
                        Perpanjangan disetujui, jatuh tempo sudah diperbarui.
                    </p>
                )}
                {pinjaman.status_perpanjangan === 'Ditolak' && (
                    <p className="mt-3 text-sm text-tinta-lembut">
                        Perpanjangan ditolak. Kembalikan buku sebelum jatuh tempo.
                    </p>
                )}
                {!menunggu && terlambat && pinjaman.status_perpanjangan === 'Tidak Ada' && (
                    <p className="mt-3 text-sm text-abu">
                        Perpanjangan tidak tersedia karena sudah melewati jatuh tempo.
                    </p>
                )}

                {pinjaman.bisa_diperpanjang && (
                    <div className="mt-4 border-t border-dashed border-garis pt-4">
                        {!formTerbuka ? (
                            <button
                                type="button"
                                onClick={() => setFormTerbuka(true)}
                                className={kelasTombol.garis}
                            >
                                Ajukan Perpanjangan
                            </button>
                        ) : (
                            <form onSubmit={kirimPerpanjangan} className="space-y-3">
                                <label className="block">
                                    <span className="mb-1.5 block text-sm font-medium">
                                        Alasan perpanjangan (opsional)
                                    </span>
                                    <textarea
                                        value={alasan}
                                        onChange={(e) => setAlasan(e.target.value)}
                                        maxLength={200}
                                        rows={2}
                                        className="w-full rounded-xl border border-garis bg-krem px-4 py-2.5 text-sm focus:border-tinta"
                                    />
                                </label>

                                {error && (
                                    <p role="alert" className="rounded-xl bg-koral/10 px-4 py-2.5 text-sm text-koral-tua">
                                        {error}
                                    </p>
                                )}

                                <div className="flex gap-2">
                                    <button type="submit" disabled={loading} className={kelasTombol.gelap}>
                                        {loading ? 'Mengirim...' : 'Kirim pengajuan'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormTerbuka(false)}
                                        className={kelasTombol.garis}
                                    >
                                        Batal
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </li>
    );
}