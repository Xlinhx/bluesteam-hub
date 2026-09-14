import { SessionEventType, SessionMessage } from '../../domain/session/types';

export interface SessionTransport {
  connect(sessionId: string, sourceId?: string): void;
  disconnect(): void;
  send<T = unknown>(type: SessionEventType, payload: T): void;
  subscribe(handler: (message: SessionMessage) => void): () => void;
  getSourceId(): string;
  getSessionId(): string | null;
  getIsConnected(): boolean;
  handleIncomingMessage(message: SessionMessage): void;
}

export class LocalBroadcastTransport implements SessionTransport {
  private channel: BroadcastChannel | null = null;
  private sessionId: string | null = null;
  private sourceId: string;
  private listeners: Set<(message: SessionMessage) => void> = new Set();
  private isConnected = false;

  constructor(sourceIdPrefix = 'tab') {
    this.sourceId = `${sourceIdPrefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
  }

  public connect(sessionId: string, customSourceId?: string): void {
    if (this.channel && this.sessionId === sessionId) {
      return;
    }
    this.disconnect();

    this.sessionId = sessionId;
    if (customSourceId) {
      this.sourceId = customSourceId;
    }

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channelName = `ocean-session:${sessionId}`;
        this.channel = new BroadcastChannel(channelName);
        this.channel.onmessage = this.handleChannelMessage.bind(this);
        this.isConnected = true;
      }
    } catch (err) {
      console.warn('[SessionTransport] BroadcastChannel not supported or failed to open:', err);
    }
  }

  public disconnect(): void {
    if (this.channel) {
      this.channel.onmessage = null;
      this.channel.close();
      this.channel = null;
    }
    this.sessionId = null;
    this.isConnected = false;
  }

  public send<T = unknown>(type: SessionEventType, payload: T): void {
    if (!this.sessionId) {
      return;
    }

    const message: SessionMessage<T> = {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sourceId: this.sourceId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      version: 1,
      type,
      payload,
    };

    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch (err) {
        console.error('[SessionTransport] Error posting message to BroadcastChannel:', err);
      }
    }
  }

  public subscribe(handler: (message: SessionMessage) => void): () => void {
    this.listeners.add(handler);
    return () => {
      this.listeners.delete(handler);
    };
  }

  public getSourceId(): string {
    return this.sourceId;
  }

  public getSessionId(): string | null {
    return this.sessionId;
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }

  public handleIncomingMessage(message: SessionMessage): void {
    if (!message || typeof message !== 'object') return;

    // Loop prevention: Discard messages emitted by our own tab/instance
    if (message.sourceId === this.sourceId) {
      return;
    }

    // Session isolation check
    if (message.sessionId !== this.sessionId) {
      return;
    }

    // Dispatch to registered subscribers
    for (const listener of this.listeners) {
      try {
        listener(message);
      } catch (err) {
        console.error('[SessionTransport] Error inside subscriber handler:', err);
      }
    }
  }

  private handleChannelMessage(event: MessageEvent<SessionMessage>): void {
    this.handleIncomingMessage(event.data);
  }
}

// Global transport singleton instance for convenient default demo wiring
export const defaultSessionTransport = new LocalBroadcastTransport('ocean-client');
