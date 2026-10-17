export function StageBadge({ stage }) {
  const classes = {
    Applied: 'stage-applied',
    Screening: 'stage-screening',
    Interview: 'stage-interview',
    Offer: 'stage-offer',
    Hired: 'stage-hired',
    Rejected: 'stage-rejected'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes[stage] || 'bg-slate-100 text-slate-700'}`}>
      {stage}
    </span>
  );
}

export function StatusBadge({ status }) {
  const isOpen = status === 'Open';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isOpen ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isOpen ? 'bg-green-500' : 'bg-slate-400'}`} />
      {status}
    </span>
  );
}

export function EmploymentTypeBadge({ type }) {
  const colors = {
    'Full-time': 'bg-blue-50 text-blue-700',
    'Part-time': 'bg-purple-50 text-purple-700',
    'Contract': 'bg-orange-50 text-orange-700',
    'Internship': 'bg-teal-50 text-teal-700'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[type] || 'bg-slate-100 text-slate-600'}`}>
      {type}
    </span>
  );
}
