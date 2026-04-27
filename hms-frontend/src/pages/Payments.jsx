import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, RefreshCcw, RotateCcw, CreditCard } from 'lucide-react';
import api from '../api/client.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { extractError } from '../lib/jwt.js';
import Card, { CardHeader } from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Select from '../components/Select.jsx';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Skeleton from '../components/Skeleton.jsx';
import Modal from '../components/Modal.jsx';
import Badge from '../components/Badge.jsx';
import { PaymentStatus } from '../components/StatusBadge.jsx';

const METHODS = ['CARD', 'UPI', 'NET_BANKING', 'CASH'];

export default function Payments() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [list, setList] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payOpen, setPayOpen] = useState(false);
  const [confirmRefund, setConfirmRefund] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    appointmentId: '',
    amount: '',
    paymentMethod: 'CARD',
  });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/payments');
      setList(data);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // Patient: load own appointments for the dropdown
    if (!isAdmin) {
      api.get('/appointments').then((r) => setAppointments(r.data)).catch(() => {});
    }
  }, [isAdmin]);

  const totals = useMemo(() => {
    const paid = list.filter((p) => p.paymentStatus === 'PAID');
    const total = paid.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    return { total, count: paid.length };
  }, [list]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onPay = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/payments', {
        appointmentId: Number(form.appointmentId),
        amount: Number(form.amount),
        paymentMethod: form.paymentMethod,
      });
      toast.success(`Payment ${data.paymentStatus} (${data.transactionRef})`);
      setPayOpen(false);
      setForm({ appointmentId: '', amount: '', paymentMethod: 'CARD' });
      load();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const onRefund = async () => {
    setSubmitting(true);
    try {
      await api.post(`/payments/${confirmRefund.id}/refund`);
      toast.success('Payment refunded');
      setConfirmRefund(null);
      load();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero stat */}
      <Card className="bg-aurora dark:bg-aurora-dark text-white aurora-radial border-0 shadow-glow">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider opacity-80">Total paid</div>
            <div className="text-4xl font-bold tracking-tight mt-1">
              ₹{totals.total.toLocaleString()}
            </div>
            <div className="text-sm opacity-80 mt-1">{totals.count} successful payment{totals.count === 1 ? '' : 's'}</div>
          </div>
          <Button variant="secondary" onClick={() => setPayOpen(true)} className="bg-white/20 backdrop-blur border-white/30 text-white hover:bg-white/30">
            <Plus size={16} />
            Process payment
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader
          title={isAdmin ? 'All payments' : 'My payments'}
          description={`${list.length} record${list.length === 1 ? '' : 's'}`}
          action={
            <Button variant="ghost" size="icon" onClick={load} title="Refresh">
              {loading ? <Spinner /> : <RefreshCcw size={16} />}
            </Button>
          }
        />

        <div className="overflow-x-auto rounded-lg border border-ink-200 dark:border-ink-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ink-50 dark:bg-ink-950 text-xs uppercase tracking-wider text-ink-muted">
                <th className="text-left px-4 py-3 font-semibold">ID</th>
                <th className="text-left px-4 py-3 font-semibold">Appt</th>
                <th className="text-left px-4 py-3 font-semibold">Amount</th>
                <th className="text-left px-4 py-3 font-semibold">Method</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Tx ref</th>
                <th className="text-left px-4 py-3 font-semibold">Date</th>
                <th className="text-right px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="border-t border-ink-200 dark:border-ink-800">
                    <td colSpan={8} className="px-4 py-3"><Skeleton className="h-6 w-full" /></td>
                  </tr>
                ))
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      icon={CreditCard}
                      title="No payments yet"
                      description="Process your first payment using the button above."
                    />
                  </td>
                </tr>
              ) : (
                list.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-ink-200 dark:border-ink-800 hover:bg-primary-soft/40 dark:hover:bg-primary-softDark/40"
                  >
                    <td className="px-4 py-3 font-mono text-xs">#{p.id}</td>
                    <td className="px-4 py-3 font-mono text-xs">#{p.appointmentId}</td>
                    <td className="px-4 py-3 font-semibold">₹{Number(p.amount).toLocaleString()}</td>
                    <td className="px-4 py-3"><Badge variant="default">{p.paymentMethod}</Badge></td>
                    <td className="px-4 py-3"><PaymentStatus status={p.paymentStatus} /></td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-muted">{p.transactionRef}</td>
                    <td className="px-4 py-3 text-ink-muted text-xs">{p.createdAt?.split('T')[0]}</td>
                    <td className="px-4 py-3 text-right">
                      {isAdmin && p.paymentStatus === 'PAID' && (
                        <Button variant="ghost" size="sm" onClick={() => setConfirmRefund(p)}>
                          <RotateCcw size={14} /> Refund
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Process payment modal */}
      <Modal
        open={payOpen}
        onOpenChange={setPayOpen}
        title="Process payment"
        description="Charge an appointment"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPayOpen(false)}>Cancel</Button>
            <Button variant="gradient" onClick={onPay} disabled={submitting}>
              {submitting ? <Spinner /> : 'Pay'}
            </Button>
          </>
        }
      >
        <form onSubmit={onPay} className="grid grid-cols-2 gap-4">
          {!isAdmin && appointments.length > 0 ? (
            <Select
              label="Appointment"
              name="appointmentId"
              value={form.appointmentId}
              onChange={onChange}
              required
              className="col-span-2"
            >
              <option value="">— Select your appointment —</option>
              {appointments.map((a) => (
                <option key={a.id} value={a.id}>
                  #{a.id} — {a.appointmentDate} {a.appointmentTime} ({a.status})
                </option>
              ))}
            </Select>
          ) : (
            <Input
              label="Appointment ID"
              name="appointmentId"
              type="number"
              value={form.appointmentId}
              onChange={onChange}
              required
              className="col-span-2"
            />
          )}
          <Input
            label="Amount (₹)"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={form.amount}
            onChange={onChange}
            required
          />
          <Select label="Method" name="paymentMethod" value={form.paymentMethod} onChange={onChange}>
            {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </Select>
        </form>
      </Modal>

      {/* Refund confirm */}
      <Modal
        open={!!confirmRefund}
        onOpenChange={(o) => !o && setConfirmRefund(null)}
        title="Refund payment"
        description={confirmRefund && `Refund ₹${confirmRefund.amount} for payment #${confirmRefund.id}?`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmRefund(null)}>Cancel</Button>
            <Button variant="danger" onClick={onRefund} disabled={submitting}>
              {submitting ? <Spinner /> : 'Refund'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-muted">This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
