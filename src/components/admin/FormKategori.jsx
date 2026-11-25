'use client';
import { useState } from 'react';
import KolomForm from '@/components/KolomForm';
import { kirimAksi } from '@/lib/aksi';
import { kelasInput, kelasTombol } from '@/lib/gaya';

// Isi dialog tambah dan ubah kategori. Tanpa `kategori` = tambah, dengan `kategori` = ubah.
export default function FormKategori({ kategori, onSukses, onBatal }) {
    const ubah = Boolean(kategori);

    const [form, setForm] = useState({
        nama: kategori?.nama ?? '',
        kode: kategori?.kode ?? '',
        deskripsi: kategori?.deskripsi ?? '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    function ubahInput(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function kirim(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        const url = ubah ? `/api/admin/kategori/${kategori.id}` : '/api/admin/kategori';
        const hasil = await kirimAksi(url, form);
        setLoading(false);

        if (!hasil.ok) {
            setError(hasil.pesan);
            return;
        }
        onSukses(hasil);
    }

    return (
        <form onSubmit={kirim} className="space-y-4">
            <KolomForm label="Nama kategori">
                <input
                    name="nama"
                    value={form.nama}
                    onChange={ubahInput}
                    maxLength={100}
                    required
                    placeholder="Contoh: Teknologi Informasi"
                    className={kelasInput}
                />
            </KolomForm>

            <KolomForm label="Kode klasifikasi" petunjuk="Huruf, angka, titik, atau tanda hubung. Otomatis huruf besar.">
                <input
                    name="kode"
                    value={form.kode}
                    onChange={ubahInput}
                    maxLength={20}
                    required
                    placeholder="Contoh: TI"
                    className={`${kelasInput} uppercase`}
                />
            </KolomForm>

            <KolomForm label="Deskripsi singkat (opsional)">
                <textarea
                    name="deskripsi"
                    value={form.deskripsi}
                    onChange={ubahInput}
                    maxLength={300}
                    rows={3}
                    className={`${kelasInput} py-2.5`}
                />
            </KolomForm>

            {error && (
                <p role="alert" className="rounded-xl bg-koral/10 px-4 py-3 text-sm text-koral-tua">
                    {error}
                </p>
            )}

            <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={onBatal} className={kelasTombol.garis}>
                    Batal
                </button>
                <button type="submit" disabled={loading} className={kelasTombol.koral}>
                    {loading ? 'Menyimpan...' : ubah ? 'Simpan perubahan' : 'Tambah kategori'}
                </button>
            </div>
        </form>
    );
}