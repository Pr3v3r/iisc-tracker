import { useState, useEffect } from 'react';
import type { College, CollegeFormData } from '../types/college';
import api from '../api/axios';

const EMPLOYEE_NAMES = [
  'Aaron',
  'Sakshita',
  'Nevin',
  'Varsha',
  'Arnav',
  'Pravar'
];

interface CollegeFormProps {
  college?: College | null;
  onSave: (data: CollegeFormData) => Promise<void>;
  onClose: (deleted?: boolean) => void;
}

const EMPTY_FORM: CollegeFormData = {
  collegeName: '',
  assignedEmployee: '',
  status: 'Upcoming',
  visitDate: '',
  notes: '',
  followUpDate: '',
  followUpNotes: '',
  contactPerson: '',
};

const CollegeForm = ({ college, onSave, onClose }: CollegeFormProps) => {
  const [form, setForm] = useState<CollegeFormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [postponeReason, setPostponeReason] = useState('');
  const [showPostponeModal, setShowPostponeModal] = useState(false);
  const [pendingPostponeField, setPendingPostponeField] = useState('');

  useEffect(() => {
    if (college) {
      setForm({
        collegeName: college.collegeName,
        assignedEmployee: college.assignedEmployee || '',
        status: college.status,
        visitDate: college.visitDate
          ? new Date(college.visitDate).toISOString().split('T')[0]
          : '',
        notes: college.notes || '',
        followUpDate: college.followUpDate
          ? new Date(college.followUpDate).toISOString().split('T')[0]
          : '',
        followUpNotes: college.followUpNotes || '',
        contactPerson: college.contactPerson || '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [college]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (reason?: string) => {
    if (!form.collegeName.trim()) {
      setError('College name is required');
      return;
    }
  
    if (form.status === 'Visited' && form.visitDate) {
      const visitDate = new Date(form.visitDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (visitDate > today) {
        setError('Visit date cannot be in the future for a Visited college');
        return;
      }
    }
  
    setLoading(true);
    setError('');
  
    try {
      // If a reason is provided, attach it to the payload
      const payload = reason ? { ...form, reason } : form;
      await onSave(payload as CollegeFormData);
      onClose();
    } catch (err: any) {
      if (err.response?.data?.requiresReason) {
        setShowPostponeModal(true);
        setPendingPostponeField(err.response.data.field);
      } else {
        setError(err.response?.data?.error || 'Something went wrong. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!college) return;
    if (!deleteReason.trim()) return;
    setLoading(true);
    try {
      await api.delete(`/colleges/${college._id}`, {
        data: { reason: deleteReason.trim() },
      });
      onClose(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const isEditing = !!college;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-cream w-full rounded-t-3xl max-h-[90vh] overflow-y-auto">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-warmgray rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-warmgray">
          <h2 className="text-lg font-bold text-ink">
            {isEditing ? 'Edit College' : 'Add College'}
          </h2>
          <button
            onClick={() => onClose()}
            className="text-sage hover:text-ink text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Form fields */}
        <div className="px-5 py-4 space-y-4 pb-28">

          {/* College Name */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              College Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="collegeName"
              value={form.collegeName}
              onChange={handleChange}
              placeholder="e.g. IIT Bombay"
              className="w-full px-4 py-3 rounded-xl border border-warmgray focus:outline-none focus:ring-2 focus:ring-forest bg-white text-ink text-base"
            />
          </div>

          {/* Assigned Employee */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Assigned Employee
            </label>
            <select
              name="assignedEmployee"
              value={form.assignedEmployee}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-warmgray focus:outline-none focus:ring-2 focus:ring-forest bg-white text-ink text-base"
            >
              <option value="">Select employee (optional)</option>
              {EMPLOYEE_NAMES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Contact Person */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Contact Person
            </label>
            <input
              type="text"
              name="contactPerson"
              value={form.contactPerson}
              onChange={handleChange}
              placeholder="e.g. Dr. Sharma (optional)"
              className="w-full px-4 py-3 rounded-xl border border-warmgray focus:outline-none focus:ring-2 focus:ring-forest bg-white text-ink text-base"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-warmgray focus:outline-none focus:ring-2 focus:ring-forest bg-white text-ink text-base"
            >
              <option value="Upcoming">Upcoming</option>
              <option value="Visited">Visited</option>
            </select>
          </div>

          {/* Visit Date */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Visit Date
            </label>
            <input
              type="date"
              name="visitDate"
              value={form.visitDate}
              onChange={handleChange}
              max={form.status === 'Visited'
                ? new Date().toISOString().split('T')[0]
                : undefined
              }
              className="w-full px-4 py-3 rounded-xl border border-warmgray focus:outline-none focus:ring-2 focus:ring-forest bg-white text-ink text-base"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Any notes about this college..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-warmgray focus:outline-none focus:ring-2 focus:ring-forest bg-white text-ink text-base resize-none"
            />
          </div>

          {/* Follow-Up Date */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Follow-Up Date
            </label>
            <input
              type="date"
              name="followUpDate"
              value={form.followUpDate}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-warmgray focus:outline-none focus:ring-2 focus:ring-forest bg-white text-ink text-base"
            />
          </div>

          {/* Follow-Up Notes */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Follow-Up Notes
            </label>
            <textarea
              name="followUpNotes"
              value={form.followUpNotes}
              onChange={handleChange}
              placeholder="Notes for the follow-up..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-warmgray focus:outline-none focus:ring-2 focus:ring-forest bg-white text-ink text-base resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={() => handleSubmit()} 
            disabled={loading}
            className="w-full bg-forest hover:bg-forest-dark disabled:bg-forest/40 text-white font-semibold py-3 rounded-xl transition-colors text-base"
          >
            {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add College'}
          </button>

          {/* Delete */}
          {isEditing && (
            <div className="pt-4 mt-2 border-t border-warmgray">
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full text-red-500 font-medium py-3 rounded-xl border border-red-200 hover:bg-red-50 transition-colors text-base bg-white"
                >
                  Delete College
                </button>
              ) : (
                <div className="bg-red-50 rounded-xl p-4 space-y-3">
                  <p className="text-red-700 text-sm font-medium text-center">
                    Are you sure? This cannot be undone.
                  </p>
                  <textarea
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="Reason for deletion (required)..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl border border-red-200 bg-white text-ink text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setConfirmDelete(false);
                        setDeleteReason('');
                      }}
                      className="flex-1 py-2 rounded-xl border border-warmgray text-sage font-medium text-sm bg-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={loading || !deleteReason.trim()}
                      className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium text-sm transition-colors"
                    >
                      {loading ? 'Deleting...' : 'Yes, Delete'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
      
      {/* Postpone Modal */}
      {showPostponeModal && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm space-y-4">
            <h3 className="font-bold text-ink text-base">Reason Required</h3>
            <p className="text-sm text-sage">
              The {pendingPostponeField === 'followUpDate' ? 'follow-up' : 'visit'} date
              was overdue. Please provide a reason for rescheduling.
            </p>
            <textarea
              value={postponeReason}
              onChange={(e) => setPostponeReason(e.target.value)}
              placeholder="e.g. College requested to reschedule..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-warmgray text-ink text-sm resize-none focus:outline-none focus:ring-2 focus:ring-forest"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPostponeModal(false);
                  setPostponeReason('');
                }}
                className="flex-1 py-2 rounded-xl border border-warmgray text-sage text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!postponeReason.trim()) return;
                  setShowPostponeModal(false);
                  handleSubmit(postponeReason.trim());
                }}
                disabled={!postponeReason.trim()}
                className="flex-1 py-2 rounded-xl bg-forest text-white text-sm disabled:bg-forest/40"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollegeForm;