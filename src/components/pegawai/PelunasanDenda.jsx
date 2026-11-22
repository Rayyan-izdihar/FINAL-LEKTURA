'use client';
import { useEffect, useState } from 'react';
import { HandCoins, Search, X } from 'lucide-react';
import Avatar from '@/components/Avatar';
import Dialog from '@/components/Dialog';
import KondisiKosong from '@/components/KondisiKosong';
import StatusPil from '@/components/StatusPil';
import { kirimAksi } from '@/lib/aksi';
import { formatRupiah, formatTanggal } from '@/lib/format';
import { kelasInput, kelasPanel, kelasTombol, kelasTombolKecil } from '@/lib/gaya';


// Daftar denda tertunggak. Pelunasan hanya bisa dicatat untuk buku yang sudah dikembalikan,
// karena denda pada buku yang belum kembali masih bertambah setiap hari.
export default function PelunasanDenda({ versi, onSelesai, onKeSirkulasi }) {
    const [cari, setCari] = useState('');
    const [q, setQ] = useState('');
    const [daftar, setDaftar] = useState(null);
    const [dipilih, setDipilih] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let dibatalkan = false;

        fetch(`/api/pegawai/denda?q=${encodeURIComponent(q)}`)
            .then((res) => res.json())
            .then((data) => {
                if (!dibatalkan) setDaftar(data.denda ?? []);
            })
            .catch(() => {
                if (!dibatalkan) setDaftar([]);
            });

        return () => {
            dibatalkan = true;
        };
    }, [q, versi]);

    function kirimPencarian(e) {
        e.preventDefault();
        setQ(cari.trim());
    }

    async function catatLunas() {
        setLoading(true);

        const hasil = await kirimAksi(`/api/pegawai/loans/${dipilih.id}/lunas`);
        setLoading(false);

        setDipilih(null);
        onSelesai(hasil);
    }

    return (
        <>
            <form onSubmit={kirimPencarian} role="search" className="mb-5 flex gap-2">
                <div className="relative flex-1">
                    <Search
                        size={16}
                        aria-hidden="true"
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-abu"
                    />

                    <input
                        type="search"
                        value={cari}
                        onChange={(e) => setCari(e.target.value)}
                        aria-label="Cari denda tertunggak"
                        placeholder="Cari nama mahasiswa, NIM, atau judul buku..."
                        className={`${kelasInput} rounded-full pl-10`}
                    />
                </div>

                <button type="submit" className={kelasTombol.gelap}>
                    Cari
                </button>

                {q && (
                    <button
                        type="button"
                        onClick={() => {
                            setCari('');
                            setQ('');
                        }}
                        aria-label="Hapus pencarian"
                        className={`${kelasTombol.garis} px-3`}
                    >
                        <X size={16} aria-hidden="true" />
                    </button>
                )}
            </form>

            {daftar === null && (
                <div className="space-y-3">
                    {[1, 2].map((n) => (
                        <div key={n} className="h-24 animate-pulse rounded-2xl bg-garis/60" />
                    ))}
                </div>
            )}

            {daftar?.length === 0 && (
                <KondisiKosong
                    ikon={HandCoins}
                    judul={q ? 'Tidak ada hasil' : 'Tidak ada denda tertunggak'}
                    teks={q ? 'Coba nama, NIM, atau judul lain.' : 'Semua denda sudah lunas.'}
                />
            )}

            {daftar?.length > 0 && (
                <ul className="space-y-3">
                    {daftar.map((item) => {
                        const sudahKembali = item.status === 'Selesai';

                        return (
                            <li
                                key={item.id}
                                className={`${kelasPanel} flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5`}
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2.5">
                                        <Avatar nama={item.nama} ukuran={30} />
                                        <span className="font-medium">{item.nama}</span>
                                        <span className="text-xs text-abu">{item.nim}</span>
                                    </div>

                                    <p className="mt-2 text-sm text-tinta-lembut">
                                        {item.judul}, terlambat {item.hari_terlambat} hari
                                        {sudahKembali && ` (dikembalikan ${formatTanggal(item.tanggal_kembali)})`}
                                    </p>

                                    <div className="mt-2">
                                        {sudahKembali ? (
                                            <StatusPil nada="hijau">Sudah dikembalikan</StatusPil>
                                        ) : (
                                            <StatusPil nada="kuning">Belum dikembalikan, denda masih bertambah</StatusPil>
                                        )}
                                    </div>
                                </div>

                                <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end">
                                    <p className="font-judul text-2xl text-koral-tua">{formatRupiah(item.nominal)}</p>

                                    {sudahKembali ? (
                                        <button
                                            type="button"
                                            onClick={() => setDipilih(item)}
                                            className={kelasTombolKecil.hijau}
                                        >
                                            Catat pelunasan
                                        </button>
                                    ) : (
                                        <button type="button" onClick={onKeSirkulasi} className={kelasTombolKecil.garis}>
                                            Proses pengembalian dulu
                                        </button>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            <Dialog buka={dipilih !== null} onTutup={() => setDipilih(null)} judul="Catat pelunasan denda">
                {dipilih && (
                    <div className="space-y-4">
                        <p className="text-sm text-tinta-lembut">
                            {dipilih.nama} membayar denda keterlambatan buku{' '}
                            <span className="font-medium text-tinta">{dipilih.judul}</span>.
                        </p>

                        <p className="rounded-xl bg-koral/10 px-4 py-3 text-center font-judul text-3xl text-koral-tua">
                            {formatRupiah(dipilih.nominal)}
                        </p>

                        <p className="text-sm text-tinta-lembut">
                            Setelah dicatat lunas, mahasiswa dapat mengajukan peminjaman lagi.
                        </p>

                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setDipilih(null)} className={kelasTombol.garis}>
                                Batal
                            </button>
                            
                            <button type="button" onClick={catatLunas} disabled={loading} className={kelasTombol.hijau}>
                                {loading ? 'Menyimpan...' : 'Catat lunas'}
                            </button>
                        </div>
                    </div>
                )}
            </Dialog>
        </>
    );
}