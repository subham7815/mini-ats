import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus, Search, Filter, X, ChevronLeft, ChevronRight,
  ArrowUpDown, MoreHorizontal, Eye, Edit, Trash2, Users
} from 'lucide-react';
import { candidateApi, jobApi } from '../../services/api';
import { StageBadge } from '../../components/Badges';
import { PageLoader } from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import CandidateForm from './CandidateForm';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useToast } from '../../components/Toast';

export default function CandidatesList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCandidate, setEditCandidate] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [jobFilter, setJobFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [sortBy, setSortBy] = useState('applicationDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  const stages = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];
  const sources = ['LinkedIn', 'Referral', 'Job Board', 'Company Website', 'Indeed', 'Glassdoor', 'Other'];

  const fetchCandidates = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 15, sortBy, sortOrder };
      if (search) params.search = search;
      if (stageFilter) params.stage = stageFilter;
      if (jobFilter) params.jobId = jobFilter;
      if (sourceFilter) params.source = sourceFilter;

      const res = await candidateApi.getAll(params);
      setCandidates(res.data);
      setPagination(res.pagination);
    } catch (err) {
      toast.error('Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  }, [search, stageFilter, jobFilter, sourceFilter, sortBy, sortOrder]);

  useEffect(() => {
    jobApi.getAll().then(res => setJobs(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchCandidates(), 300);
    return () => clearTimeout(timer);
  }, [fetchCandidates]);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setShowForm(true);
      setSearchParams({});
    }
  }, [searchParams]);

  async function handleDelete() {
    if (!deleteCandidate) return;
    setDeleting(true);
    try {
      await candidateApi.delete(deleteCandidate._id);
      toast.success(`${deleteCandidate.name} has been removed`);
      setDeleteCandidate(null);
      fetchCandidates(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Failed to delete candidate');
    } finally {
      setDeleting(false);
    }
  }

  function handleFormSuccess() {
    setShowForm(false);
    setEditCandidate(null);
    fetchCandidates(1);
  }

  function toggleSort(field) {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  }

  function clearFilters() {
    setSearch('');
    setStageFilter('');
    setJobFilter('');
    setSourceFilter('');
  }

  const hasActiveFilters = stageFilter || jobFilter || sourceFilter || search;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{pagination.total} total candidate{pagination.total !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setEditCandidate(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Candidate
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, or job title..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg transition-colors ${hasActiveFilters ? 'border-primary-300 text-primary-700 bg-primary-50' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center">!</span>}
          </button>
        </div>

        {showFilters && (
          <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={stageFilter}
              onChange={e => setStageFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">All Stages</option>
              {stages.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={jobFilter}
              onChange={e => setJobFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">All Jobs</option>
              {jobs.map(j => <option key={j._id} value={j._id}>{j.title}</option>)}
            </select>
            <select
              value={sourceFilter}
              onChange={e => setSourceFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">All Sources</option>
              {sources.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
                <X className="w-4 h-4" /> Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? <PageLoader /> : candidates.length === 0 ? (
          <EmptyState
            icon={Users}
            title={hasActiveFilters ? 'No matching candidates' : 'No candidates yet'}
            description={hasActiveFilters ? 'Try adjusting your search or filters' : 'Add your first candidate to get started'}
            action={!hasActiveFilters && (
              <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700">
                <Plus className="w-4 h-4" /> Add Candidate
              </button>
            )}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3">
                      <button onClick={() => toggleSort('name')} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700">
                        Name <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 hidden md:table-cell text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell text-xs font-semibold text-slate-500 uppercase tracking-wider">Job</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stage</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell text-xs font-semibold text-slate-500 uppercase tracking-wider">Source</th>
                    <th className="text-left px-4 py-3 hidden sm:table-cell">
                      <button onClick={() => toggleSort('applicationDate')} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700">
                        Applied <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {candidates.map(c => (
                    <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/candidates/${c._id}`)}
                          className="font-medium text-slate-800 hover:text-primary-600 transition-colors"
                        >
                          {c.name}
                        </button>
                        <p className="text-xs text-slate-400 md:hidden">{c.email}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-slate-600">{c.email}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-slate-600">{c.jobId?.title || '—'}</td>
                      <td className="px-4 py-3"><StageBadge stage={c.stage} /></td>
                      <td className="px-4 py-3 hidden lg:table-cell text-slate-500">{c.source}</td>
                      <td className="px-4 py-3 hidden sm:table-cell text-slate-500">
                        {new Date(c.applicationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => navigate(`/candidates/${c._id}`)} className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setEditCandidate(c); setShowForm(true); }} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteCandidate(c)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
                <p className="text-sm text-slate-500">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} results)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchCandidates(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg hover:bg-slate-100"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => fetchCandidates(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg hover:bg-slate-100"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <CandidateForm
          isOpen={showForm}
          onClose={() => { setShowForm(false); setEditCandidate(null); }}
          onSuccess={handleFormSuccess}
          candidate={editCandidate}
          jobs={jobs}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={handleDelete}
        title="Delete Candidate"
        message={`Are you sure you want to remove ${deleteCandidate?.name}? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}
