import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Eye, ArrowRight, Clock, Briefcase } from 'lucide-react';
import { candidateApi } from '../../services/api';
import { PageLoader } from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';

const STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];

const STAGE_STYLES = {
  Applied: { bg: 'bg-blue-50', border: 'border-blue-200', header: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  Screening: { bg: 'bg-amber-50', border: 'border-amber-200', header: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  Interview: { bg: 'bg-indigo-50', border: 'border-indigo-200', header: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' },
  Offer: { bg: 'bg-emerald-50', border: 'border-emerald-200', header: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  Hired: { bg: 'bg-green-50', border: 'border-green-200', header: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  Rejected: { bg: 'bg-red-50', border: 'border-red-200', header: 'bg-red-100 text-red-700', dot: 'bg-red-500' }
};

export default function Pipeline() {
  const navigate = useNavigate();
  const toast = useToast();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMenu, setActionMenu] = useState(null);
  const [draggedCard, setDraggedCard] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActionMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function fetchCandidates() {
    setLoading(true);
    try {
      const res = await candidateApi.getAll({ limit: 200 });
      setCandidates(res.data);
    } catch (err) {
      toast.error('Failed to load pipeline');
    } finally {
      setLoading(false);
    }
  }

  async function moveCandidate(candidateId, newStage) {
    const candidate = candidates.find(c => c._id === candidateId);
    if (!candidate || candidate.stage === newStage) return;

    // Optimistic update
    setCandidates(prev => prev.map(c => c._id === candidateId ? { ...c, stage: newStage } : c));
    setActionMenu(null);

    try {
      await candidateApi.updateStage(candidateId, newStage);
      toast.success(`${candidate.name} moved to ${newStage}`);
    } catch (err) {
      // Revert
      setCandidates(prev => prev.map(c => c._id === candidateId ? { ...c, stage: candidate.stage } : c));
      toast.error(err.message || 'Failed to move candidate');
    }
  }

  function handleDragStart(e, candidate) {
    setDraggedCard(candidate);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', candidate._id);
    // Slight delay for visual
    setTimeout(() => {
      e.target.classList.add('dragging');
    }, 0);
  }

  function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    setDraggedCard(null);
    setDragOverStage(null);
  }

  function handleDragOver(e, stage) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stage);
  }

  function handleDragLeave() {
    setDragOverStage(null);
  }

  function handleDrop(e, stage) {
    e.preventDefault();
    setDragOverStage(null);
    const candidateId = e.dataTransfer.getData('text/plain');
    if (candidateId) {
      moveCandidate(candidateId, stage);
    }
  }

  const grouped = {};
  STAGES.forEach(s => { grouped[s] = []; });
  candidates.forEach(c => {
    if (grouped[c.stage]) grouped[c.stage].push(c);
  });

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">Drag candidates between stages or use the action menu to move them.</p>

      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '70vh' }}>
        {STAGES.map(stage => {
          const style = STAGE_STYLES[stage];
          const stageCards = grouped[stage];
          const isDropTarget = dragOverStage === stage && draggedCard?.stage !== stage;

          return (
            <div
              key={stage}
              className={`flex-shrink-0 w-72 rounded-xl border ${style.border} ${style.bg} flex flex-col transition-all ${isDropTarget ? 'ring-2 ring-primary-400 ring-offset-2' : ''}`}
              onDragOver={(e) => handleDragOver(e, stage)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage)}
            >
              {/* Stage Header */}
              <div className={`px-4 py-3 rounded-t-xl ${style.header} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                  <span className="text-sm font-semibold">{stage}</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/50">{stageCards.length}</span>
              </div>

              {/* Cards */}
              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {stageCards.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">No candidates</div>
                ) : (
                  stageCards.map(c => (
                    <div
                      key={c._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, c)}
                      onDragEnd={handleDragEnd}
                      className="pipeline-card bg-white rounded-lg border border-slate-200 p-3 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <button onClick={() => navigate(`/candidates/${c._id}`)}
                          className="text-sm font-medium text-slate-800 hover:text-primary-600 transition-colors text-left">
                          {c.name}
                        </button>
                        <div className="relative">
                          <button onClick={() => setActionMenu(actionMenu === c._id ? null : c._id)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {actionMenu === c._id && (
                            <div ref={menuRef} className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-20">
                              <button onClick={() => navigate(`/candidates/${c._id}`)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                                <Eye className="w-3.5 h-3.5" /> View Details
                              </button>
                              <div className="border-t border-slate-100 my-1" />
                              <p className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase">Move to</p>
                              {STAGES.filter(s => s !== c.stage).map(s => (
                                <button key={s} onClick={() => moveCandidate(c._id, s)}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
                                  <ArrowRight className="w-3 h-3" /> {s}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Briefcase className="w-3 h-3" />
                          <span className="truncate">{c.jobId?.title || 'No job'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>{c.experience} yr{c.experience !== 1 ? 's' : ''} exp</span>
                        </div>
                        {c.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {c.skills.slice(0, 3).map(s => (
                              <span key={s} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded">{s}</span>
                            ))}
                            {c.skills.length > 3 && <span className="text-[10px] text-slate-400">+{c.skills.length - 3}</span>}
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2">
                        {new Date(c.applicationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
