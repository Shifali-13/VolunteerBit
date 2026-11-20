import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-indigo-600">
          🤝 VolunteerBit
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link to="/tasks" className="hover:text-indigo-600">Browse Tasks</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
              <span className="hidden sm:inline text-gray-500">Hi, {user.name.split(' ')[0]}</span>
              <button
                className="btn-light"
                onClick={() => { logout(); nav('/'); }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-indigo-600">Login</Link>
              <Link to="/register" className="btn">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
