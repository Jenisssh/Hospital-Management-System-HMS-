import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, ShieldCheck, User, Stethoscope } from 'lucide-react';
import api from '../api/client.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { extractError } from '../lib/jwt.js';
import { cn } from '../lib/cn.js';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Select from '../components/Select.jsx';
import Spinner from '../components/Spinner.jsx';

const TABS = [
  { key: 'PATIENT', label: 'Patient', icon: User },
  { key: 'DOCTOR', label: 'Doctor', icon: Stethoscope },
  { key: 'ADMIN', label: 'Admin', icon: ShieldCheck },
];

const GENDERS = ['MALE', 'FEMALE', 'OTHER'];
const DEPARTMENTS = [
  'CARDIOLOGY', 'NEUROLOGY', 'ORTHOPEDICS', 'PEDIATRICS', 'DERMATOLOGY',
  'GENERAL_MEDICINE', 'GYNECOLOGY', 'ONCOLOGY', 'RADIOLOGY', 'EMERGENCY',
];

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState('PATIENT');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    gender: 'MALE',
    dateOfBirth: '',
    specialization: '',
    department: 'GENERAL_MEDICINE',
  });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let resp;
      if (role === 'ADMIN') {
        resp = await api.post('/auth/register', {
          username: form.username,
          password: form.password,
          role: 'ADMIN',
        });
      } else if (role === 'PATIENT') {
        resp = await api.post('/auth/register/patient', {
          username: form.username,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          gender: form.gender,
          dateOfBirth: form.dateOfBirth,
          phoneNumber: form.phoneNumber,
        });
      } else {
        resp = await api.post('/auth/register/doctor', {
          username: form.username,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          specialization: form.specialization,
          phoneNumber: form.phoneNumber,
          department: form.department,
        });
      }
      login(resp.data.token);
      toast.success(`Account created — welcome, ${resp.data.username}`);
      navigate('/');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center p-6 md:p-12 aurora-radial">
      <div className="w-full max-w-xl rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-lift p-8">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="text-sm text-ink-muted mt-1">Pick the role that matches you.</p>

        {/* Role tabs */}
        <div className="mt-6 grid grid-cols-3 gap-2 p-1 rounded-lg bg-ink-100 dark:bg-ink-800">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setRole(key)}
              className={cn(
                'flex items-center justify-center gap-2 h-10 rounded-md text-sm font-medium transition-all',
                role === key
                  ? 'bg-white dark:bg-ink-900 text-primary-700 dark:text-primary-300 shadow-soft'
                  : 'text-ink-muted hover:text-ink-700 dark:hover:text-ink-200',
              )}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Username"
            name="username"
            value={form.username}
            onChange={onChange}
            required
            minLength={3}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            required
            minLength={6}
          />

          {role !== 'ADMIN' && (
            <>
              <Input label="First name" name="firstName" value={form.firstName} onChange={onChange} required />
              <Input label="Last name" name="lastName" value={form.lastName} onChange={onChange} required />
              <Input
                label="Phone (10-digit, starts 6-9)"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={onChange}
                required
                pattern="^[6-9]\d{9}$"
                placeholder="9876543210"
              />

              {role === 'PATIENT' && (
                <>
                  <Select label="Gender" name="gender" value={form.gender} onChange={onChange}>
                    {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </Select>
                  <Input
                    label="Date of birth"
                    name="dateOfBirth"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={onChange}
                    required
                    className="sm:col-span-2"
                  />
                </>
              )}

              {role === 'DOCTOR' && (
                <>
                  <Input label="Specialization" name="specialization" value={form.specialization} onChange={onChange} required />
                  <Select label="Department" name="department" value={form.department} onChange={onChange}>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </Select>
                </>
              )}
            </>
          )}

          <Button type="submit" variant="gradient" disabled={loading} className="sm:col-span-2 mt-2">
            {loading ? <Spinner /> : <>Create account <ArrowRight size={16} /></>}
          </Button>
        </form>

        <p className="mt-6 text-sm text-ink-muted text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
