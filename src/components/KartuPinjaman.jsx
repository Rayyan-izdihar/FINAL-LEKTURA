'use client';
import { useState } from 'react';
import Sampul from '@/components/Sampul';
import LencanaStatus from '@/components/LencanaStatus';
import { kelasKartu, kelasTombol } from '@/lib/gaya';
import { formatRupiah, formatTanggal } from '@/lib/format';
import { kirimAksi } from '@/lib/aksi';

function teksSisaHari(sisa) {
    if (sisa < 0) return `Terlambat ${-sisa} hari`;
    if (sisa === 0) return 'Jatuh tempo hari ini';
    if (sisa === 1) return 'Jatuh tempo besok';
    return `Sisa ${sisa} hari`;
}

// Satu pinjaman aktif (menunggu konfirmasi atau sedang dipinjam) di dashboard mahasiswa.
// onUbah = fungsi dari halaman induk untuk memuat ulang data setelah perpanjangan diajukan.
export default function KartuPinjaman({ pinjaman, onUbah }) {
    const [formTerbuka, setFormTerbuka] = useState(false);
    const [alasan, setAlasan] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const menunggu = pinjaman.status === 'Menunggu Konfirmasi';
    const terlambat = pinjaman.sisa_hari !== null && pinjaman.sisa_hari < 0;

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
        <li className={`${kelasKartu} flex gap-4`}>
            <Sampul src={pinjaman.sampul} judul={pinjaman.judul} className="w-20 shrink-0 self-start" />

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <LencanaStatus status={pinjaman.status} />
                    {pinjaman.status_perpanjangan !== 'Tidak Ada' && (
                        <LencanaStatus
                            status={pinjaman.status_perpanjangan}
                            label={`Perpanjangan ${pinjaman.status_perpanjangan.toLowerCase()}`}
                        />
                    )}
                </div>

                <h3 className="mt-2 font-medium leading-snug">{pinjaman.judul}</h3>
                <p className="text-sm text-tinta-lembut">{pinjaman.penulis}</p>

                {menunggu && (
                    <p className="mt-3 text-sm text-tinta-lembut">
                        Diajukan {formatTanggal(pinjaman.tanggal_pengajuan)}. Datang ke meja
                        sirkulasi untuk verifikasi.
                    </p>
                )}

                {!menunggu && (
                    <div className="mt-3 space-y-1 text-sm">
                        <p className="text-tinta-lembut">
                            Dipinjam {formatTanggal(pinjaman.tanggal_pinjam)}
                        </p>
                        <p>
                            Jatuh tempo{' '}
                            <span className="font-medium">
                                {formatTanggal(pinjaman.tanggal_jatuh_tempo)}
                            </span>{' '}
                            <span className={terlambat ? 'font-medium text-koral-tua' : 'text-abu'}>
                                ({teksSisaHari(pinjaman.sisa_hari)})
                            </span>
                        </p>
                        {terlambat && (
                            <p className="font-medium text-koral-tua">
                                Denda berjalan {formatRupiah(pinjaman.denda)} (
                                {pinjaman.hari_terlambat} hari x{' '}
                                {formatRupiah(pinjaman.denda_per_hari)})
                            </p>
                        )}
                    </div>
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

                {pinjaman.bisa_diperpanjang && !formTerbuka && (
                    <button
                        type="button"
                        onClick={() => setFormTerbuka(true)}
                        className={`${kelasTombol.garis} mt-4`}
                    >
                        Ajukan Perpanjangan
                    </button>
                )}

                {pinjaman.bisa_diperpanjang && formTerbuka && (
                    <form onSubmit={kirimPerpanjangan} className="mt-4 space-y-3">
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
        </li>
    );
}