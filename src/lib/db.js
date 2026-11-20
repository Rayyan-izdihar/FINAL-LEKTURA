import { Pool } from 'pg';

// Saat `npm run dev`, Next.js memuat ulang file berkali-kali.
// Pool disimpan di globalThis supaya tidak membuat koneksi baru setiap kali reload.
const global_ = globalThis;

const pool = global_.lekturaPool ?? new Pool({ 
    connectionString: process.env.DATABASE_URL 
});

if (process.env.NODE_ENV !== 'production') {
    global_.lekturaPool = pool;
}


export function query(teksSql, parameter = []) {
    return pool.query(teksSql, parameter);
}


export async function dalamTransaksi(kerjakan) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const hasil = await kerjakan(client);
        await client.query('COMMIT');
        return hasil;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}