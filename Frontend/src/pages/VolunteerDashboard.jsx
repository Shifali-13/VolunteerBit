import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg, fmtDate } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import StatCard from '../components/StatCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Spinner from '../components/Spinner.jsx';

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [apps, setApps] = useState(null);
  const [tab, setTab] = useState('applications');

  useEffect(() => {
    api.get('/users/me/stats').then((r) => setStats(r.data));
    api.get('/applications/mine').then((r) => setApps(r.data));
  }, []);

  const download = async (id) => {
    try {
      const res = await api.get(`/certificate/${id}`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  if (!stats || !apps) return <Spinner />;
  const completed = apps.filter((a) => a.status === 'completed');

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Welcome, {user.name} 👋</h1>

      <div className="grid sm:grid-cols-3 gap-4 mt-6">
        <StatCard icon="⏱" label="Total Hours" value={stats.totalHours} />
        <StatCard icon="✅" label="Tasks Completed" value={stats.tasksCompleted} />
        <StatCard icon="🏅" label="Badges" value={stats.badges.length} />
      </div>

      {stats.badges.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {stats.badges.map((b) => (
            <span key={b} className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">🏅 {b}</span>
          ))}
        </div>
      )}

      <div className="mt-8 border-b flex gap-6">
        {[['applications', 'My Applications'], ['certificates', 'Certificates']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`pb-3 font-medium ${tab === k ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>
            {l}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {tab === 'applications' && (apps.length === 0 ? (
          <p className="text-gray-500">No applications yet. <Link to="/tasks" className="text-indigo-600">Browse tasks</Link></p>
        ) : apps.map((a) => (
          <div key={a._id} className="bg-white border rounded-xl p-4 flex flex-wrap justify-between items-center gap-3">
            <div>
              <Link to={`/tasks/${a.task?._id}`} className="font-semibold hover:text-indigo-600">{a.task?.title}</Link>
              <p className="text-sm text-gray-500">{a.task?.ngo?.orgName} · {a.task && fmtDate(a.task.date)}</p>
            </div>
            <StatusBadge status={a.status} />
          </div>
        )))}

        {tab === 'certificates' && (completed.length === 0 ? (
          <p className="text-gray-500">Complete a task to earn your first certificate.</p>
        ) : completed.map((a) => (
          <div key={a._id} className="bg-white border rounded-xl p-4 flex flex-wrap justify-between items-center gap-3">
            <div>
              <p className="font-semibold">{a.task?.title}</p>
              <p className="text-sm text-gray-500">{a.task?.ngo?.orgName} · {a.task?.durationMins} min</p>
            </div>
            <button className="btn" onClick={() => download(a._id)}>⬇ Download PDF</button>
          </div>
        )))}
      </div>
    </main>
  );
}
