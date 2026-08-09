import { UsersIcon } from "lucide-react";

const Header = () => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between my-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20">
          <UsersIcon className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            User Management
          </h1>
          <p className="mt-0.5 text-sm text-slate-400">
            Manage all registered users on the platform
          </p>
        </div>
      </div>
    </div>
  );
}

export default Header;