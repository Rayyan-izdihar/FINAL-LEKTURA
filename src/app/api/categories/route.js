import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/categories
// Daftar kategori untuk filter di katalog.
// (Fungsi POST untuk tambah kategori oleh admin akan ditambahkan di file ini nanti.)
export async function GET() {
    try {
        const hasil = await query(
            `SELECT c.id, c.nama, c.kode, COUNT(b.id) as total_buku
            FROM categories c
            LEFT JOIN books b ON b.category_id = c.id
            GROUP BY c.id, c.nama
            ORDER BY c.nama ASC`
        );
        return NextResponse.json({ kategori: hasil.rows });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}