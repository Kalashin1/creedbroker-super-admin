// src/components/admin/UserActionDropdown.tsx
import React, { useRef, useState, useEffect } from 'react';
import {
  MoreVertical,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Ban,
  Unlock,
  Bell,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import { useClickOutside } from '../../../hooks/useClickOutside';
import type { AdminUser, UserAction } from '../../../types/admin.types';

interface Props {
  user: AdminUser;
  onAction: (action: UserAction, user: AdminUser) => void;
}

interface ActionItem {
  id: UserAction;
  label: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
  show: (user: AdminUser) => boolean;
}

const actions: ActionItem[] = [
  {
    id: 'view',
    label: 'View Profile',
    icon: <Eye className="h-4 w-4" />,
    color: 'text-slate-300',
    hoverColor: 'hover:bg-slate-800 hover:text-white',
    show: () => true,
  },
  {
    id: 'verify_kyc',
    label: 'Verify KYC',
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: 'text-emerald-400',
    hoverColor: 'hover:bg-emerald-500/10 hover:text-emerald-300',
    show: (u) => u.kycStatus === 'pending',
  },
  {
    id: 'reject_kyc',
    label: 'Reject KYC',
    icon: <XCircle className="h-4 w-4" />,
    color: 'text-red-400',
    hoverColor: 'hover:bg-red-500/10 hover:text-red-300',
    show: (u) => u.kycStatus === 'pending',
  },
  {
    id: 'restrict',
    label: 'Restrict Account',
    icon: <AlertTriangle className="h-4 w-4" />,
    color: 'text-amber-400',
    hoverColor: 'hover:bg-amber-500/10 hover:text-amber-300',
    show: (u) => u.accountStatus === 'active',
  },
  {
    id: 'unrestrict',
    label: 'Remove Restriction',
    icon: <Unlock className="h-4 w-4" />,
    color: 'text-emerald-400',
    hoverColor: 'hover:bg-emerald-500/10 hover:text-emerald-300',
    show: (u) => u.accountStatus === 'restricted',
  },
  {
    id: 'block',
    label: 'Block Account',
    icon: <Ban className="h-4 w-4" />,
    color: 'text-red-400',
    hoverColor: 'hover:bg-red-500/10 hover:text-red-300',
    show: (u) => u.accountStatus !== 'blocked' && u.accountStatus !== 'deleted',
  },
  {
    id: 'unblock',
    label: 'Unblock Account',
    icon: <ShieldCheck className="h-4 w-4" />,
    color: 'text-emerald-400',
    hoverColor: 'hover:bg-emerald-500/10 hover:text-emerald-300',
    show: (u) => u.accountStatus === 'blocked',
  },
  {
    id: 'send_notification',
    label: 'Send Notification',
    icon: <Bell className="h-4 w-4" />,
    color: 'text-cyan-400',
    hoverColor: 'hover:bg-cyan-500/10 hover:text-cyan-300',
    show: () => true,
  },
  {
    id: 'delete',
    label: 'Delete Account',
    icon: <Trash2 className="h-4 w-4" />,
    color: 'text-red-400',
    hoverColor: 'hover:bg-red-500/10 hover:text-red-300',
    show: (u) => u.accountStatus !== 'deleted',
  },
];

const UserActionDropdown: React.FC<Props> = ({ user, onAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  
  useClickOutside(ref, () => setIsOpen(false));

  const visibleActions = actions.filter((a) => a.show(user));

  // 🆕 Smart positioning: detect if dropdown would overflow viewport
  useEffect(() => {
    if (!isOpen || !buttonRef.current) return;

    const checkPosition = () => {
      const button = buttonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = visibleActions.length * 40 + 80; // Approximate height

      // If dropdown would overflow bottom, open upward
      if (rect.bottom + dropdownHeight > viewportHeight) {
        setDropUp(true);
      } else {
        setDropUp(false);
      }
    };

    checkPosition();
    
    // Re-check on scroll/resize
    window.addEventListener('scroll', checkPosition, true);
    window.addEventListener('resize', checkPosition);

    return () => {
      window.removeEventListener('scroll', checkPosition, true);
      window.removeEventListener('resize', checkPosition);
    };
  }, [isOpen, visibleActions.length]);

  return (
    <div className="relative" ref={ref}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
        aria-label="User actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute right-0 z-[100] w-56 origin-top-right rounded-xl border border-slate-800 bg-slate-900 py-1.5 shadow-2xl shadow-black/40 ${
            dropUp
              ? 'bottom-full mb-1 origin-bottom-right'
              : 'top-full mt-1 origin-top-right'
          }`}
        >
          {visibleActions.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                onAction(action.id, user);
                setIsOpen(false);
              }}
              className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm transition ${action.color} ${action.hoverColor}`}
            >
              {action.icon}
              <span className="font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserActionDropdown;