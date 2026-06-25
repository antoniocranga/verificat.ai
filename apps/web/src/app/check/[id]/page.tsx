'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { Verdict } from '@verificat/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://staging.verificat.xyz/api';

export default function CheckPage() {
  const params = useParams();
  const id = params.id as string;
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE}/fact-checks/verdicts/${id}`)
      .then((res) => {
        if (res.status === 404) throw new Error('Verdict negăsit sau privat');
        if (!res.ok) throw new Error('Eroare la încărcarea verdictului');
        return res.json() as Promise<Verdict>;
      })
      .then(setVerdict)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main style={{ padding: '40px 16px', maxWidth: 720, margin: '0 auto', background: '#fafafa', minHeight: '100vh', fontFamily: "'Geist Sans', Arial, sans-serif" }}>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: '#4d4d4d', margin: 0 }}>Se încarcă...</p>
      </main>
    );
  }

  if (error || !verdict) {
    return (
      <main style={{ padding: '40px 16px', maxWidth: 720, margin: '0 auto', background: '#fafafa', minHeight: '100vh', fontFamily: "'Geist Sans', Arial, sans-serif" }}>
        <h1 style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.4px', margin: '0 0 12px', color: '#171717' }}>
          {error || 'Verdict negăsit'}
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: '#4d4d4d', margin: 0 }}>Verdictul căutat nu există sau nu este accesibil public.</p>
      </main>
    );
  }

  return (
    <main style={{ padding: '40px 16px', maxWidth: 720, margin: '0 auto', background: '#fafafa', minHeight: '100vh', fontFamily: "'Geist Sans', Arial, sans-serif" }}>
      <h1 style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.4px', margin: '0 0 8px', color: '#171717' }}>
        Rezultat Verificare
      </h1>
      <p style={{ fontSize: 14, color: '#8f8f8f', margin: '0 0 24px' }}>
        ID sesiune: {verdict.sessionId}
      </p>

      <div style={{ background: '#ffffff', border: '1px solid #ebebeb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <div data-testid="verdict-label" style={{
          display: 'inline-block', border: '1px solid #ebebeb', borderRadius: 6,
          padding: '4px 10px', fontSize: 20, fontWeight: 600, color: '#171717',
          marginBottom: 8, letterSpacing: '-0.4px',
        }}>
          {verdict.label}
        </div>
        <div data-testid="verdict-confidence" style={{ fontSize: 14, color: '#4d4d4d', marginBottom: 16 }}>
          Nivel de încredere: {verdict.confidence} / 100
        </div>
        <div data-testid="verdict-explanation" style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 16, color: '#4d4d4d' }}>
          {verdict.explanation}
        </div>
        <div style={{ height: 4, borderRadius: 2, background: '#ebebeb', marginBottom: 16 }}>
          <div style={{ height: '100%', borderRadius: 2, background: '#171717', width: `${verdict.confidence}%` }} />
        </div>
      </div>

      {verdict.sources.length > 0 && (
        <div>
          <h2 style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.4px', margin: '0 0 12px', color: '#171717' }}>Surse</h2>
          {verdict.sources.map((source) => (
            <div key={source.id} data-testid="source-item" style={{
              background: '#ffffff', border: '1px solid #ebebeb', borderRadius: 12,
              padding: 16, marginBottom: 12,
            }}>
              <div style={{ fontWeight: 500, color: '#171717', marginBottom: 4 }}>{source.title}</div>
              <a href={source.url} target="_blank" rel="noopener" style={{ color: '#0070f3', fontSize: 13, textDecoration: 'none' }}>
                {source.url}
              </a>
              <div style={{ fontSize: 12, color: '#8f8f8f', marginTop: 4 }}>
                Scor de încredere: {source.trustScore} / 100
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
