import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/categories
// Daftar kategori untuk filter di katalog.
// (Fungsi POST untuk tambah kategori oleh admin akan ditambahkan di file ini nanti.)
export async function GET() {
    try {
        const hasil = await query('SELECT id, nama, kode FROM categories ORDER BY nama ASC');
        return NextResponse.json({ kategori: hasil.rows });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}