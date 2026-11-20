import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      nav('/dashboard');
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4">
      <form onSubmit={submit} className="bg-white border rounded-2xl shadow-sm p-8 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Login to VolunteerBit</h1>
        <input
          className="input" type="email" placeholder="Email" required
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="input" type="password" placeholder="Password" required
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="btn w-full" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        <p className="text-sm text-center text-gray-600">
          New here? <Link to="/register" className="text-indigo-600 font-medium">Create an account</Link>
        </p>
        <div className="border-t pt-4 text-xs text-gray-500">
          <p className="mb-2 font-semibold">Demo accounts (click to fill):</p>
          <div className="flex gap-2 flex-wrap">
            <button type="button" className="btn-light !py-1 !px-2 text-xs"
              onClick={() => setForm({ email: 'volunteer@demo.com', password: 'password123' })}>Volunteer</button>
            <button type="button" className="btn-light !py-1 !px-2 text-xs"
              onClick={() => setForm({ email: 'ngo@demo.com', password: 'password123' })}>NGO</button>
          </div>
        </div>
      </form>
    </main>
  );
}
