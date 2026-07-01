import { useState, useEffect } from 'react';
import type { College, CollegeFormData } from '../types/college';
import api from '../api/axios';

const EMPLOYEE_NAMES = [
  'Pravar',
  'Riya',
  'Amit',
  'Neha',
];
  
interface CollegeFormProps {
  college?: College | null;
  onSave: (data: CollegeFormData) => Promise<void>;
  onClose: () => void;
}

const EMPTY_FORM: CollegeFormData = {
  collegeName: '',
  assignedEmployee: '',
  status: 'Upcoming',
  visitDate: '',
  notes: '',
  followUpDate: '',
  followUpNotes: '',
};

const CollegeForm = ({ college, onSave, onClose }: CollegeFormProps) => {
  const [form, setForm] = useState<CollegeFormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Populate form if editing existing college
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

  const handleSubmit = async () => {
    if (!form.collegeName.trim()) {
      setError('College name is required');
      return;
    }

    // If status is Visited, visit date cannot be in the future
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
      await onSave(form);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const isEditing = !!college;

  const handleDelete = async () => {
    if (!college) return;
    setLoading(true);
    try {
      await api.delete(`/colleges/${college._id}`);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Overlay
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Bottom sheet */}
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
            onClick={onClose}
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

          {/* Submit Button (Properly Separated) */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-forest hover:bg-forest-dark disabled:bg-forest/40 text-white font-semibold py-3 rounded-xl transition-colors text-base mt-2"
          >
            {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add College'}
          </button>

          {/* Delete Section (Separated below the Submit Button) */}
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
                  <div className="flex gap-3">
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 py-2 rounded-xl border border-red-200 text-red-600 bg-white font-medium text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={loading}
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
    </div>
  );
};

export default CollegeForm;