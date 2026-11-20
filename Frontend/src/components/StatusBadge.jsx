const colors = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-indigo-100 text-indigo-800',
  open: 'bg-green-100 text-green-800',
  filled: 'bg-gray-200 text-gray-700',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${colors[status] || 'bg-gray-100'}`}>
      {status}
    </span>
  );
}
