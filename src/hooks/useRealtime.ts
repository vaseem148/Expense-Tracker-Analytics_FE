import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, type Socket } from 'socket.io-client';
import { tokens } from '@/api/client';
import { toast } from '@/store/toast';

/**
 * Live ledger updates. The socket only ever tells us *what* changed - the
 * refetch is left to React Query, so the cache stays the single source of
 * truth instead of being patched from two directions.
 */
export function useRealtime(enabled: boolean) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    const token = tokens.access();
    if (!token) return;

    const socket: Socket = io('/realtime', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1500,
    });

    const invalidateLedger = () => {
      for (const key of ['dashboard', 'transactions', 'overview', 'timeseries', 'accounts']) {
        void qc.invalidateQueries({ queryKey: [key] });
      }
    };

    socket.on('transaction.created', invalidateLedger);
    socket.on('transaction.updated', invalidateLedger);
    socket.on('transaction.deleted', invalidateLedger);

    socket.on('notification', (payload: { title: string; body: string; severity: string }) => {
      void qc.invalidateQueries({ queryKey: ['notifications'] });
      const variant =
        payload.severity === 'critical'
          ? 'error'
          : payload.severity === 'warning'
            ? 'warning'
            : payload.severity === 'success'
              ? 'success'
              : 'info';
      toast[variant](payload.title, payload.body);
    });

    socket.on('sync.progress', (payload: { provider: string; status: string }) => {
      if (payload.status === 'completed') {
        toast.success(`${payload.provider} sync finished`);
        invalidateLedger();
      }
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [enabled, qc]);
}
