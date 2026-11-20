'use server';

import { redirect } from 'next/navigation';
import { hapusSesi } from '@/lib/auth';

export async function logout() {
    await hapusSesi();
    redirect('/');
}