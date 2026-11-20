import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg, fmtDate } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import StatCard from '../components/StatCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Spinner from '../components/Spinner.jsx';

const empty = {
  title: '', description: '', category: 'teaching', durationMins: 30,
  mode: 'online', location: '', date: '', slotsAvailable: 1,
};

export default function NgoDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState(null);
  const [apps, setApps] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);

  const load = () => {
    api.get('/users/me/stats').then((r) => setStats(r.data));
    api.get('/tasks/mine').then((r) => setTasks(r.data));
    api.get('/applications/ngo').then((r) => setApps(r.data));
  };
  useEffect(load, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const postTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', {
        ...form,
        durationMins: Number(form.durationMins),
        slotsAvailable: Number(form.slotsAvailable),
      });
      toast.success('Task posted!');
      setForm(empty);
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const act = async (request, message) => {
    try {
      await request();
      toast.success(message);
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  if (!stats || !tasks || !apps) return <Spinner />;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h1 className="text-2xl font-bold">{user.orgName || user.name} · NGO Dashboard</h1>
        <button className="btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Close' : '+ Post New Task'}
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mt-6">
        <StatCard icon="📋" label="Tasks Posted" value={stats.tasksPosted} />
        <StatCard icon="🙋" label="Total Applicants" value={stats.totalApplicants} />
        <StatCard icon="✅" label="Completed" value={stats.completed} />
      </div>

      {showForm && (
        <form onSubmit={postTask} className="bg-white border rounded-xl p-6 mt-6 grid sm:grid-cols-2 gap-4">
          <input className="input sm:col-span-2" placeholder="Task title" required value={form.title} onChange={set('title')} />
          <textarea className="input sm:col-span-2" rows="3" placeholder="Description" required value={form.description} onChange={set('description')} />
          <select className="input" value={form.category} onChange={set('category')}>
            {['teaching', 'translation', 'design', 'tech', 'other'].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="input" value={form.mode} onChange={set('mode')}>
            <option value="online">Online</option>
            <option value="onsite">On-site</option>
          </select>
          <input className="input" type="number" min="15" max="240" placeholder="Duration (minutes)" required value={form.durationMins} onChange={set('durationMins')} />
          <input className="input" type="number" min="1" placeholder="Slots" required value={form.slotsAvailable} onChange={set('slotsAvailable')} />
          <input className="input" type="datetime-local" required value={form.date} onChange={set('date')} />
          {form.mode === 'onsite' && (
            <input className="input" placeholder="Location" value={form.location} onChange={set('location')} />
          )}
          <button className="btn sm:col-span-2">Post Task</button>
        </form>
      )}

      <h2 className="text-xl font-bold mt-10 mb-3">Applicants</h2>
      <div className="bg-white border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-3">Volunteer</th>
              <th className="p-3">Task</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {apps.length === 0 && (
              <tr><td colSpan="4" className="p-6 text-center text-gray-500">No applicants yet.</td></tr>
            )}
            {apps.map((a) => (
              <tr key={a._id} className="border-t">
                <td className="p-3">
                  <div className="font-medium">{a.volunteer?.name}</div>
                  <div className="text-xs text-gray-500">{a.volunteer?.email}</div>
                </td>
                <td className="p-3">{a.task?.title}</td>
                <td className="p-3"><StatusBadge status={a.status} /></td>
                <td className="p-3 space-x-2">
                  {a.status === 'pending' && (
                    <>
                      <button className="bg-green-600 text-white px-3 py-1 rounded-md"
                        onClick={() => act(() => api.patch(`/applications/${a._id}`, { status: 'accepted' }), 'Accepted')}>
                        Accept
                      </button>
                      <button className="bg-red-600 text-white px-3 py-1 rounded-md"
                        onClick={() => act(() => api.patch(`/applications/${a._id}`, { status: 'rejected' }), 'Rejected')}>
                        Reject
                      </button>
                    </>
                  )}
                  {a.status === 'accepted' && (
                    <button className="btn !py-1 !px-3"
                      onClick={() => act(() => api.patch(`/applications/${a._id}/complete`), 'Marked complete. Certificate unlocked!')}>
                      Mark Complete
                    </button>
                  )}
                  {['rejected', 'completed'].includes(a.status) && <span className="text-gray-400">-</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-xl font-bold mt-10 mb-3">My Tasks</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {tasks.length === 0 && <p className="text-gray-500">You haven't posted any tasks yet.</p>}
        {tasks.map((t) => (
          <div key={t._id} className="bg-white border rounded-xl p-4">
            <div className="flex justify-between items-start gap-2">
              <h3 className="font-semibold">{t.title}</h3>
              <StatusBadge status={t.status} />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {fmtDate(t.date)} · {t.durationMins} min · {t.applicantCount} applicant(s) · {t.slotsAvailable} slot(s) left
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
