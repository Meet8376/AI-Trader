'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  TrendingUp, 
  BarChart2, 
  Star, 
  Briefcase, 
  Filter, 
  Globe, 
  Newspaper, 
  Search, 
  Zap, 
  Clock 
} from 'lucide-react';
import { useTraderStore } from '../store/useTraderStore';
import { TradingMode } from '../types/stock';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const selectedTicker = useTraderStore((state) => state.selectedTicker);
  const tradingMode = useTraderStore((state) => state.tradingMode);
  const setTradingMode = useTraderStore((state) => state.setTradingMode);
  const setSearchModalOpen = useTraderStore((state) => state.setSearchModalOpen);
  const cashBalance = useTraderStore((state) => state.cashBalance);

  const [isMarketOpen, setIsMarketOpen] = useState(true);

  // Check IST Indian Exchange Hours (9:15 AM - 3:30 PM Mon-Fri)
  useEffect(() => {
    const checkMarketStatus = () => {
      const now = new Date();
      // UTC to IST (+5:30)
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istDate = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + istOffset);
      const day = istDate.getDay();
      const hours = istDate.getHours();
      const minutes = istDate.getMinutes();
      const totalMinutes = hours * 60 + minutes;

      const isWeekday = day >= 1 && day <= 5;
      const isOpenTime = totalMinutes >= (9 * 60 + 15) && totalMinutes <= (15 * 60 + 30);
      setIsMarketOpen(isWeekday && isOpenTime);
    };

    checkMarketStatus();
    const interval = setInterval(checkMarketStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { label: 'Overview', href: '/', icon: Globe },
    { label: 'Chart', href: `/chart/${selectedTicker}`, icon: BarChart2 },
    { label: 'Watchlist', href: '/watchlist', icon: Star },
    { label: 'Portfolio', href: '/portfolio', icon: Briefcase },
    { label: 'Screener', href: '/screener', icon: Filter },
    { label: 'Market', href: '/market', icon: TrendingUp },
    { label: 'News', href: '/news', icon: Newspaper },
  ];

  return (
    <nav className="navbar-container">
      {/* Brand & Market Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/" className="nav-brand">
          <TrendingUp style={{ color: 'var(--accent-blue)' }} size={24} />
          <span>AI-TRADER</span>
          <span className="nav-brand-badge">NSE / BSE</span>
        </Link>

        {/* Live Market Indicator */}
        <div className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="pulse-dot" />
          <span>{isMarketOpen ? 'NSE OPEN' : 'NSE CLOSED'}</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="nav-links">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.label === 'Chart' && pathname.startsWith('/chart/'));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Right Tools: Search Bar, Mode Switcher, Cash Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Quick Search Button */}
        <button
          onClick={() => setSearchModalOpen(true)}
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-full)',
            padding: '6px 14px',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-blue)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
        >
          <Search size={14} />
          <span>Search stocks...</span>
          <kbd style={{
            background: 'var(--bg-elevated)',
            padding: '1px 5px',
            borderRadius: '4px',
            fontSize: '0.68rem',
            color: 'var(--text-muted)'
          }}>
            Ctrl+K
          </kbd>
        </button>

        {/* Mode Selector Toggle */}
        <div style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-full)',
          padding: '2px',
          display: 'flex',
          gap: '2px'
        }}>
          <button
            onClick={() => setTradingMode('intraday')}
            style={{
              background: tradingMode === 'intraday' ? 'var(--accent-blue)' : 'transparent',
              color: tradingMode === 'intraday' ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              padding: '4px 10px',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease'
            }}
          >
            <Zap size={12} /> Intraday
          </button>
          <button
            onClick={() => setTradingMode('long-term')}
            style={{
              background: tradingMode === 'long-term' ? 'var(--accent-purple)' : 'transparent',
              color: tradingMode === 'long-term' ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              padding: '4px 10px',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease'
            }}
          >
            <Clock size={12} /> Swing / Long
          </button>
        </div>

        {/* Paper Cash Pill */}
        <Link
          href="/portfolio"
          style={{
            textDecoration: 'none',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-full)',
            padding: '4px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem'
          }}
        >
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Cash:</span>
          <span className="font-mono" style={{ fontWeight: 700, color: 'var(--accent-green-bright)' }}>
            ₹{cashBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
        </Link>
      </div>
    </nav>
  );
};
