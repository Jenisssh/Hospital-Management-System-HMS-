import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Search, RefreshCcw, Pencil, Trash2, Users } from 'lucide-react';
import api from '../api/client.js';
import { extractError } from '../lib/jwt.js';
import Card, { CardHeader } from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Select from '../components/Select.jsx';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Skeleton from '../components/Skeleton.jsx';
import Modal from '../components/Modal.jsx';
import Drawer from '../components/Drawer.jsx';
import Avatar from '../components/Avatar.jsx';
import Badge from '../components/Badge.jsx';

const GENDERS = ['MALE', 'FEMALE', 'OTHER'];
const empty = {
  firstName: '',
  lastName: '',
  gender: 'MALE',
  dateOfBirth: '',
  phoneNumber: '',
};

export default function Patients() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState(null); // patient object or null
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/patients');
      setList(data);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((p) =>
      `${p.firstName} ${p.lastName} ${p.phoneNumber} ${p.gender}`.toLowerCase().includes(q),
    );
  }, [list, search]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openCreate = () => {
    setForm(empty);
    setCreateOpen(true);
  };

  const openEdit = (p) => {
    setForm({
      firstName: p.firstName || '',
      lastName: p.lastName || '',
      gender: p.gender || 'MALE',
      dateOfBirth: p.dateOfBirth || '',
      phoneNumber: p.phoneNumber || '',
    });
    setEditing(p);
  };

  const onCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/patients', form);
      toast.success('Patient created');
      setCreateOpen(false);
      load();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const onUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.patch(`/patients/${editing.id}`, form);
      toast.success('Patient updated');
      setEditing(null);
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
      await api.delete(`/patients/${confirmDelete.id}`);
      toast.success('Patient deleted');
      setConfirmDelete(null);
      load();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const formFields = (
    <div className="grid grid-cols-2 gap-4">
      <Input label="First name" name="firstName" value={form.firstName} onChange={onChange} required />
      <Input label="Last name" name="lastName" value={form.lastName} onChange={onChange} required />
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
      />
      <Input
        label="Phone (10-digit, starts 6-9)"
        name="phoneNumber"
        value={form.phoneNumber}
        onChange={onChange}
        required
        pattern="^[6-9]\d{9}$"
        placeholder="9876543210"
        className="col-span-2"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title={`Patients (${filtered.length})`}
          description="Manage patient records"
          action={
            <Button onClick={openCreate} variant="primary">
              <Plus size={16} />
              Add patient
            </Button>
          }
        />

        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by name, phone, gender…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 pl-9 pr-3 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <Button variant="ghost" size="icon" onClick={load} title="Refresh">
            {loading ? <Spinner /> : <RefreshCcw size={16} />}
          </Button>
        </div>

        <div className="mt-4 overflow-x-auto rounded-lg border border-ink-200 dark:border-ink-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ink-50 dark:bg-ink-950 text-xs uppercase tracking-wider text-ink-muted">
                <th className="text-left px-4 py-3 font-semibold">Patient</th>
                <th className="text-left px-4 py-3 font-semibold">Gender</th>
                <th className="text-left px-4 py-3 font-semibold">DOB</th>
                <th className="text-left px-4 py-3 font-semibold">Phone</th>
                <th className="text-left px-4 py-3 font-semibold">Linked</th>
                <th className="text-right px-4 py-3 font-semibold"></th>
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
                      icon={Users}
                      title="No patients found"
                      description={search ? 'Try a different search term.' : 'Add your first patient to get started.'}
                      action={!search && <Button onClick={openCreate}><Plus size={16} />Add patient</Button>}
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-ink-200 dark:border-ink-800 hover:bg-primary-soft/40 dark:hover:bg-primary-softDark/40 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={`${p.firstName} ${p.lastName}`} size={36} />
                        <div>
                          <div className="font-medium">{p.firstName} {p.lastName}</div>
                          <div className="text-xs font-mono text-ink-muted">#{p.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant="default">{p.gender}</Badge></td>
                    <td className="px-4 py-3">{p.dateOfBirth}</td>
                    <td className="px-4 py-3 font-mono text-xs">{p.phoneNumber}</td>
                    <td className="px-4 py-3">
                      {p.userId
                        ? <Badge variant="success">user #{p.userId}</Badge>
                        : <span className="text-ink-muted text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)} title="Edit">
                          <Pencil size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setConfirmDelete(p)} title="Delete">
                          <Trash2 size={14} className="text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create modal */}
      <Modal
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New patient"
        description="Create a patient record"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={onCreate} disabled={submitting}>
              {submitting ? <Spinner /> : 'Create'}
            </Button>
          </>
        }
      >
        <form onSubmit={onCreate}>{formFields}</form>
      </Modal>

      {/* Edit drawer */}
      <Drawer
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing ? `Edit patient #${editing.id}` : ''}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={onUpdate} disabled={submitting}>
              {submitting ? <Spinner /> : 'Save changes'}
            </Button>
          </>
        }
      >
        <form onSubmit={onUpdate}>{formFields}</form>
      </Drawer>

      {/* Delete confirm */}
      <Modal
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
        title="Delete patient"
        description={confirmDelete && `${confirmDelete.firstName} ${confirmDelete.lastName} will be permanently deleted.`}
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
