import { useQuery } from '@tanstack/react-query';
import { Users, ClipboardCheck, ClipboardX, Clock } from 'lucide-react';
import { api } from '../api/client';

interface ListResp {
  total: number;
  items: { id: string; kycStatus: string }[];
}

function countByStatus(status: string) {
  return async () => {
    const { data } = await api.get<ListResp>('/admin/users', { params: { status, pageSize: 1 } });
    return data.total;
  };
}

export function DashboardPage() {
  const totalQ = useQuery({ queryKey: ['count', 'all'], queryFn: countByStatus('') });
  const submittedQ = useQuery({ queryKey: ['count', 'SUBMITTED'], queryFn: countByStatus('SUBMITTED') });
  const verifiedQ = useQuery({ queryKey: ['count', 'VERIFIED'], queryFn: countByStatus('VERIFIED') });
  const rejectedQ = useQuery({ queryKey: ['count', 'REJECTED'], queryFn: countByStatus('REJECTED') });

  const cards = [
    { label: 'Total users', value: totalQ.data ?? '—', icon: Users, color: 'bg-navy-600' },
    { label: 'KYC pending review', value: submittedQ.data ?? '—', icon: Clock, color: 'bg-gold-500' },
    { label: 'KYC verified', value: verifiedQ.data ?? '—', icon: ClipboardCheck, color: 'bg-teal-500' },
    { label: 'KYC rejected', value: rejectedQ.data ?? '—', icon: ClipboardX, color: 'bg-red-500' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold text-navy-700">Dashboard</h1>
      <p className="text-slate-500 text-sm mt-1">Live KYC pipeline.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <div className="flex items-start justify-between">
              <div className={`${c.color} text-white rounded-lg p-2`}>
                <c.icon size={18} />
              </div>
            </div>
            <div className="text-3xl font-serif font-bold text-navy-700 mt-4">{c.value}</div>
            <div className="text-slate-500 text-sm mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="card mt-8 p-6">
        <h2 className="font-semibold text-navy-700">Next sprint focus</h2>
        <p className="text-sm text-slate-600 mt-2">
          Sprint 3 starts with Personal Loan E2E + risk engine v1. See <code>docs/sprint-plan.md</code>.
        </p>
      </div>
    </div>
  );
}
