/**
 * StatusBadge.js
 * Displays a complaint status with color-coded styling.
 */

import React from 'react';

const STATUS_CONFIG = {
  'Pending':     { bg: 'bg-amber-100',  text: 'text-amber-800',  dot: 'bg-amber-400',  label: 'Pending'     },
  'In Progress': { bg: 'bg-blue-100',   text: 'text-blue-800',   dot: 'bg-blue-500',   label: 'In Progress' },
  'Resolved':    { bg: 'bg-emerald-100',text: 'text-emerald-800',dot: 'bg-emerald-500',label: 'Resolved'    },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['Pending'];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                      text-xs font-semibold ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
