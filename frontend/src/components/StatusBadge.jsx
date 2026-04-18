const StatusBadge = ({ status }) => {
  const colors = {
    'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'paid': 'bg-blue-100 text-blue-800 border-blue-200',
    'assigned': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'in-progress': 'bg-orange-100 text-orange-800 border-orange-200',
    'completed': 'bg-green-100 text-green-800 border-green-200',
    'cancelled': 'bg-gray-100 text-gray-800 border-gray-200',
    'failed': 'bg-red-100 text-red-800 border-red-200',
    'rejected': 'bg-red-50 text-red-700 border-red-200',
  };

  const currentStyle = colors[status] || colors.pending;

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border uppercase tracking-wider ${currentStyle}`}>
      {status.replace('-', ' ')}
    </span>
  );
};

export default StatusBadge;
