'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAssignmentStore } from '@/store/assignmentStore';
import { WebSocketMessage } from '@/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000/ws';

export const useWebSocket = (jobId: string | null) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clientIdRef = useRef<string>(`client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const {
    setJobStatus,
    setProgress,
    setStatusMessage,
    setGeneratedPaper,
    setError,
  } = useAssignmentStore();

  const handleMessage = useCallback(
    (message: WebSocketMessage) => {
      if (message.type === 'connected') return;
      if (message.jobId && jobId && message.jobId !== jobId) return;

      switch (message.type) {
        case 'job_status':
          if (message.status) setJobStatus(message.status);
          if (message.progress !== undefined) setProgress(message.progress);
          if (message.message) setStatusMessage(message.message);
          break;

        case 'job_progress':
          if (message.progress !== undefined) setProgress(message.progress);
          if (message.message) setStatusMessage(message.message);
          break;

        case 'job_completed':
          setJobStatus('completed');
          setProgress(100);
          setStatusMessage('Assessment generated successfully!');
          if (message.data) setGeneratedPaper(message.data);
          break;

        case 'job_failed':
          setJobStatus('failed');
          setError(message.error || 'Generation failed');
          setStatusMessage('Generation failed');
          break;
      }
    },
    [jobId, setJobStatus, setProgress, setStatusMessage, setGeneratedPaper, setError]
  );

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(`${WS_URL}?clientId=${clientIdRef.current}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        if (reconnectRef.current) {
          clearTimeout(reconnectRef.current);
          reconnectRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch {
          // ignore
        }
      };

      ws.onclose = () => {
        reconnectRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch (err) {
      console.error('WebSocket connection failed:', err);
    }
  }, [handleMessage]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [connect]);

  // Ping to keep alive
  useEffect(() => {
    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);

    return () => clearInterval(pingInterval);
  }, []);
};
