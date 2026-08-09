const StatCard = ({
  stats,
}: {
  stats: {
    total: number;
    active: number;
    pendingKYC: number;
    blocked: number;
  };
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 my-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          Total Users
        </p>
        <p className="mt-1 text-2xl font-bold text-white tabular-nums">
          {stats.total}
        </p>
      </div>
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-emerald-400">
          Active
        </p>
        <p className="mt-1 text-2xl font-bold text-emerald-400 tabular-nums">
          {stats.active}
        </p>
      </div>
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-amber-400">
          Pending KYC
        </p>
        <p className="mt-1 text-2xl font-bold text-amber-400 tabular-nums">
          {stats.pendingKYC}
        </p>
      </div>
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-red-400">
          Blocked
        </p>
        <p className="mt-1 text-2xl font-bold text-red-400 tabular-nums">
          {stats.blocked}
        </p>
      </div>
    </div>
  );
};

export default StatCard;
