import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, User, Briefcase } from 'lucide-react';
import { searchApi } from '../services/api';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchApi.search(query.trim());
        setResults(res.data);
        setIsOpen(true);
      } catch {
        setResults({ candidates: [], jobs: [] });
        setIsOpen(true);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function handleSelect(type, id) {
    setQuery('');
    setIsOpen(false);
    setResults(null);
    if (type === 'candidate') navigate(`/candidates/${id}`);
    else navigate(`/jobs/${id}`);
  }

  const totalResults = results ? results.candidates.length + results.jobs.length : 0;

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search candidates, jobs..."
          className="w-full pl-10 pr-8 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white transition-all placeholder:text-slate-400"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setIsOpen(false); setResults(null); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 max-h-80 overflow-y-auto z-50">
          {loading ? (
            <div className="p-4 text-center text-sm text-slate-500">Searching...</div>
          ) : totalResults === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">No results found for "{query}"</div>
          ) : (
            <>
              {results.candidates.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50">
                    Candidates ({results.candidates.length})
                  </div>
                  {results.candidates.map(c => (
                    <button
                      key={c._id}
                      onClick={() => handleSelect('candidate', c._id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{c.name}</p>
                        <p className="text-xs text-slate-500 truncate">{c.email} · {c.jobId?.title || 'No job'}</p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium stage-${c.stage?.toLowerCase()}`}>
                        {c.stage}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {results.jobs.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50">
                    Jobs ({results.jobs.length})
                  </div>
                  {results.jobs.map(j => (
                    <button
                      key={j._id}
                      onClick={() => handleSelect('job', j._id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{j.title}</p>
                        <p className="text-xs text-slate-500 truncate">{j.department} · {j.location}</p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${j.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                        {j.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
