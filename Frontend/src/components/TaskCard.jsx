import { Link } from 'react-router-dom';
import { fmtDate } from '../api.js';

export default function TaskCard({ task }) {
  return (
    <Link
      to={`/tasks/${task._id}`}
      className="block bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition"
    >
      <div className="flex justify-between items-start">
        <span className="text-xs font-semibold uppercase bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
          {task.category}
        </span>
        <span className="text-xs text-gray-500">⏱ {task.durationMins} min</span>
      </div>
      <h3 className="mt-3 font-semibold text-lg text-gray-900">{task.title}</h3>
      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <div>🏢 {task.ngo?.orgName} {task.ngo?.city && `· ${task.ngo.city}`}</div>
        <div>📅 {fmtDate(task.date)}</div>
        <div>
          {task.mode === 'online' ? '💻 Online' : `📍 ${task.location || 'On-site'}`} · {task.slotsAvailable} slot(s) left
        </div>
      </div>
    </Link>
  );
}
