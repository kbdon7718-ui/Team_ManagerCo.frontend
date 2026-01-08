import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { fetchUsers } from '../api/client';
import { useAuth } from '../state/AuthContext';

import Card from '../ui/Card';
import Button from '../ui/Button';
import Select from '../ui/Select';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/timer', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError('');
        setLoading(true);
        const list = await fetchUsers();
        if (cancelled) return;
        setUsers(list);
      } catch (e) {
        if (cancelled) return;
        setError(e.message || 'Failed to load users');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const options = useMemo(() => {
    return users.map((u) => ({ value: String(u.id), label: u.name }));
  }, [users]);

  return (
    <div className="authPage">
      <Card title="Login">
        <div className="stack">
          <div className="muted">Select your name to continue.</div>

          {error ? <div className="alert">{error}</div> : null}

          <Select
            value={selectedUserId}
            onChange={setSelectedUserId}
            options={options}
            placeholder={loading ? 'Loading users…' : 'Choose your name'}
          />

          <Button
            disabled={!selectedUserId || loading}
            onClick={() => {
              const found = users.find((u) => String(u.id) === String(selectedUserId));
              if (!found) return;
              login({ id: found.id, name: found.name });
              navigate('/timer', { replace: true });
            }}
          >
            Continue
          </Button>
        </div>
      </Card>
    </div>
  );
}
