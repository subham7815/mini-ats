import { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { jobApi } from '../../services/api';
import { useToast } from '../../components/Toast';

export default function JobForm({ isOpen, onClose, onSuccess, job }) {
  const toast = useToast();
  const isEdit = !!job;

  const [form, setForm] = useState({
    title: '',
    department: '',
    description: '',
    requiredSkills: '',
    location: '',
    employmentType: 'Full-time',
    openings: 1,
    status: 'Open'
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (job) {
      setForm({
        title: job.title || '',
        department: job.department || '',
        description: job.description || '',
        requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : '',
        location: job.location || '',
        employmentType: job.employmentType || 'Full-time',
        openings: job.openings || 1,
        status: job.status || 'Open'
      });
    }
  }, [job]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Job title is required';
    if (!form.department.trim()) errs.department = 'Department is required';
    if (!form.location.trim()) errs.location = 'Location is required';
    if (form.openings < 1) errs.openings = 'At least 1 opening required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    try {
      const data = {
        ...form,
        openings: Number(form.openings),
        requiredSkills: form.requiredSkills.split(',').map(s => s.trim()).filter(Boolean)
      };

      if (isEdit) {
        await jobApi.update(job._id, data);
        toast.success(`${form.title} updated`);
      } else {
        await jobApi.create(data);
        toast.success(`${form.title} created`);
      }
      onSuccess();
    } catch (err) {
      toast.error(err.message || 'Failed to save job');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Job' : 'Post New Job'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Job Title *</label>
            <input name="title" value={form.title} onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${errors.title ? 'border-red-300' : 'border-slate-200'}`}
              placeholder="Senior Frontend Engineer" />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Department *</label>
            <input name="department" value={form.department} onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${errors.department ? 'border-red-300' : 'border-slate-200'}`}
              placeholder="Engineering" />
            {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Location *</label>
            <input name="location" value={form.location} onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${errors.location ? 'border-red-300' : 'border-slate-200'}`}
              placeholder="San Francisco, CA" />
            {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Employment Type</label>
            <select name="employmentType" value={form.employmentType} onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20">
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Number of Openings</label>
            <input name="openings" type="number" min="1" value={form.openings} onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${errors.openings ? 'border-red-300' : 'border-slate-200'}`} />
            {errors.openings && <p className="text-xs text-red-500 mt-1">{errors.openings}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select name="status" value={form.status} onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20">
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Required Skills (comma-separated)</label>
          <input name="requiredSkills" value={form.requiredSkills} onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            placeholder="React, TypeScript, CSS" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Job Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={4}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
            placeholder="Describe the role, responsibilities, and requirements..." />
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
            Cancel
          </button>
          <button type="submit" disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">
            {submitting ? 'Saving...' : isEdit ? 'Update Job' : 'Create Job'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
