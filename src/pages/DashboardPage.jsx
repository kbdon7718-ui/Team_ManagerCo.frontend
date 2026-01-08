import React, { useEffect, useMemo, useState } from 'react';

import Card from '../ui/Card';
import Input from '../ui/Input';

import { fetchAnalyticsSummary, fetchDashboardSummary } from '../api/client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

function asNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatMinutes(minutes) {
  const m = Math.max(0, Math.round(asNumber(minutes)));
  return `${m} min`;
}

function formatDateShort(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: '2-digit' });
}

const BAR_COLORS = ['#E63946', '#457B9D', '#A8DADC', '#F4A261', '#2A9D8F', '#8D99AE'];

export default function DashboardPage() {
  const [summary, setSummary] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filter, setFilter] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError('');
        const [s, a] = await Promise.all([fetchDashboardSummary(), fetchAnalyticsSummary()]);
        if (cancelled) return;
        setSummary(s);
        setAnalytics(a);
      } catch (e) {
        if (cancelled) return;
        setError(e.message || 'Failed to load dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return summary;
    return summary.filter((r) => String(r.name).toLowerCase().includes(q));
  }, [summary, filter]);

  const totalToday = useMemo(() => {
    return summary.reduce((acc, r) => acc + asNumber(r.total_today_minutes), 0);
  }, [summary]);

  const totalAllTime = useMemo(() => {
    return summary.reduce((acc, r) => acc + asNumber(r.total_all_time_minutes), 0);
  }, [summary]);

  const weeklyByDayData = useMemo(() => {
    const rows = analytics?.last7DaysByDay || [];
    return rows.map((r) => ({
      date: r.date,
      label: formatDateShort(r.date),
      minutes: asNumber(r.minutes)
    }));
  }, [analytics]);

  const todayByHourData = useMemo(() => {
    const rows = analytics?.todayByHour || [];
    const map = new Map(rows.map((r) => [Number(r.hour), r.minutes || 0]));

    const data = [];
    for (let h = 0; h < 24; h += 1) {
      data.push({
        hour: String(h).padStart(2, '0'),
        minutes: asNumber(map.get(h) || 0)
      });
    }
    return data;
  }, [analytics]);

  const weekMinutesByUserId = useMemo(() => {
    const map = new Map();
    const rows = analytics?.last7DaysByUser || [];
    for (const r of rows) {
      map.set(String(r.user_id), asNumber(r.minutes));
    }
    return map;
  }, [analytics]);

  const leaderboardAll = useMemo(() => {
    const rows = (summary || []).map((r) => {
      const weekMinutes = weekMinutesByUserId.get(String(r.user_id)) ?? 0;
      return {
        user_id: r.user_id,
        name: r.name,
        today_minutes: asNumber(r.total_today_minutes),
        week_minutes: asNumber(weekMinutes),
        all_time_minutes: asNumber(r.total_all_time_minutes)
      };
    });

    rows.sort((a, b) => {
      if (b.today_minutes !== a.today_minutes) return b.today_minutes - a.today_minutes;
      if (b.week_minutes !== a.week_minutes) return b.week_minutes - a.week_minutes;
      return String(a.name).localeCompare(String(b.name));
    });

    return rows.map((r, idx) => ({ ...r, rank_today: idx + 1 }));
  }, [summary, weekMinutesByUserId]);

  const leaderboardFiltered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return leaderboardAll;
    return leaderboardAll.filter((r) => String(r.name).toLowerCase().includes(q));
  }, [leaderboardAll, filter]);

  const leaderToday = useMemo(() => {
    const first = leaderboardAll[0] || null;
    if (!first) return null;
    if ((first.today_minutes || 0) <= 0) return null;
    return first;
  }, [leaderboardAll]);

  const comparisonWeekData = useMemo(() => {
    return [...leaderboardAll]
      .sort((a, b) => b.week_minutes - a.week_minutes)
      .map((r) => ({
        name: r.name,
        minutes: r.week_minutes
      }));
  }, [leaderboardAll]);

  return (
    <div className="page">
      <div className="stack">
        <div className="pageHeader">
          <div>
            <div className="pageTitle">Admin Dashboard</div>
            <div className="muted">Competition view (minutes): compare everyone and see who’s leading.</div>
          </div>
        </div>

        {error ? <div className="alert">{error}</div> : null}

        <div className="grid3">
          <Card title="Total Today (All Members)">
            <div className="kpiBig">{formatMinutes(totalToday)}</div>
          </Card>
          <Card title="Current Leader (Today)">
            <div className="kpiBig">{leaderToday ? leaderToday.name : '—'}</div>
            <div className="muted">{leaderToday ? formatMinutes(leaderToday.today_minutes) : 'No data yet'}</div>
          </Card>
          <Card title="Filter Users">
            <Input value={filter} onChange={setFilter} placeholder="Type a name…" />
          </Card>
        </div>

        <Card title="Leaderboard (Today)">
          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User</th>
                  <th>Today (min)</th>
                  <th>Last 7 Days (min)</th>
                  <th>All time (min)</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="muted">
                      Loading…
                    </td>
                  </tr>
                ) : leaderboardFiltered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="muted">
                      No matching users
                    </td>
                  </tr>
                ) : (
                  leaderboardFiltered.map((r) => (
                    <tr key={r.user_id}>
                      <td>{r.rank_today}</td>
                      <td>{r.name}</td>
                      <td>{r.today_minutes}</td>
                      <td>{r.week_minutes}</td>
                      <td>{r.all_time_minutes}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid2">
          <Card title="Weekly Work Time (Last 7 Days) — Total Minutes">
            <div className="chart">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={weeklyByDayData}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.7)' }} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.7)' }} />
                  <Tooltip contentStyle={{ background: '#0B1B31', border: '1px solid rgba(255,255,255,0.12)' }} />
                  <Legend />
                  <Bar dataKey="minutes" name="Minutes" fill="#E63946" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Daily Distribution (Today) — Minutes by Start Hour">
            <div className="chart">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={todayByHourData}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="hour" tick={{ fill: 'rgba(255,255,255,0.7)' }} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.7)' }} />
                  <Tooltip contentStyle={{ background: '#0B1B31', border: '1px solid rgba(255,255,255,0.12)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="minutes" name="Minutes" stroke="#457B9D" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card title="Competition Comparison (Last 7 Days) — Minutes per Member">
          <div className="chart">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={comparisonWeekData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.7)' }} />
                <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(255,255,255,0.7)' }} width={90} />
                <Tooltip contentStyle={{ background: '#0B1B31', border: '1px solid rgba(255,255,255,0.12)' }} />
                <Legend />
                <Bar dataKey="minutes" name="Minutes" radius={[0, 10, 10, 0]}>
                  {comparisonWeekData.map((entry, index) => (
                    <Cell key={`cell-${entry.name}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {comparisonWeekData.length === 0 ? <div className="muted">No completed sessions in last 7 days.</div> : null}
          </div>
        </Card>

        <Card title="All Time Total (All Members)">
          <div className="kpiBig">{formatMinutes(totalAllTime)}</div>
        </Card>
      </div>
    </div>
  );
}
