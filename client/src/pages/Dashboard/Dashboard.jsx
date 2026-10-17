import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Briefcase, MessageSquare, Gift, UserCheck,
  Plus, Eye, TrendingUp, ArrowUpRight, Clock
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area,
  FunnelChart, Funnel, LabelList
} from 'recharts';
import { dashboardApi } from '../../services/api';
import { PageLoader } from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const STAGE_COLORS = {
  Applied: '#3b82f6',
  Screening: '#f59e0b',
  Interview: '#6366f1',
  Offer: '#10b981',
  Hired: '#22c55e',
  Rejected: '#ef4444'
};

const SOURCE_COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const ACTIVITY_ICONS = {
  candidate_added: Users,
  candidate_updated: Users,
  candidate_deleted: Users,
  stage_changed: ArrowUpRight,
  interview_scheduled: MessageSquare,
  offer_extended: Gift,
  candidate_hired: UserCheck,
  job_created: Briefcase,
  job_updated: Briefcase,
  job_closed: Briefcase,
  job_reopened: Briefcase,
  job_deleted: Briefcase
};

const ACTIVITY_COLORS = {
  candidate_added: 'bg-blue-100 text-blue-600',
  candidate_hired: 'bg-green-100 text-green-600',
  offer_extended: 'bg-emerald-100 text-emerald-600',
  interview_scheduled: 'bg-indigo-100 text-indigo-600',
  stage_changed: 'bg-amber-100 text-amber-600',
  candidate_deleted: 'bg-red-100 text-red-600',
  job_created: 'bg-blue-100 text-blue-600',
  job_closed: 'bg-slate-100 text-slate-600',
  default: 'bg-slate-100 text-slate-600'
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [pipeline, setPipeline] = useState([]);
  const [appOverTime, setAppOverTime] = useState([]);
  const [sources, setSources] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [m, p, aot, s, a] = await Promise.all([
        dashboardApi.getMetrics(),
        dashboardApi.getPipeline(),
        dashboardApi.getApplicationsOverTime(),
        dashboardApi.getSources(),
        dashboardApi.getActivity()
      ]);
      setMetrics(m.data);
      setPipeline(p.data);
      setAppOverTime(aot.data);
      setSources(s.data);
      setActivity(a.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <PageLoader />;

  const kpis = [
    { label: 'Total Candidates', value: metrics?.totalCandidates || 0, icon: Users, color: 'bg-blue-50 text-blue-600', change: null },
    { label: 'Active Openings', value: metrics?.activeJobs || 0, icon: Briefcase, color: 'bg-indigo-50 text-indigo-600', change: null },
    { label: 'In Interview', value: metrics?.inInterview || 0, icon: MessageSquare, color: 'bg-violet-50 text-violet-600', change: null },
    { label: 'Offers Extended', value: metrics?.offersExtended || 0, icon: Gift, color: 'bg-emerald-50 text-emerald-600', change: null },
    { label: 'Hired', value: metrics?.hiredCandidates || 0, icon: UserCheck, color: 'bg-green-50 text-green-600', change: null }
  ];

  const funnelData = pipeline.filter(s => s.stage !== 'Rejected').map(s => ({
    name: s.stage,
    value: s.count,
    fill: STAGE_COLORS[s.stage]
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${kpi.color}`}>
                <kpi.icon className="w-5 h-5" />
              </div>
              {kpi.change && (
                <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                  <TrendingUp className="w-3 h-3" /> {kpi.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-slate-800">{kpi.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Candidate Distribution by Stage</h3>
          {pipeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={pipeline} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="stage" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {pipeline.map((entry) => (
                    <Cell key={entry.stage} fill={STAGE_COLORS[entry.stage]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState title="No candidate data" description="Add candidates to see distribution" />}
        </div>

        {/* Applications Over Time */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Applications Over Time (Last 30 Days)</h3>
          {appOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={appOverTime} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Area type="monotone" dataKey="count" stroke="#6366f1" fill="url(#colorCount)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyState title="No application data" description="Applications will appear as candidates are added" />}
        </div>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hiring Funnel */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Hiring Funnel</h3>
          <p className="text-xs text-slate-400 mb-4">Current candidate counts per active stage (excluding rejected)</p>
          {funnelData.some(d => d.value > 0) ? (
            <div className="space-y-3">
              {funnelData.map((item, i) => {
                const maxVal = Math.max(...funnelData.map(d => d.value), 1);
                const pct = (item.value / maxVal) * 100;
                return (
                  <div key={item.name} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-600 w-20">{item.name}</span>
                    <div className="flex-1 h-8 bg-slate-100 rounded-md overflow-hidden">
                      <div
                        className="h-full rounded-md flex items-center justify-end pr-2 transition-all duration-500"
                        style={{ width: `${Math.max(pct, 8)}%`, backgroundColor: item.fill }}
                      >
                        <span className="text-xs font-bold text-white">{item.value}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <EmptyState title="No funnel data" description="Add candidates to see the hiring funnel" />}
        </div>

        {/* Source Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Candidate Source Breakdown</h3>
          {sources.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={sources}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="count"
                  nameKey="source"
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {sources.map((entry, i) => (
                    <Cell key={entry.source} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyState title="No source data" description="Candidate sources will appear here" />}
        </div>
      </div>

      {/* Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Recent Activity</h3>
          {activity.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {activity.map(a => {
                const IconComp = ACTIVITY_ICONS[a.actionType] || Clock;
                const colorClass = ACTIVITY_COLORS[a.actionType] || ACTIVITY_COLORS.default;
                return (
                  <div key={a._id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700">{a.description}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <EmptyState title="No recent activity" description="Activities will appear as you manage candidates and jobs" />}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/candidates?action=add')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <Plus className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">Add Candidate</p>
                <p className="text-xs text-primary-500">Create a new candidate record</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/jobs?action=add')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Briefcase className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">Post New Job</p>
                <p className="text-xs text-blue-500">Create a job opening</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/pipeline')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                <Eye className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">View Pipeline</p>
                <p className="text-xs text-emerald-500">See recruitment stages</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
