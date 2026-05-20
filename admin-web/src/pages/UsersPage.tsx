import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

interface UserItem {
  id: string;
  phone: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  kycStatus: string;
  isProfileComplete: boolean;
  createdAt: string;
}

const statuses = ['', 'PENDING', 'PARTIAL', 'SUBMITTED', 'VERIFIED', 'REJECTED'];

function statusBadge(s: string) {
  const map: Record<string, string> = {
    VERIFIED: 'bg-teal-50 text-teal-700 ring-teal-600/20',
    REJECTED: 'bg-red-50 text-red-700 ring-red-600/20',
    SUBMITTED: 'bg-gold-500/10 text-gold-600 ring-gold-500/30',
    PARTIAL: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    PENDING: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  };
  return `badge ring-1 ${map[s] ?? map.PENDING}`;
}

export function UsersPage() {
  const [status, setStatus] = useState('SUBMITTED');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['users', status, page],
    queryFn: async () => {
      const { data } = await api.get<{ total: number; items: UserItem[] }>('/admin/users', {
        params: { status, page, pageSize },
      });
      return data;
    },
  });

  const total = data?.total ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold text-navy-700">Users / KYC Queue</h1>
      <p className="text-slate-500 text-sm mt-1">Review submitted KYC and approve or reject.</p>

      <div className="flex items-center gap-2 mt-6">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
              status === s ? 'bg-navy-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="card mt-6 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">KYC</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Joined</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {isLoading && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Loading…</td></tr>
            )}
            {!isLoading && data?.items.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No users</td></tr>
            )}
            {data?.items.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-medium text-navy-700">
                  {u.firstName || u.lastName ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() : <span className="text-slate-400 italic">No profile</span>}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-slate-600">{u.phone}</td>
                <td className="px-4 py-3"><span className={statusBadge(u.kycStatus)}>{u.kycStatus}</span></td>
                <td className="px-4 py-3 text-sm text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/users/${u.id}`} className="text-sm font-medium text-teal-600 hover:text-teal-700">
                    Review →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
        <div>{total} users</div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span>Page {page} of {lastPage}</span>
          <button className="btn-secondary" disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
