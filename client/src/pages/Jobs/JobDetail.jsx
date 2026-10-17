import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Calendar, Users as UsersIcon, Briefcase,
  Edit, Trash2, ToggleLeft, ToggleRight
} from 'lucide-react';
import { jobApi } from '../../services/api';
import { StatusBadge, EmploymentTypeBadge, StageBadge } from '../../components/Badges';
import { PageLoader } from '../../components/LoadingSpinner';
import JobForm from './JobForm';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useToast } from '../../components/Toast';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchJob();
  }, [id]);

  async function fetchJob() {
    setLoading(true);
    try {
      const res = await jobApi.getById(id);
      setJob(res.data);
    } catch {
      toast.error('Job not found');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus() {
    const newStatus = job.status === 'Open' ? 'Closed' : 'Open';
    try {
      await jobApi.updateStatus(id, newStatus);
      toast.success(`Job ${newStatus === 'Open' ? 'reopened' : 'closed'}`);
      fetchJob();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await jobApi.delete(id);
      toast.success('Job deleted');
      navigate('/jobs');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <PageLoader />;
  if (!job) return null;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/jobs')} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Jobs
      </button>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-semibold text-slate-800">{job.title}</h2>
              <StatusBadge status={job.status} />
            </div>
            <p className="text-sm text-slate-500">{job.department}</p>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4" />{job.location}</span>
              <EmploymentTypeBadge type={job.employmentType} />
              <span className="inline-flex items-center gap-1.5"><UsersIcon className="w-4 h-4" />{job.applicantCount} applicant{job.applicantCount !== 1 ? 's' : ''}</span>
              <span className="inline-flex items-center gap-1.5"><Briefcase className="w-4 h-4" />{job.openings} opening{job.openings !== 1 ? 's' : ''}</span>
              <span className="inline-flex items-center gap-1.5"><Calendar className="w-4 h-4" />{new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleToggleStatus}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg transition-colors ${job.status === 'Open'
                ? 'text-amber-600 border-amber-200 hover:bg-amber-50'
                : 'text-green-600 border-green-200 hover:bg-green-50'
              }`}>
              {job.status === 'Open' ? <><ToggleRight className="w-4 h-4" /> Close</> : <><ToggleLeft className="w-4 h-4" /> Reopen</>}
            </button>
            <button onClick={() => setShowEdit(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
              <Edit className="w-4 h-4" /> Edit
            </button>
            <button onClick={() => setShowDelete(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Job Description</h3>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{job.description || 'No description provided'}</p>
          </div>

          {/* Candidates */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Candidates ({job.candidates?.length || 0})</h3>
            {job.candidates?.length > 0 ? (
              <div className="space-y-2">
                {job.candidates.map(c => (
                  <button key={c._id} onClick={() => navigate(`/candidates/${c._id}`)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors text-left">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.email} · {c.experience} yr{c.experience !== 1 ? 's' : ''} exp</p>
                    </div>
                    <StageBadge stage={c.stage} />
                  </button>
                ))}
              </div>
            ) : <p className="text-sm text-slate-400">No candidates have applied yet</p>}
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 h-fit">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Required Skills</h3>
          {job.requiredSkills?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map(s => (
                <span key={s} className="px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full">{s}</span>
              ))}
            </div>
          ) : <p className="text-sm text-slate-400">No skills specified</p>}
        </div>
      </div>

      {showEdit && (
        <JobForm isOpen={showEdit} onClose={() => setShowEdit(false)} onSuccess={() => { setShowEdit(false); fetchJob(); }} job={job} />
      )}

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Job"
        message={`Are you sure you want to delete "${job.title}"? Jobs with candidates cannot be deleted.`}
        loading={deleting}
      />
    </div>
  );
}
