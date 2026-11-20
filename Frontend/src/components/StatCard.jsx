export default function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white border rounded-xl p-5 shadow-sm">
      <div className="text-2xl">{icon}</div>
      <div className="text-3xl font-bold text-indigo-600 mt-2">{value ?? '-'}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}
