import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg, fmtDate } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import Spinner from '../components/Spinner.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function TaskDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    api.get(`/tasks/${id}`).then((r) => setTask(r.data)).catch(() => toast.error('Task not found'));
  }, [id]);

  const apply = async () => {
    setApplying(true);
    try {
      await api.post(`/tasks/${id}/apply`);
      toast.success('Application sent!');
      setApplied(true);
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setApplying(false);
    }
  };

  if (!task) return <Spinner />;

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/tasks" className="text-sm text-indigo-600">← Back to tasks</Link>
      <div className="bg-white border rounded-2xl shadow-sm p-8 mt-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase bg-indigo-50 text-indigo-700 px-2 py-1 rounded">{task.category}</span>
          <StatusBadge status={task.status} />
        </div>
        <h1 className="text-3xl font-bold mt-3">{task.title}</h1>
        <p className="text-gray-600 mt-4 whitespace-pre-line">{task.description}</p>

        <div className="grid sm:grid-cols-2 gap-4 mt-6 text-sm">
          <div className="bg-slate-50 p-4 rounded-lg">🏢 <b>{task.ngo?.orgName}</b><br />{task.ngo?.city}</div>
          <div className="bg-slate-50 p-4 rounded-lg">📅 {fmtDate(task.date)}</div>
          <div className="bg-slate-50 p-4 rounded-lg">⏱ {task.durationMins} minutes</div>
          <div className="bg-slate-50 p-4 rounded-lg">
            {task.mode === 'online' ? '💻 Online' : `📍 ${task.location || 'On-site'}`} · {task.slotsAvailable} slot(s) left
          </div>
        </div>

        <div className="mt-8">
          {!user ? (
            <Link to="/login" className="btn inline-block">Login to apply</Link>
          ) : user.role !== 'volunteer' ? (
            <p className="text-sm text-gray-500">Only volunteers can apply to tasks.</p>
          ) : (
            <button className="btn" onClick={apply} disabled={applying || applied || task.status !== 'open'}>
              {applied ? 'Applied ✓' : applying ? 'Applying...' : 'Apply for this task'}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
