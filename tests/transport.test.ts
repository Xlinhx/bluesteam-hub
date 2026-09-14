import { describe, it, expect } from 'vitest';
import { LocalBroadcastTransport } from '../src/demo/session-transport/transport';
import { SessionMessage } from '../src/domain/session/types';

describe('LocalBroadcastTransport & Loop Prevention', () => {
  it('should initialize with a unique sourceId and disconnected state', () => {
    const transport = new LocalBroadcastTransport('test-tab');
    expect(transport.getSourceId()).toContain('test-tab');
    expect(transport.getSessionId()).toBeNull();
  });

  it('should connect to a designated sessionId', () => {
    const transport = new LocalBroadcastTransport('teacher');
    transport.connect('session-101');
    expect(transport.getSessionId()).toBe('session-101');
  });

  it('should disconnect cleanly', () => {
    const transport = new LocalBroadcastTransport('teacher');
    transport.connect('session-101');
    transport.disconnect();
    expect(transport.getSessionId()).toBeNull();
  });

  it('should enforce loop prevention: ignore incoming messages with own sourceId', () => {
    const transport = new LocalBroadcastTransport('client-a');
    transport.connect('room-alpha');

    let receivedCount = 0;
    transport.subscribe(() => {
      receivedCount++;
    });

    // Simulate an incoming channel message created by client-a itself
    const selfMessage: SessionMessage = {
      eventId: 'evt-1',
      sourceId: transport.getSourceId(), // Identical to own sourceId!
      sessionId: 'room-alpha',
      timestamp: Date.now(),
      version: 1,
      type: 'SIM_COMMAND',
      payload: { depth: 500 },
    };

    transport.handleIncomingMessage(selfMessage);

    // Should have discarded its own message!
    expect(receivedCount).toBe(0);
  });

  it('should accept messages from a different sourceId in the same session', () => {
    const transport = new LocalBroadcastTransport('client-b');
    transport.connect('room-alpha');

    let receivedPayload: unknown = null;
    transport.subscribe((msg) => {
      receivedPayload = msg.payload;
    });

    // Simulate incoming message from teacher
    const foreignMessage: SessionMessage = {
      eventId: 'evt-2',
      sourceId: 'teacher-console-99',
      sessionId: 'room-alpha',
      timestamp: Date.now(),
      version: 1,
      type: 'EXPERIENCE_CHANGED',
      payload: { experienceId: 'exp-sim-sediment-terraces' },
    };

    transport.handleIncomingMessage(foreignMessage);

    expect(receivedPayload).toEqual({ experienceId: 'exp-sim-sediment-terraces' });
  });

  it('should discard messages addressed to a different sessionId', () => {
    const transport = new LocalBroadcastTransport('client-c');
    transport.connect('room-alpha');

    let received = false;
    transport.subscribe(() => {
      received = true;
    });

    // Message meant for room-beta
    const wrongRoomMessage: SessionMessage = {
      eventId: 'evt-3',
      sourceId: 'other-source',
      sessionId: 'room-beta',
      timestamp: Date.now(),
      version: 1,
      type: 'SIM_COMMAND',
      payload: {},
    };

    transport.handleIncomingMessage(wrongRoomMessage);

    expect(received).toBe(false);
  });
});
