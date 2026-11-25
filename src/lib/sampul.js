export const BATAS_UKURAN = 2 * 1024 * 1024; // 2 MB


function kenaliTipe(b) {
    if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
    if (b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
        return 'image/png';
    }
    if (b.length > 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
        return 'image/webp';
    }
    return null;
}


export async function bacaBerkasSampul(berkas) {
    if (!berkas || typeof berkas === 'string' || berkas.size === 0) return { kosong: true };

    if (berkas.size > BATAS_UKURAN) return { pesan: 'Ukuran gambar sampul maksimal 2 MB' };

    const data = Buffer.from(await berkas.arrayBuffer());
    const tipe = kenaliTipe(data);
    if (!tipe) return { pesan: 'Sampul harus berupa gambar JPG, PNG, atau WebP' };

    return { sampul: { tipe, data } };
}


export async function simpanSampul(db, bukuId, { tipe, data }) {
    await db.query(
        `INSERT INTO book_covers (book_id, tipe, data) VALUES ($1, $2, $3)
         ON CONFLICT (book_id) DO UPDATE SET tipe = EXCLUDED.tipe, data = EXCLUDED.data`,
        [bukuId, tipe, data]
    );
    await db.query('UPDATE books SET sampul = $2 WHERE id = $1', [bukuId, `/api/sampul/${bukuId}?v=${Date.now()}`]);
}