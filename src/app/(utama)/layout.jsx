import Shell from '@/components/layout/Shell';

// Semua halaman di folder (utama) otomatis dibungkus Shell (sidebar + topbar).
export default function LayoutUtama({ children }) {
  return <Shell>{children}</Shell>;
}