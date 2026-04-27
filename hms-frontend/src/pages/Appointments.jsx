import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Plus,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  ClipboardCheck,
  CalendarClock,
  CalendarDays,
  ListIcon,
  Trash2,
} from 'lucide-react';
import api from '../api/client.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { extractError } from '../lib/jwt.js';
import { cn } from '../lib/cn.js';
import Card, { CardHeader } from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Select from '../components/Select.jsx';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Skeleton from '../components/Skeleton.jsx';
import Modal from '../components/Modal.jsx';
import { AppointmentStatus } from '../components/StatusBadge.jsx';

const STATUS_FILTERS = ['ALL', 'SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'];

export default function Appointments() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isPatient = user?.role === 'patient';
  const isDoctor = user?.role === 'doctor';

  const [list, setList] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [bookOpen, setBookOpen] = useState(false);
  const [reschedule, setReschedule] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [bookForm, setBookForm] = useState({
    doctorId: '',
    patientId: '',
    appointmentDate: '',
    appointmentTime: '',
  });
  const [reschedForm, setReschedForm] = useState({ appointmentDate: '', appointmentTime: '' });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/appointments');
      setList(data);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    api.get('/doctors')
      .then((r) => setDoctors(r.data))
      .catch((err) => toast.error(`Couldn't load doctors: ${extractError(err)}`));
    if (isAdmin) {
      api.get('/patients')
        .then((r) => setPatients(r.data))
        .catch((err) => toast.error(`Couldn't load patients: ${extractError(err)}`));
    }
  }, [isAdmin]);

  const doctorMap = useMemo(() => {
    const m = {};
    doctors.forEach((d) => { m[d.id] = `Dr. ${d.firstName} ${d.lastName}`; });
    return m;
  }, [doctors]);

  const patientMap = useMemo(() => {
    const m = {};
    patients.forEach((p) => { m[p.id] = `${p.firstName} ${p.lastName}`; });
    return m;
  }, [patients]);

  const filtered = useMemo(() => {
    if (statusFilter === 'ALL') return list;
    return list.filter((a) => a.status === statusFilter);
  }, [list, statusFilter]);

  const setStatus = async (id, action, label) => {
    try {
      await api.patch(`/appointments/${id}/${action}`);
      toast.success(`Appointment ${label}`);
      load();
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  const onBook = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        doctorId: Number(bookForm.doctorId),
        appointmentDate: bookForm.appointmentDate,
        appointmentTime: bookForm.appointmentTime,
      };
      if (isAdmin) payload.patientId = Number(bookForm.patientId);
      await api.post('/appointments', payload);
      toast.success('Appointment booked');
      setBookOpen(false);
      setBookForm({ doctorId: '', patientId: '', appointmentDate: '', appointmentTime: '' });
      load();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const onReschedule = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.patch(`/appointments/${reschedule.id}/reschedule`, reschedForm);
      toast.success('Rescheduled');
      setReschedule(null);
      load();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async () => {
    setSubmitting(true);
    try {
      await api.delete(`/appointments/${confirmDelete.id}`);
      toast.success('Appointment deleted');
      setConfirmDelete(null);
      load();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const canBook = isAdmin || isPatient;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title={isPatient ? 'My appointments' : isDoctor ? 'My appointments' : 'All appointments'}
          description={`${filtered.length} record${filtered.length === 1 ? '' : 's'}`}
          action={
            canBook && (
              <Button onClick={() => setBookOpen(true)}>
                <Plus size={16} />
                Book appointment
              </Button>
            )
          }
        />

        {/* Filter chips */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'h-8 px-3 rounded-full text-xs font-medium transition-colors',
                statusFilter === s
                  ? 'bg-aurora text-white shadow-glow'
                  : 'bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-700',
              )}
            >
              {s}
            </button>
          ))}
          <Button variant="ghost" size="icon" onClick={load} title="Refresh" className="ml-auto">
            {loading ? <Spinner /> : <RefreshCcw size={16} />}
          </Button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-ink-200 dark:border-ink-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ink-50 dark:bg-ink-950 text-xs uppercase tracking-wider text-ink-muted">
                <th className="text-left px-4 py-3 font-semibold">ID</th>
                <th className="text-left px-4 py-3 font-semibold">Patient</th>
                <th className="text-left px-4 py-3 font-semibold">Doctor</th>
                <th className="text-left px-4 py-3 font-semibold">When</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-right px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="border-t border-ink-200 dark:border-ink-800">
                    <td colSpan={6} className="px-4 py-3"><Skeleton className="h-6 w-full" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={CalendarClock}
                      title="No appointments"
                      description={canBook ? 'Book your first appointment.' : 'Nothing here yet.'}
                      action={canBook && <Button onClick={() => setBookOpen(true)}><Plus size={16} />Book</Button>}
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr
                    key={a.id}
                    className="border-t border-ink-200 dark:border-ink-800 hover:bg-primary-soft/40 dark:hover:bg-primary-softDark/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-ink-muted">#{a.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {patientMap[a.patientId] || `Patient #${a.patientId}`}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {doctorMap[a.doctorId] || `Doctor #${a.doctorId}`}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{a.appointmentDate}</div>
                      <div className="text-xs text-ink-muted">{a.appointmentTime}</div>
                    </td>
                    <td className="px-4 py-3"><AppointmentStatus status={a.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1 flex-wrap justify-end">
                        {(isDoctor || isAdmin) && a.status === 'SCHEDULED' && (
                          <Button variant="ghost" size="sm" onClick={() => setStatus(a.id, 'confirm', 'confirmed')}>
                            <CheckCircle2 size={14} /> Confirm
                          </Button>
                        )}
                        {(isDoctor || isAdmin) && a.status === 'CONFIRMED' && (
                          <Button variant="ghost" size="sm" onClick={() => setStatus(a.id, 'complete', 'completed')}>
                            <ClipboardCheck size={14} /> Complete
                          </Button>
                        )}
                        {(a.status === 'SCHEDULED' || a.status === 'CONFIRMED') && (isPatient || isDoctor || isAdmin) && (
                          <Button variant="ghost" size="sm" onClick={() => setStatus(a.id, 'cancel', 'cancelled')}>
                            <XCircle size={14} /> Cancel
                          </Button>
                        )}
                        {(isPatient || isAdmin) && (a.status === 'SCHEDULED' || a.status === 'CONFIRMED') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setReschedForm({ appointmentDate: '', appointmentTime: '' });
                              setReschedule(a);
                            }}
                          >
                            <CalendarDays size={14} /> Reschedule
                          </Button>
                        )}
                        {isAdmin && (a.status === 'CANCELLED' || a.status === 'COMPLETED') && (
                          <Button variant="ghost" size="icon" onClick={() => setConfirmDelete(a)} title="Delete">
                            <Trash2 size={14} className="text-red-600" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Book modal */}
      <Modal
        open={bookOpen}
        onOpenChange={setBookOpen}
        title="Book appointment"
        description={isPatient ? 'Pick a doctor and a slot.' : 'Pick a patient, doctor, and slot.'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setBookOpen(false)}>Cancel</Button>
            <Button onClick={onBook} disabled={submitting}>
              {submitting ? <Spinner /> : 'Book'}
            </Button>
          </>
        }
      >
        <form onSubmit={onBook} className="grid grid-cols-2 gap-4">
          <Select
            label="Doctor"
            name="doctorId"
            value={bookForm.doctorId}
            onChange={(e) => setBookForm({ ...bookForm, doctorId: e.target.value })}
            required
            className="col-span-2"
          >
            <option value="">— Select doctor —</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                Dr. {d.firstName} {d.lastName} — {d.department?.name} ({d.specialization})
              </option>
            ))}
          </Select>
          {isAdmin && (
            <Select
              label="Patient"
              name="patientId"
              value={bookForm.patientId}
              onChange={(e) => setBookForm({ ...bookForm, patientId: e.target.value })}
              required
              className="col-span-2"
            >
              <option value="">— Select patient —</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName} (#{p.id})
                </option>
              ))}
            </Select>
          )}
          <Input
            label="Date"
            type="date"
            value={bookForm.appointmentDate}
            onChange={(e) => setBookForm({ ...bookForm, appointmentDate: e.target.value })}
            required
          />
          <Input
            label="Time"
            type="time"
            value={bookForm.appointmentTime}
            onChange={(e) => setBookForm({ ...bookForm, appointmentTime: e.target.value })}
            required
          />
        </form>
      </Modal>

      {/* Reschedule modal */}
      <Modal
        open={!!reschedule}
        onOpenChange={(o) => !o && setReschedule(null)}
        title="Reschedule"
        description={reschedule && `Appointment #${reschedule.id} — pick a new slot`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setReschedule(null)}>Cancel</Button>
            <Button onClick={onReschedule} disabled={submitting}>
              {submitting ? <Spinner /> : 'Reschedule'}
            </Button>
          </>
        }
      >
        <form onSubmit={onReschedule} className="grid grid-cols-2 gap-4">
          <Input
            label="New date"
            type="date"
            value={reschedForm.appointmentDate}
            onChange={(e) => setReschedForm({ ...reschedForm, appointmentDate: e.target.value })}
            required
          />
          <Input
            label="New time"
            type="time"
            value={reschedForm.appointmentTime}
            onChange={(e) => setReschedForm({ ...reschedForm, appointmentTime: e.target.value })}
            required
          />
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
        title="Delete appointment"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="danger" onClick={onDelete} disabled={submitting}>
              {submitting ? <Spinner /> : 'Delete'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-muted">This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
