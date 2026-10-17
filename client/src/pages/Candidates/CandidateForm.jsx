import { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { candidateApi } from '../../services/api';
import { useToast } from '../../components/Toast';

export default function CandidateForm({ isOpen, onClose, onSuccess, candidate, jobs }) {
  const toast = useToast();
  const isEdit = !!candidate;

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    jobId: '',
    resumeUrl: '',
    source: 'LinkedIn',
    experience: 0,
    skills: '',
    notes: '',
    stage: 'Applied'
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (candidate) {
      setForm({
        name: candidate.name || '',
        email: candidate.email || '',
        phone: candidate.phone || '',
        jobId: candidate.jobId?._id || candidate.jobId || '',
        resumeUrl: candidate.resumeUrl || '',
        source: candidate.source || 'LinkedIn',
        experience: candidate.experience || 0,
        skills: Array.isArray(candidate.skills) ? candidate.skills.join(', ') : candidate.skills || '',
        notes: candidate.notes || '',
        stage: candidate.stage || 'Applied'
      });
    }
  }, [candidate]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'Invalid email format';
    if (!form.jobId) newErrors.jobId = 'Please select a job';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const data = {
        ...form,
        experience: Number(form.experience),
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean)
      };

      if (isEdit) {
        await candidateApi.update(candidate._id, data);
        toast.success(`${form.name} updated successfully`);
      } else {
        await candidateApi.create(data);
        toast.success(`${form.name} added successfully`);
      }
      onSuccess();
    } catch (err) {
      toast.error(err.message || 'Failed to save candidate');
    } finally {
      setSubmitting(false);
    }
  }

  const stages = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];
  const sourceOptions = ['LinkedIn', 'Referral', 'Job Board', 'Company Website', 'Indeed', 'Glassdoor', 'Other'];
  const openJobs = jobs.filter(j => j.status === 'Open' || (isEdit && j._id === form.jobId));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Candidate' : 'Add New Candidate'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
            <input name="name" value={form.name} onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${errors.name ? 'border-red-300' : 'border-slate-200'}`}
              placeholder="John Doe" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${errors.email ? 'border-red-300' : 'border-slate-200'}`}
              placeholder="john@example.com" />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <input name="phone" value={form.phone} onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              placeholder="(555) 123-4567" />
          </div>

          {/* Job */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Applied Job *</label>
            <select name="jobId" value={form.jobId} onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${errors.jobId ? 'border-red-300' : 'border-slate-200'}`}>
              <option value="">Select a job</option>
              {openJobs.map(j => (
                <option key={j._id} value={j._id}>{j.title} — {j.department}</option>
              ))}
            </select>
            {errors.jobId && <p className="text-xs text-red-500 mt-1">{errors.jobId}</p>}
          </div>

          {/* Source */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Source</label>
            <select name="source" value={form.source} onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20">
              {sourceOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Experience (years)</label>
            <input name="experience" type="number" min="0" max="50" value={form.experience} onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
          </div>

          {/* Stage */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Initial Stage</label>
            <select name="stage" value={form.stage} onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20">
              {stages.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Resume URL */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Resume URL</label>
            <input name="resumeUrl" value={form.resumeUrl} onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              placeholder="https://..." />
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Skills (comma-separated)</label>
          <input name="skills" value={form.skills} onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            placeholder="React, Node.js, Python" />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
            placeholder="Additional notes about the candidate..." />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
            Cancel
          </button>
          <button type="submit" disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">
            {submitting ? 'Saving...' : isEdit ? 'Update Candidate' : 'Add Candidate'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
