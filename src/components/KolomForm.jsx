// Pembungkus satu isian formulir: label di atas, isian (input/select/textarea) di tengah,
export default function KolomForm({ label, petunjuk, children }) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-sm font-medium">{label}</span>
            {children}
            {petunjuk && <span className="mt-1.5 block text-xs text-abu">{petunjuk}</span>}
        </label>
    );
}