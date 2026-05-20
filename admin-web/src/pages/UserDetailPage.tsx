import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { api } from '../api/client';

interface KycDoc {
  id: string;
  type: string;
  status: string;
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserDetail {
  id: string;
  phone: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  kycStatus: string;
  isProfileComplete: boolean;
  createdAt: string;
  kycDocuments: KycDoc[];
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'VERIFIED') return <CheckCircle2 className="text-teal-600" size={20} />;
  if (status === 'REJECTED') return <XCircle className="text-red-600" size={20} />;
  return <Clock className="text-slate-400" size={20} />;
}

export function UserDetailPage() {
  const { id = '' } = useParams();
  const qc = useQueryClient();
  const nav = useNavigate();
  const [rejectReason, setRejectReason] = useState('');

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => (await api.get<UserDetail>(`/admin/users/${id}`)).data,
  });

  const approve = useMutation({
    mutationFn: () => api.post(`/admin/kyc/${id}/approve`, { remarks: 'Approved via console' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['user', id] }); qc.invalidateQueries({ queryKey: ['users'] }); },
  });

  const reject = useMutation({
    mutationFn: () => api.post(`/admin/kyc/${id}/reject`, { reason: rejectReason || 'Documents not clear' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['user', id] }); qc.invalidateQueries({ queryKey: ['users'] }); setRejectReason(''); },
  });

  if (isLoading || !user) {
    return <div className="p-8 text-slate-400">Loading…</div>;
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || '—';

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <button onClick={() => nav(-1)} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy-700">
        <ArrowLeft size={16} /> Back to queue
      </button>

      <div className="card mt-4 p-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold text-navy-700">{fullName}</h1>
            <p className="text-slate-500 mt-1 font-mono text-sm">{user.phone}</p>
            <p className="text-slate-500 text-sm">{user.email ?? <span className="italic">no email</span>}</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 uppercase tracking-wider">KYC Status</div>
            <div className="font-serif text-2xl text-navy-700 mt-1">{user.kycStatus}</div>
            <div className="text-xs text-slate-400 mt-1">Joined {new Date(user.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      <h2 className="font-semibold text-navy-700 mt-8 mb-3">KYC Documents</h2>
      <div className="space-y-3">
        {user.kycDocuments.length === 0 && (
          <div className="card p-6 text-slate-400 italic">No documents submitted yet.</div>
        )}
        {user.kycDocuments.map((d) => (
          <div key={d.id} className="card p-4 flex items-center gap-4">
            <StatusIcon status={d.status} />
            <div className="flex-1">
              <div className="font-medium text-navy-700">{d.type}</div>
              <div className="text-xs text-slate-500">
                Submitted {new Date(d.createdAt).toLocaleString()}
                {d.reviewedAt && ` • Reviewed ${new Date(d.reviewedAt).toLocaleString()}`}
              </div>
              {d.rejectionReason && (
                <div className="text-xs text-red-600 mt-1">{d.rejectionReason}</div>
              )}
            </div>
            <div className="text-xs font-medium text-slate-600 uppercase tracking-wider">{d.status}</div>
          </div>
        ))}
      </div>

      {user.kycStatus !== 'VERIFIED' && user.kycStatus !== 'REJECTED' && user.kycDocuments.length > 0 && (
        <div className="card mt-8 p-6">
          <h3 className="font-semibold text-navy-700">Review decision</h3>
          <p className="text-sm text-slate-500 mt-1">All actions are audit-logged.</p>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => approve.mutate()}
              disabled={approve.isPending}
              className="btn-primary"
            >
              {approve.isPending ? 'Approving…' : 'Approve KYC'}
            </button>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700">Rejection reason</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="input mt-1"
              rows={2}
              placeholder="e.g. PAN name mismatch with bank account"
            />
            <button
              onClick={() => reject.mutate()}
              disabled={reject.isPending || !rejectReason.trim()}
              className="btn-danger mt-3"
            >
              {reject.isPending ? 'Rejecting…' : 'Reject KYC'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
