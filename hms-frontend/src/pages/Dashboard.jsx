import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Stethoscope,
  CalendarDays,
  CreditCard,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import api from '../api/client.js';
import { useAuth } from '../auth/AuthContext.jsx';
import Card, { CardHeader } from '../components/Card.jsx';
import Skeleton from '../components/Skeleton.jsx';
import { cn } from '../lib/cn.js';

function StatCard({ icon: Icon, label, value, color, loading }) {
  return (
    <Card className="overflow-hidden relative">
      <div className={cn('absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10', color)} />
      <div className={cn('inline-flex h-10 w-10 items-center justify-center rounded-xl', color)}>
        <Icon size={18} className="text-white" />
      </div>
      <div className="mt-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">{label}</div>
      <div className="mt-1 text-3xl font-bold tracking-tight">
        {loading ? <Skeleton className="h-8 w-16" /> : value}
      </div>
    </Card>
  );
}

function buildChartData(appointments) {
  // Group by date for last 7 days; if none, show empty buckets
  const byDate = {};
  appointments.forEach((a) => {
    byDate[a.appointmentDate] = (byDate[a.appointmentDate] || 0) + 1;
  });
  return Object.entries(byDate)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .slice(-7)
    .map(([date, count]) => ({ date: date.slice(5), count }));
}

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ patients: 0, doctors: 0, appointments: 0, revenue: 0 });
  const [chart, setChart] = useState([]);
  const [upcoming, setUpcoming] = useState([]);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const fetches = [];
    if (user?.role === 'admin') {
      fetches.push(api.get('/patients'));
      fetches.push(api.get('/doctors'));
      fetches.push(api.get('/appointments'));
      fetches.push(api.get('/payments'));
    } else {
      fetches.push(Promise.resolve({ data: [] }));
      fetches.push(Promise.resolve({ data: [] }));
      fetches.push(api.get('/appointments'));
      fetches.push(user?.role === 'patient' ? api.get('/payments') : Promise.resolve({ data: [] }));
    }

    Promise.allSettled(fetches)
      .then(([p, d, a, pay]) => {
        if (!active) return;
        const appointments = a.status === 'fulfilled' ? a.value.data : [];
        const payments = pay.status === 'fulfilled' ? pay.value.data : [];
        const revenue = payments
          .filter((x) => x.paymentStatus === 'PAID')
          .reduce((sum, x) => sum + Number(x.amount || 0), 0);
        setStats({
          patients: p.status === 'fulfilled' ? p.value.data.length : 0,
          doctors: d.status === 'fulfilled' ? d.value.data.length : 0,
          appointments: appointments.length,
          revenue,
        });
        setChart(buildChartData(appointments));
        setUpcoming(
          appointments
            .filter((x) => x.status === 'SCHEDULED' || x.status === 'CONFIRMED')
            .sort((x, y) =>
              x.appointmentDate.localeCompare(y.appointmentDate) ||
              x.appointmentTime.localeCompare(y.appointmentTime),
            )
            .slice(0, 5),
        );
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [user]);

  const isAdmin = user?.role === 'admin';
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-aurora dark:bg-aurora-dark text-white p-8 aurora-radial shadow-glow">
        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight">{greeting}, {user?.username}</h1>
          <p className="mt-1 text-white/80">
            {isAdmin
              ? "Here's what's happening across the hospital today."
              : user?.role === 'doctor'
              ? "Here are the appointments assigned to you."
              : "Here's a summary of your appointments and payments."}
          </p>
        </div>
      </div>

      {/* Stats — admin only */}
      {isAdmin && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Patients" value={stats.patients} color="bg-primary-500" loading={loading} />
          <StatCard icon={Stethoscope} label="Doctors" value={stats.doctors} color="bg-accent-500" loading={loading} />
          <StatCard icon={CalendarDays} label="Appointments" value={stats.appointments} color="bg-cyan-500" loading={loading} />
          <StatCard icon={CreditCard} label="Revenue" value={`₹${Number(stats.revenue).toLocaleString()}`} color="bg-emerald-500" loading={loading} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        {isAdmin && (
          <Card className="lg:col-span-2">
            <CardHeader title="Appointments by date" description="Recent activity" action={<TrendingUp size={18} className="text-primary-500" />} />
            <div className="h-64">
              {chart.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-ink-muted">No data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chart}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-ink-200 dark:stroke-ink-800" />
                    <XAxis dataKey="date" stroke="currentColor" fontSize={12} />
                    <YAxis stroke="currentColor" fontSize={12} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'rgb(15 23 42)',
                        border: 'none',
                        borderRadius: 8,
                        color: 'white',
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="count" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        )}

        {/* Upcoming */}
        <Card className={isAdmin ? '' : 'lg:col-span-3'}>
          <CardHeader
            title="Upcoming"
            description="Next 5 appointments"
            action={
              <Link
                to="/appointments"
                className="text-xs font-medium text-primary-600 dark:text-primary-400 inline-flex items-center gap-1 hover:underline"
              >
                See all <ArrowRight size={12} />
              </Link>
            }
          />
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : upcoming.length === 0 ? (
            <p className="text-sm text-ink-muted py-6 text-center">No upcoming appointments</p>
          ) : (
            <ul className="space-y-2">
              {upcoming.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-ink-200 dark:border-ink-800 px-3 py-2.5"
                >
                  <div>
                    <div className="text-sm font-medium">
                      {a.appointmentDate} <span className="text-ink-muted">at</span> {a.appointmentTime}
                    </div>
                    <div className="text-xs text-ink-muted">
                      Patient #{a.patientId} • Doctor #{a.doctorId}
                    </div>
                  </div>
                  <span className="text-xs font-mono text-ink-muted">#{a.id}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
