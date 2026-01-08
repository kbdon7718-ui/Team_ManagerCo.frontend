import React from 'react';
import { Link } from 'react-router-dom';

import Card from '../ui/Card';

export default function NotFoundPage() {
  return (
    <div className="authPage">
      <Card title="Not Found">
        <div className="stack">
          <div className="muted">The page you’re looking for doesn’t exist.</div>
          <Link className="link" to="/timer">
            Go to Timer
          </Link>
        </div>
      </Card>
    </div>
  );
}
