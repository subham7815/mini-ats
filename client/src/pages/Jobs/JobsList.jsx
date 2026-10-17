import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus, Briefcase, MapPin, Users as UsersIcon, Calendar,
  Eye, Edit, Trash2, ToggleLeft, ToggleRight
} from 'lucide-react';
import { jobApi } from '../../services/api';
import { StatusBadge, EmploymentTypeBadge } from '../../components/Badges';
import { PageLoader } from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import JobForm from './JobForm';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useToast } from '../../components/Toast';

export default function JobsList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editJob, setEditJob] = useState(null);
  const [deleteJob, setDeleteJob] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setShowForm(true);
      setSearchParams({});
    }
  }, [searchParams]);

  async function fetchJobs() {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await jobApi.getAll(params);
      setJobs(res.data);
    } catch (err) {
      toast.error('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(job) {
    const newStatus = job.status === 'Open' ? 'Closed' : 'Open';
    try {
      await jobApi.updateStatus(job._id, newStatus);
      toast.success(`${job.title} ${newStatus === 'Open' ? 'reopened' : 'closed'}`);
      fetchJobs();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  }

  async function handleDelete() {
    if (!deleteJob) return;
    setDeleting(true);
    try {
      await jobApi.delete(deleteJob._id);
      toast.success(`${deleteJob.title} deleted`);
      setDeleteJob(null);
      fetchJobs();
    } catch (err) {
      toast.error(err.message || 'Failed to delete job');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="">All Status</option>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
          </select>
          <p className="text-sm text-slate-500">{jobs.length} job{jobs.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setEditJob(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Post New Job
        </button>
      </div>

      {/* Jobs Grid */}
      {loading ? <PageLoader /> : jobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200">
          <EmptyState
            icon={Briefcase}
            title="No jobs found"
            description="Create your first job posting to start recruiting"
            action={
              <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700">
                <Plus className="w-4 h-4" /> Post New Job
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {jobs.map(job => (
            <div key={job._id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => navigate(`/jobs/${job._id}`)}
                    className="text-base font-semibold text-slate-800 hover:text-primary-600 transition-colors truncate block"
                  >
                    {job.title}
                  </button>
                  <p className="text-sm text-slate-500 mt-0.5">{job.department}</p>
                </div>
                <StatusBadge status={job.status} />
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <UsersIcon className="w-3.5 h-3.5" />
                  <span>{job.applicantCount || 0} applicant{(job.applicantCount || 0) !== 1 ? 's' : ''} · {job.openings} opening{job.openings !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>

              <div className="mb-4">
                <EmploymentTypeBadge type={job.employmentType} />
              </div>

              <div className="flex items-center gap-1 pt-3 border-t border-slate-100">
                <button onClick={() => navigate(`/jobs/${job._id}`)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="View">
                  <Eye className="w-4 h-4" />
                </button>
                <button onClick={() => { setEditJob(job); setShowForm(true); }} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleToggleStatus(job)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title={job.status === 'Open' ? 'Close job' : 'Reopen job'}>
                  {job.status === 'Open' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </button>
                <button onClick={() => setDeleteJob(job)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <JobForm
          isOpen={showForm}
          onClose={() => { setShowForm(false); setEditJob(null); }}
          onSuccess={() => { setShowForm(false); setEditJob(null); fetchJobs(); }}
          job={editJob}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteJob}
        onClose={() => setDeleteJob(null)}
        onConfirm={handleDelete}
        title="Delete Job"
        message={deleteJob ? `Are you sure you want to delete "${deleteJob.title}"? This cannot be undone. Jobs with candidates cannot be deleted.` : ''}
        loading={deleting}
      />
    </div>
  );
}
