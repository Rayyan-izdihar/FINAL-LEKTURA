// Label kecil berwarna untuk status transaksi, perpanjangan, dan denda.
// Contoh: <LencanaStatus status="Sedang Dipinjam" />
//         <LencanaStatus status="Diajukan" label="Perpanjangan diajukan" />
const GAYA = {
    'Menunggu Konfirmasi': 'bg-garis text-tinta-lembut',
    'Sedang Dipinjam': 'bg-tinta text-krem',
    Selesai: 'bg-tinta/10 text-tinta',
    Ditolak: 'bg-koral/10 text-koral-tua',
    Tertunggak: 'bg-koral text-white',
    Lunas: 'bg-tinta/10 text-tinta',
    Diajukan: 'bg-garis text-tinta-lembut',
    Disetujui: 'bg-tinta/10 text-tinta',
};

export default function LencanaStatus({ status, label }) {
    const gaya = GAYA[status] ?? 'bg-tinta/10 text-tinta';

    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${gaya}`}
        >
            {label ?? status}
        </span>
    );
}