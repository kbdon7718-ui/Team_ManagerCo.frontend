import React, { useEffect, useMemo, useState } from 'react';

import Card from '../ui/Card';
import Button from '../ui/Button';

import { endWork, getActiveSession, startWork } from '../api/client';
import { useAuth } from '../state/AuthContext';

function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  const hh = String(hours).padStart(2, '0');
  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

export default function TimerPage() {
  const { user } = useAuth();

  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError('');
        setLoading(true);
        const data = await getActiveSession(user.id);
        if (cancelled) return;
        setActiveSession(data.session);
      } catch (e) {
        if (cancelled) return;
        setError(e.message || 'Failed to load active session');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  const isActive = Boolean(activeSession && !activeSession.end_time);

  const elapsedSeconds = useMemo(() => {
    if (!isActive) return 0;
    const start = new Date(activeSession.start_time);
    const now = new Date();
    return (now.getTime() - start.getTime()) / 1000;
  }, [isActive, activeSession, tick]);

  async function onStart() {
    try {
      setError('');
      setActionLoading(true);
      const session = await startWork(user.id);
      setActiveSession(session);
    } catch (e) {
      setError(e.message || 'Failed to start work');
    } finally {
      setActionLoading(false);
    }
  }

  async function onEnd() {
    try {
      setError('');
      setActionLoading(true);
      const session = await endWork(user.id);
      setActiveSession(null);
      setError(`Saved. Total minutes: ${session.total_minutes}`);
    } catch (e) {
      setError(e.message || 'Failed to end work');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="grid2">
        <Card title="Work Timer">
          <div className="stack">
            <div className="kpiRow">
              <div>
                <div className="muted">Logged in as</div>
                <div className="kpiValue">{user.name}</div>
              </div>
              <div>
                <div className="muted">Status</div>
                <div className={isActive ? 'status status-active' : 'status'}>
                  {loading ? 'Loading…' : isActive ? 'Working' : 'Idle'}
                </div>
              </div>
            </div>

            {error ? <div className="alert">{error}</div> : null}

            <div className="timerDisplay">{isActive ? formatDuration(elapsedSeconds) : '00:00:00'}</div>

            <div className="row">
              {!isActive ? (
                <Button disabled={loading || actionLoading} onClick={onStart}>
                  Start Work
                </Button>
              ) : (
                <Button variant="danger" disabled={loading || actionLoading} onClick={onEnd}>
                  End Work
                </Button>
              )}
            </div>

            <div className="muted small">
              This app prevents overlapping sessions for the same user.
            </div>
          </div>
        </Card>

        <Card title="Tips">
          <div className="stack">
            <div className="muted">Best practices for accurate tracking:</div>
            <div className="list">
              <div className="listItem">Start work when you begin a focus block.</div>
              <div className="listItem">End work when you stop (break, meeting, end of day).</div>
              <div className="listItem">Use the Dashboard for weekly totals and trends.</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
