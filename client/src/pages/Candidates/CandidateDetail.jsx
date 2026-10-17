import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, Briefcase, MapPin, Clock, FileText,
  Edit, Trash2, ChevronRight, ExternalLink, Star
} from 'lucide-react';
import { candidateApi, jobApi } from '../../services/api';
import { StageBadge } from '../../components/Badges';
import { PageLoader } from '../../components/LoadingSpinner';
import CandidateForm from './CandidateForm';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useToast } from '../../components/Toast';

const STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];

export default function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [candidate, setCandidate] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [changingStage, setChangingStage] = useState(false);

  useEffect(() => {
    fetchCandidate();
    jobApi.getAll().then(res => setJobs(res.data)).catch(() => {});
  }, [id]);

  async function fetchCandidate() {
    setLoading(true);
    try {
      const res = await candidateApi.getById(id);
      setCandidate(res.data);
    } catch (err) {
      toast.error('Candidate not found');
      navigate('/candidates');
    } finally {
      setLoading(false);
    }
  }

  async function handleStageChange(newStage) {
    if (changingStage || newStage === candidate.stage) return;
    setChangingStage(true);
    try {
      const res = await candidateApi.updateStage(id, newStage);
      setCandidate(res.data);
      toast.success(`Stage changed to ${newStage}`);
    } catch (err) {
      toast.error(err.message || 'Failed to change stage');
    } finally {
      setChangingStage(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await candidateApi.delete(id);
      toast.success('Candidate deleted');
      navigate('/candidates');
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <PageLoader />;
  if (!candidate) return null;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button onClick={() => navigate('/candidates')} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Candidates
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-primary-600">
                {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-800">{candidate.name}</h2>
              <p className="text-sm text-slate-500 mt-0.5">{candidate.jobId?.title || 'No job assigned'}</p>
              <div className="flex items-center gap-3 mt-2">
                <StageBadge stage={candidate.stage} />
                <span className="text-xs text-slate-400">
                  Applied {new Date(candidate.applicationDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowEdit(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Edit className="w-4 h-4" /> Edit
            </button>
            <button onClick={() => setShowDelete(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Email</p>
                  <a href={`mailto:${candidate.email}`} className="text-sm text-primary-600 hover:underline">{candidate.email}</a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Phone</p>
                  <p className="text-sm text-slate-700">{candidate.phone || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Experience</p>
                  <p className="text-sm text-slate-700">{candidate.experience} year{candidate.experience !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Source</p>
                  <p className="text-sm text-slate-700">{candidate.source}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Skills</h3>
            {candidate.skills?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full">{skill}</span>
                ))}
              </div>
            ) : <p className="text-sm text-slate-400">No skills listed</p>}
          </div>

          {/* Resume & Notes */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Additional Info</h3>
            {candidate.resumeUrl && (
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-slate-400" />
                <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-primary-600 hover:underline inline-flex items-center gap-1">
                  View Resume <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
            {candidate.notes ? (
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{candidate.notes}</p>
            ) : <p className="text-sm text-slate-400">No notes</p>}
          </div>

          {/* Stage History / Activity Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Activity Timeline</h3>
            {candidate.stageHistory?.length > 0 ? (
              <div className="relative pl-6 space-y-4">
                <div className="absolute left-[9px] top-2 bottom-2 w-px bg-slate-200" />
                {[...candidate.stageHistory].reverse().map((entry, i) => (
                  <div key={i} className="relative flex items-start gap-3">
                    <div className="absolute left-[-18px] w-[18px] h-[18px] rounded-full bg-white border-2 border-primary-400 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-primary-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-700">
                        {entry.fromStage ? (
                          <>Moved from <span className="font-medium">{entry.fromStage}</span> to <span className="font-medium">{entry.toStage}</span></>
                        ) : (
                          <>Application received — <span className="font-medium">{entry.toStage}</span></>
                        )}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(entry.changedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        {entry.actor && ` · ${entry.actor}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-slate-400">No activity recorded</p>}
          </div>
        </div>

        {/* Right Column - Stage Management */}
        <div className="space-y-6">
          {/* Change Stage */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Hiring Stage</h3>
            <div className="space-y-1.5">
              {STAGES.map(stage => {
                const isCurrent = candidate.stage === stage;
                return (
                  <button
                    key={stage}
                    onClick={() => handleStageChange(stage)}
                    disabled={changingStage || isCurrent}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                      ${isCurrent
                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                        : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                      }
                      ${changingStage ? 'opacity-50' : ''}
                    `}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-primary-500' : 'bg-slate-300'}`} />
                      {stage}
                    </span>
                    {isCurrent && <span className="text-xs text-primary-500">Current</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Job Info */}
          {candidate.jobId && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Applied Job</h3>
              <button
                onClick={() => navigate(`/jobs/${candidate.jobId._id}`)}
                className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <p className="text-sm font-medium text-slate-800">{candidate.jobId.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{candidate.jobId.department} · {candidate.jobId.location}</p>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Form Modal */}
      {showEdit && (
        <CandidateForm
          isOpen={showEdit}
          onClose={() => setShowEdit(false)}
          onSuccess={() => { setShowEdit(false); fetchCandidate(); }}
          candidate={candidate}
          jobs={jobs}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Candidate"
        message={`Are you sure you want to remove ${candidate.name}? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}
