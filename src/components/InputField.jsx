import { kelasInput } from '@/lib/gaya';

// Satu kolom isian lengkap dengan labelnya.
// Semua props lain (type, value, onChange, required, ...) diteruskan ke <input>.
export default function InputField({ label, name, ...props }) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-sm font-medium">{label}</span>
            <input name={name} className={kelasInput} {...props} />
        </label>
    );
}