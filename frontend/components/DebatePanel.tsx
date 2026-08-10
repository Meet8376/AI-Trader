'use client';

import React, { useState } from 'react';
import { AgentOpinion, DebateVerdict } from '../types/debate';
import { TradingMode } from '../types/stock';
import { ShieldCheck, MessageSquare, Award, ArrowUpRight, ArrowDownRight, Scale, ChevronDown, ChevronUp } from 'lucide-react';

interface DebatePanelProps {
  ticker: string;
  mode: TradingMode;
  opinions: AgentOpinion[];
  verdict: DebateVerdict | null;
  isDebating: boolean;
  onRunDebate: () => void;
}

export const DebatePanel: React.FC<DebatePanelProps> = ({
  ticker,
  mode,
  opinions,
  verdict,
  isDebating,
  onRunDebate
}) => {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const currencySymbol = ticker.match(/^(NVDA|AAPL|MSFT|GOOGL|AMZN|META|TSLA|AMD|NFLX|JPM)$/) ? '$' : '₹';

  const toggleExpand = (agentId: string) => {
    setExpandedAgent(expandedAgent === agentId ? null : agentId);
  };

  return (
    <aside className="card debate-panel-container" style={{ height: '100%' }}>
      {/* Panel Header */}
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={16} color="var(--accent-purple)" />
          AI Debate Floor (Gemini 1.5)
        </div>
        <span className="badge bg-purple-badge" style={{ fontSize: '0.7rem' }}>
          {mode.toUpperCase()}
        </span>
      </div>

      {/* Main Debate Transcript */}
      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* If no debate run yet */}
        {opinions.length === 0 && !isDebating && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--text-secondary)'
          }}>
            <Scale size={36} color="var(--accent-purple)" style={{ marginBottom: '12px' }} />
            <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px' }}>No Active Debate for {ticker}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Click below to trigger multi-agent debate (Technical, Fundamental, Bull & Bear agents).
            </div>
            <button className="btn btn-primary" onClick={onRunDebate}>
              Run AI Debate
            </button>
          </div>
        )}

        {/* Loading Spinner during debate streaming */}
        {isDebating && (
          <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--accent-blue)' }}>
            <div className="mono" style={{ fontSize: '0.85rem', marginBottom: '10px', fontWeight: 600 }}>
              🤖 Gemini Agents Analyzing {ticker} ({mode.toUpperCase()})...
            </div>
            <div style={{
              width: '100%',
              height: '4px',
              background: 'var(--bg-tertiary)',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '60%',
                height: '100%',
                background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-purple))',
                animation: 'pulse 1s infinite'
              }} />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              Consulting Technical, Fundamental, Bull, and Bear models...
            </div>
          </div>
        )}

        {/* Agent Argument Feed */}
        {opinions.map((agent) => {
          const isBull = agent.signal === 'BUY';
          const isBear = agent.signal === 'SELL';
          const isExpanded = expandedAgent === agent.agent_id;

          return (
            <div
              key={agent.agent_id}
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                fontSize: '0.8rem',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Agent Title Line */}
              <div
                onClick={() => toggleExpand(agent.agent_id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                  <span style={{ fontSize: '1.1rem' }}>{agent.avatar}</span>
                  <span>{agent.agent_name}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({agent.role})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`badge ${isBull ? 'bg-green-badge' : isBear ? 'bg-red-badge' : 'bg-blue-badge'}`}>
                    {agent.signal} ({agent.confidence}%)
                  </span>
                  {isExpanded ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
                </div>
              </div>

              {/* Key Bullet Points */}
              <ul style={{ paddingLeft: '16px', margin: '6px 0 6px 0', color: 'var(--text-secondary)' }}>
                {agent.key_points.map((pt, idx) => (
                  <li key={idx} style={{ marginBottom: '2px', lineHeight: 1.3 }}>{pt}</li>
                ))}
              </ul>

              {/* Expandable full argument text */}
              {isExpanded && agent.full_argument && (
                <div style={{
                  background: 'var(--bg-tertiary)',
                  padding: '8px 10px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  color: 'var(--text-primary)',
                  marginTop: '6px',
                  lineHeight: 1.4,
                  borderLeft: '2px solid var(--accent-purple)'
                }}>
                  {agent.full_argument}
                </div>
              )}

              {/* Technical Targets */}
              {agent.technical_targets && (
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  background: 'var(--bg-tertiary)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  marginTop: '6px'
                }}>
                  <div>Target: <span className="mono text-green">{currencySymbol}{agent.technical_targets.target_1}</span></div>
                  <div>Stop Loss: <span className="mono text-red">{currencySymbol}{agent.technical_targets.stop_loss}</span></div>
                </div>
              )}
            </div>
          );
        })}

        {/* Final CIO Verdict Display */}
        {verdict && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(41, 121, 255, 0.15), rgba(124, 77, 255, 0.15))',
            border: '1px solid var(--accent-blue)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            marginTop: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.9rem' }}>
                <Award size={18} color="var(--accent-gold)" />
                CIO Verdict: <span className={verdict.verdict === 'BUY' ? 'text-green' : 'text-red'}>{verdict.verdict}</span>
              </div>
              <span className="badge bg-green-badge">
                {verdict.confidence}% Conviction
              </span>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.4 }}>
              {verdict.summary}
            </div>

            {/* Target & SL Box */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              background: 'var(--bg-primary)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem'
            }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Price Target</div>
                <div className="mono text-green" style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                  <ArrowUpRight size={14} /> {currencySymbol}{verdict.target_price}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Stop Loss</div>
                <div className="mono text-red" style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                  <ArrowDownRight size={14} /> {currencySymbol}{verdict.stop_loss}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
