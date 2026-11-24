'use client';
import { useEffect, useState } from 'react';
import { BookOpen, Search, Undo2, X } from 'lucide-react';
import Avatar from '@/components/Avatar';
import Dialog from '@/components/Dialog';
import KondisiKosong from '@/components/KondisiKosong';
import Sampul from '@/components/Sampul';
import StatusPil from '@/components/StatusPil';
import { kirimAksi } from '@/lib/aksi';
import { formatRupiah, formatTanggal } from '@/lib/format';
import { kelasAksi, kelasBaris, kelasInput, kelasPeminjam, kelasTombol, kelasTombolAksi, kelasTombolKecil } from '@/lib/gaya';


// Label jatuh tempo: hijau kalau masih lama, kuning kalau dekat, merah kalau terlambat
function PilJatuhTempo({ sisa }) {
    if (sisa < 0) return <StatusPil nada="koral">Terlambat {-sisa} hari</StatusPil>;
    if (sisa === 0) return <StatusPil nada="kuning">Jatuh tempo hari ini</StatusPil>;
    if (sisa === 1) return <StatusPil nada="kuning">Jatuh tempo besok</StatusPil>;
    return <StatusPil nada="hijau">Sisa {sisa} hari</StatusPil>;
}


// Meja pengembalian: cari pinjaman aktif, lalu proses pengembalian buku fisik.
// `versi` berubah setiap ada aksi di halaman induk, sehingga daftar ini ikut dimuat ulang.
export default function MejaSirkulasi({ versi, onSelesai }) {
    const [cari, setCari] = useState('');
    const [q, setQ] = useState(''); // kata kunci yang dipakai untuk mengambil data (setelah ditekan Cari)
    const [daftar, setDaftar] = useState(null);
    const [dipilih, setDipilih] = useState(null);
    const [bayarSekarang, setBayarSekarang] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let dibatalkan = false;

        fetch(`/api/pegawai/sirkulasi?q=${encodeURIComponent(q)}`)
            .then((res) => res.json())
            .then((data) => {
                if (!dibatalkan) setDaftar(data.pinjaman ?? []);
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

    function bukaDialog(item) {
        setBayarSekarang(false);
        setDipilih(item);
    }

    async function konfirmasi() {
        setLoading(true);

        const hasil = await kirimAksi(`/api/pegawai/loans/${dipilih.id}/kembali`, { lunas: bayarSekarang });
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
                        aria-label="Cari pinjaman aktif"
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
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-36 animate-pulse rounded-2xl bg-garis/60" />
                    ))}
                </div>
            )}

            {daftar?.length === 0 && (
                <KondisiKosong
                    ikon={BookOpen}
                    judul={q ? 'Tidak ada hasil' : 'Tidak ada pinjaman aktif'}
                    teks={q ? 'Coba nama, NIM, atau judul lain.' : 'Semua buku sudah kembali ke rak.'}
                />
            )}

            {daftar?.length > 0 && (
                <ul className="space-y-3">
                    {daftar.map((item) => (
                        <li key={item.id} className={kelasBaris}>
                            <Sampul src={item.sampul} judul={item.judul} className="w-16 shrink-0 self-start sm:w-20" />

                            <div className="min-w-0 flex-1">
                                <span className={kelasPeminjam}>
                                    <Avatar nama={item.nama} ukuran={26} />
                                    <span className="font-medium">{item.nama}</span>
                                    <span className="text-xs text-abu">{item.nim}</span>
                                </span>

                                <h3 className="mt-2 font-judul text-lg leading-snug">{item.judul}</h3>

                                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                                    <PilJatuhTempo sisa={item.sisa_hari} />

                                    <span className="text-xs text-abu">
                                        Jatuh tempo {formatTanggal(item.tanggal_jatuh_tempo)}
                                    </span>
                                </div>

                                {item.denda > 0 && (
                                    <p className="mt-3 inline-block rounded-xl bg-koral/10 px-3 py-1.5 text-sm font-medium text-koral-tua">
                                        Denda berjalan {formatRupiah(item.denda)}
                                    </p>
                                )}
                            </div>

                            <div className={kelasAksi}>
                                <button
                                    type="button"
                                    onClick={() => bukaDialog(item)}
                                    className={`${kelasTombolKecil.gelap} ${kelasTombolAksi}`}
                                >
                                    <Undo2 size={14} aria-hidden="true" />
                                    Proses pengembalian
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <Dialog buka={dipilih !== null} onTutup={() => setDipilih(null)} judul="Konfirmasi pengembalian">
                {dipilih && (
                    <div className="space-y-4">
                        <dl className="divide-y divide-garis rounded-xl border border-garis text-sm">
                            {[
                                ['Buku', dipilih.judul],
                                ['Peminjam', `${dipilih.nama} (${dipilih.nim})`],
                                ['Dipinjam', formatTanggal(dipilih.tanggal_pinjam)],
                                ['Jatuh tempo', formatTanggal(dipilih.tanggal_jatuh_tempo)],
                                ['Keterlambatan', dipilih.hari_terlambat > 0 ? `${dipilih.hari_terlambat} hari` : 'Tepat waktu'],
                            ].map(([nama, nilai]) => (
                                <div key={nama} className="flex justify-between gap-4 px-4 py-2.5">
                                    <dt className="text-tinta-lembut">{nama}</dt>
                                    <dd className="text-right font-medium">{nilai}</dd>
                                </div>
                            ))}
                        </dl>

                        {dipilih.denda > 0 ? (
                            <div className="rounded-xl bg-koral/10 p-4">
                                <p className="text-sm text-koral-tua">
                                    Denda {dipilih.hari_terlambat} hari x {formatRupiah(dipilih.denda_per_hari)}
                                </p>

                                <p className="mt-1 font-judul text-2xl text-koral-tua">{formatRupiah(dipilih.denda)}</p>

                                <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm text-tinta">
                                    <input
                                        type="checkbox"
                                        checked={bayarSekarang}
                                        onChange={(e) => setBayarSekarang(e.target.checked)}
                                        className="size-4 accent-koral"
                                    />
                                    Denda dibayar sekarang (catat lunas)
                                </label>
                            </div>
                        ) : (
                            <p className="rounded-xl bg-hijau-muda px-4 py-3 text-sm text-hijau">
                                Dikembalikan tepat waktu, tidak ada denda.
                            </p>
                        )}

                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setDipilih(null)} className={kelasTombol.garis}>
                                Batal
                            </button>

                            <button type="button" onClick={konfirmasi} disabled={loading} className={kelasTombol.gelap}>
                                {loading ? 'Memproses...' : 'Konfirmasi pengembalian'}
                            </button>
                        </div>
                    </div>
                )}
            </Dialog>
        </>
    );
}