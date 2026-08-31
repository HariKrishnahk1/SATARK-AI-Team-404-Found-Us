'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
}

interface SocketContextType {
  socket: Socket | null;
  toasts: Toast[];
  removeToast: (id: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  toasts: [],
  removeToast: () => {}
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (title: string, message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev.slice(-4), { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    const newSocket = io('http://localhost:8008', {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('[Socket.io Client] Connected to backend');
    });

    newSocket.on('NEW_CHALLENGE', (data) => {
      addToast('New Challenge Submitted', `[${data.district}] ${data.title} - Priority Score: ${data.priority_score}`, 'info');
    });

    newSocket.on('CHALLENGE_VALIDATED', (data) => {
      addToast('Govt Challenge Validated', `${data.title} has been validated by Department Admin`, 'success');
    });

    newSocket.on('HEI_ASSIGNED', (data) => {
      addToast('Routed to University', `Assigned to ${data.university_name}`, 'info');
    });

    newSocket.on('PROPOSAL_SUBMITTED', (data) => {
      addToast('Solution Proposal Submitted', `'${data.title}' budget ₹${data.budget_inr?.toLocaleString('en-IN')}`, 'success');
    });

    newSocket.on('SPONSORSHIP_PLEDGED', (data) => {
      addToast('CSR Funding Pledged!', `${data.organization_name} pledged ₹${data.funding_inr?.toLocaleString('en-IN')}`, 'success');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, toasts, removeToast }}>
      {children}

      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="pointer-events-auto flex flex-col p-4 rounded-xl bg-slate-900/95 text-white border border-cyan-500/40 shadow-2xl backdrop-blur-md animate-slide-up"
          >
            <div className="flex items-center justify-between gap-2 text-sm font-bold text-cyan-400">
              <span>{toast.title}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-300 mt-1">{toast.message}</p>
          </div>
        ))}
      </div>
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
