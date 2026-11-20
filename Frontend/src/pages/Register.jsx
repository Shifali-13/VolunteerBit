import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

const SKILLS = ['teaching', 'translation', 'design', 'tech', 'other'];

export default function Register() {
  const [role, setRole] = useState('volunteer');
  const [form, setForm] = useState({ name: '', email: '', password: '', orgName: '', city: '', description: '' });
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const toggleSkill = (s) =>
    setSkills(skills.includes(s) ? skills.filter((x) => x !== s) : [...skills, s]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, role, skills: role === 'volunteer' ? skills : [] };
      const { data } = await api.post('/auth/register', payload);
      login(data.token, data.user);
      toast.success('Account created!');
      nav('/dashboard');
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <form onSubmit={submit} className="bg-white border rounded-2xl shadow-sm p-8 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Create your account</h1>

        <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg">
          {['volunteer', 'ngo'].map((r) => (
            <button
              type="button" key={r} onClick={() => setRole(r)}
              className={`py-2 rounded-md text-sm font-medium capitalize ${role === r ? 'bg-white shadow text-indigo-600' : 'text-gray-600'}`}
            >
              {r === 'ngo' ? 'NGO' : 'Volunteer'}
            </button>
          ))}
        </div>

        <input className="input" placeholder="Your name" required value={form.name} onChange={set('name')} />
        <input className="input" type="email" placeholder="Email" required value={form.email} onChange={set('email')} />
        <input className="input" type="password" placeholder="Password (min 6 characters)" required value={form.password} onChange={set('password')} />

        {role === 'volunteer' ? (
          <div>
            <p className="text-sm font-medium mb-2">Your skills (used for recommendations)</p>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map((s) => (
                <button
                  type="button" key={s} onClick={() => toggleSkill(s)}
                  className={`px-3 py-1 rounded-full text-sm border capitalize ${skills.includes(s) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <input className="input" placeholder="Organisation name" required value={form.orgName} onChange={set('orgName')} />
            <input className="input" placeholder="City" value={form.city} onChange={set('city')} />
            <textarea className="input" rows="3" placeholder="About your organisation" value={form.description} onChange={set('description')} />
          </>
        )}

        <button className="btn w-full" disabled={loading}>{loading ? 'Creating...' : 'Sign up'}</button>
        <p className="text-sm text-center text-gray-600">
          Already have an account? <Link to="/login" className="text-indigo-600 font-medium">Login</Link>
        </p>
      </form>
    </main>
  );
}
