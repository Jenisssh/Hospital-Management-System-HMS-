import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, ArrowRight } from 'lucide-react';
import api from '../api/client.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { extractError } from '../lib/jwt.js';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Spinner from '../components/Spinner.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token);
      toast.success(`Welcome back, ${data.username}`);
      navigate('/');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid h-full md:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden md:flex aurora-radial bg-aurora dark:bg-aurora-dark text-white p-12 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          {/* subtle medical cross pattern */}
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="cross" width="64" height="64" patternUnits="userSpaceOnUse">
                <path d="M28 12h8v16h16v8H36v16h-8V36H12v-8h16z" fill="white" fillOpacity="0.05" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cross)" />
          </svg>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <Plus size={22} strokeWidth={2.5} />
          </span>
          <span className="text-xl font-bold tracking-tight">HMS</span>
        </div>
        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-bold tracking-tight leading-tight">
            Hospital management,<br />simplified.
          </h2>
          <p className="mt-3 text-white/80">
            Patients, doctors, appointments, and payments — one place,
            role-aware, built on Spring Cloud microservices.
          </p>
        </div>
        <div className="relative z-10 text-xs text-white/60">
          Demo creds: admin / admin123
        </div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
          <p className="text-sm text-ink-muted mt-1">Welcome back. Enter your credentials.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <Input
              label="Username"
              name="username"
              autoComplete="username"
              value={form.username}
              onChange={onChange}
              required
              autoFocus
            />
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={onChange}
              required
              minLength={6}
            />
            <Button type="submit" variant="gradient" disabled={loading} className="w-full">
              {loading ? <Spinner /> : <>Sign in <ArrowRight size={16} /></>}
            </Button>
          </form>

          <p className="mt-6 text-sm text-ink-muted text-center">
            New here?{' '}
            <Link to="/register" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
