import { WebSocketMessage } from '@/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000/ws';

let ws: WebSocket | null = null;
let clientId: string | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let messageHandlers: ((msg: WebSocketMessage) => void)[] = [];

const generateClientId = () => `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const connectWebSocket = (): void => {
  if (typeof window === 'undefined') return;
  if (ws && ws.readyState === WebSocket.OPEN) return;

  if (!clientId) {
    clientId = generateClientId();
  }

  try {
    ws = new WebSocket(`${WS_URL}?clientId=${clientId}`);

    ws.onopen = () => {
      console.log('WebSocket connected');
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        messageHandlers.forEach((handler) => handler(message));
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected, reconnecting...');
      reconnectTimer = setTimeout(() => connectWebSocket(), 3000);
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
  } catch (err) {
    console.error('Failed to connect WebSocket:', err);
  }
};

export const disconnectWebSocket = (): void => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (ws) {
    ws.close();
    ws = null;
  }
};

export const addMessageHandler = (handler: (msg: WebSocketMessage) => void): (() => void) => {
  messageHandlers.push(handler);
  return () => {
    messageHandlers = messageHandlers.filter((h) => h !== handler);
  };
};

export const sendMessage = (message: object): void => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
};

export const getClientId = (): string | null => clientId;
