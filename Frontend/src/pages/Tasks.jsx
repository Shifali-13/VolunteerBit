import { useEffect, useState } from 'react';
import api from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import TaskCard from '../components/TaskCard.jsx';
import Spinner from '../components/Spinner.jsx';

export default function Tasks() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ search: '', category: '', mode: '', maxDuration: '' });
  const [tasks, setTasks] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    api.get('/tasks', { params })
      .then((r) => setTasks(r.data))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    if (user?.role === 'volunteer') {
      api.get('/tasks/recommended').then((r) => setRecommended(r.data)).catch(() => {});
    }
  }, [user]);

  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {recommended.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">⭐ Recommended for you</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommended.map((t) => <TaskCard key={t._id} task={t} />)}
          </div>
        </section>
      )}

      <h1 className="text-2xl font-bold mb-4">Browse Tasks</h1>
      <div className="bg-white border rounded-xl p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <input className="input" placeholder="Search title..." value={filters.search} onChange={set('search')} />
        <select className="input" value={filters.category} onChange={set('category')}>
          <option value="">All categories</option>
          {['teaching', 'translation', 'design', 'tech', 'other'].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input" value={filters.mode} onChange={set('mode')}>
          <option value="">Online & On-site</option>
          <option value="online">Online</option>
          <option value="onsite">On-site</option>
        </select>
        <select className="input" value={filters.maxDuration} onChange={set('maxDuration')}>
          <option value="">Any duration</option>
          <option value="30">Up to 30 min</option>
          <option value="45">Up to 45 min</option>
          <option value="60">Up to 60 min</option>
        </select>
      </div>

      {loading ? <Spinner /> : tasks.length === 0 ? (
        <p className="text-center text-gray-500 py-16">No tasks match your filters.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tasks.map((t) => <TaskCard key={t._id} task={t} />)}
        </div>
      )}
    </main>
  );
}
