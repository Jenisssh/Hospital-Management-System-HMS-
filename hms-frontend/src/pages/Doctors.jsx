import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Search, RefreshCcw, Pencil, Trash2, Stethoscope } from 'lucide-react';
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

const DEPARTMENTS = [
  'CARDIOLOGY', 'NEUROLOGY', 'ORTHOPEDICS', 'PEDIATRICS', 'DERMATOLOGY',
  'GENERAL_MEDICINE', 'GYNECOLOGY', 'ONCOLOGY', 'RADIOLOGY', 'EMERGENCY',
];

const empty = {
  firstName: '',
  lastName: '',
  specialization: '',
  phoneNumber: '',
  department: 'GENERAL_MEDICINE',
};

export default function Doctors() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/doctors');
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
    return list.filter((d) => {
      const text = `${d.firstName} ${d.lastName} ${d.specialization} ${d.phoneNumber}`.toLowerCase();
      const matchSearch = !q || text.includes(q);
      const matchDept = deptFilter === 'ALL' || d.department?.name === deptFilter;
      return matchSearch && matchDept;
    });
  }, [list, search, deptFilter]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openCreate = () => {
    setForm(empty);
    setCreateOpen(true);
  };

  const openEdit = (d) => {
    setForm({
      firstName: d.firstName,
      lastName: d.lastName,
      specialization: d.specialization,
      phoneNumber: d.phoneNumber,
      department: d.department?.name || 'GENERAL_MEDICINE',
    });
    setEditing(d);
  };

  const onCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/doctors', form);
      toast.success('Doctor created');
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
      await api.put(`/doctors/${editing.id}`, form);
      toast.success('Doctor updated');
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
      await api.delete(`/doctors/${confirmDelete.id}`);
      toast.success('Doctor deleted');
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
      <Input
        label="Specialization"
        name="specialization"
        value={form.specialization}
        onChange={onChange}
        required
        className="col-span-2"
      />
      <Input
        label="Phone (10-digit, starts 6-9)"
        name="phoneNumber"
        value={form.phoneNumber}
        onChange={onChange}
        required
        pattern="^[6-9]\d{9}$"
        placeholder="9876543210"
      />
      <Select label="Department" name="department" value={form.department} onChange={onChange}>
        {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
      </Select>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title={`Doctors (${filtered.length})`}
          description="Manage doctors and their departments"
          action={
            <Button onClick={openCreate} variant="primary">
              <Plus size={16} />
              Add doctor
            </Button>
          }
        />

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              placeholder="Search by name, specialization…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 pl-9 pr-3 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="h-10 rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 px-3 text-sm focus:outline-none focus:border-primary-500"
          >
            <option value="ALL">All departments</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <Button variant="ghost" size="icon" onClick={load} title="Refresh">
            {loading ? <Spinner /> : <RefreshCcw size={16} />}
          </Button>
        </div>

        <div className="mt-4 overflow-x-auto rounded-lg border border-ink-200 dark:border-ink-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ink-50 dark:bg-ink-950 text-xs uppercase tracking-wider text-ink-muted">
                <th className="text-left px-4 py-3 font-semibold">Doctor</th>
                <th className="text-left px-4 py-3 font-semibold">Specialization</th>
                <th className="text-left px-4 py-3 font-semibold">Department</th>
                <th className="text-left px-4 py-3 font-semibold">Phone</th>
                <th className="text-left px-4 py-3 font-semibold">Linked</th>
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
                      icon={Stethoscope}
                      title="No doctors found"
                      description={search || deptFilter !== 'ALL' ? 'Try clearing filters.' : 'Add the first doctor.'}
                      action={!search && deptFilter === 'ALL' && <Button onClick={openCreate}><Plus size={16} />Add doctor</Button>}
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr
                    key={d.id}
                    className="border-t border-ink-200 dark:border-ink-800 hover:bg-primary-soft/40 dark:hover:bg-primary-softDark/40 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={`Dr ${d.firstName} ${d.lastName}`} size={36} />
                        <div>
                          <div className="font-medium">Dr. {d.firstName} {d.lastName}</div>
                          <div className="text-xs font-mono text-ink-muted">#{d.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{d.specialization}</td>
                    <td className="px-4 py-3"><Badge variant="primary">{d.department?.name}</Badge></td>
                    <td className="px-4 py-3 font-mono text-xs">{d.phoneNumber}</td>
                    <td className="px-4 py-3">
                      {d.userId
                        ? <Badge variant="success">user #{d.userId}</Badge>
                        : <span className="text-ink-muted text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(d)} title="Edit">
                          <Pencil size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setConfirmDelete(d)} title="Delete">
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

      <Modal
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New doctor"
        description="Create a doctor record"
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

      <Drawer
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing ? `Edit doctor #${editing.id}` : ''}
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

      <Modal
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
        title="Delete doctor"
        description={confirmDelete && `Dr. ${confirmDelete.firstName} ${confirmDelete.lastName} will be permanently deleted.`}
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
