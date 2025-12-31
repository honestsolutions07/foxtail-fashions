'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [userCoins, setUserCoins] = useState(0);
  const { user, loading, signOut } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load cart count from localStorage
  useEffect(() => {
    const loadCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const count = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
      setCartCount(count);
    };
    loadCartCount();

    // Listen for storage changes
    window.addEventListener('storage', loadCartCount);
    // Also listen for custom cart update event
    window.addEventListener('cartUpdated', loadCartCount);
    return () => {
      window.removeEventListener('storage', loadCartCount);
      window.removeEventListener('cartUpdated', loadCartCount);
    };
  }, []);

  // Fetch user's Fox Coins
  useEffect(() => {
    if (user) {
      fetchUserCoins();
    } else {
      setUserCoins(0);
    }
  }, [user]);

  const fetchUserCoins = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase
        .from('profiles')
        .select('fox_coins')
        .eq('id', user?.id);

      // Check if we got data (array) and it has at least one item
      if (!error && data && data.length > 0) {
        setUserCoins(data[0].fox_coins || 0);
      }
    } catch (error) {
      console.error('Error fetching coins:', error);
    }
  };



  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsUserDropdownOpen(false);
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid #f3f4f6'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
          <Image
            src="/logo.png"
            alt="Foxtail Fashions Logo"
            width={20}
            height={20}
            style={{ objectFit: 'contain' }}
          />
          <span style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px' }}>Foxtail Fashions</span>
        </Link>

        {/* Desktop Navigation */}
        {/* <nav style={{ display: 'none', alignItems: 'center', gap: '32px' }} className="desktop-nav">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#4b5563',
                textDecoration: 'none',
                transition: 'color 0.3s ease'
              }}
            >
              {link.name}
            </Link>
          ))}
        </nav> */}

        {/* Right Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Search */}
          {/* <button style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button> */}

          {/* User Menu */}
          {!loading && (
            <div className="user-menu" ref={dropdownRef}>
              {user ? (
                <>
                  <button
                    className="user-avatar-btn"
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  >
                    <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>

                  {isUserDropdownOpen && (
                    <div className="user-dropdown">
                      <div className="user-dropdown-header">
                        <strong>{user.user_metadata?.full_name || 'User'}</strong>
                        <span>{user.email}</span>
                      </div>

                      {/* Fox Coins Balance */}
                      <div className="user-dropdown-coins">
                        <span className="coins-icon">🦊</span>
                        <span className="coins-amount">{userCoins} Fox Coins</span>
                      </div>

                      <Link href="/orders" className="user-dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>
                        📦 My Orders
                      </Link>
                      <Link href="/wishlist" className="user-dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>
                        ❤️ Wishlist
                      </Link>
                      <button className="user-dropdown-item logout" onClick={handleSignOut}>
                        🚪 Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link href="/login" style={{
                  padding: '10px 20px',
                  background: '#0f172a',
                  color: 'white',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Login
                </Link>
              )}
            </div>
          )}

          {/* Cart */}
          <Link href="/cart" style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <svg style={{ width: '20px', height: '20px', color: '#0f172a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '0',
                right: '0',
                width: '18px',
                height: '18px',
                background: '#c8ff00',
                borderRadius: '50%',
                fontSize: '11px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0f172a'
              }}>{cartCount}</span>
            )}
          </Link>

          {/* Mobile Menu Button */}
          {/* <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            className="mobile-menu-btn"
          >
            <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button> */}
        </div>
      </div>

      {/* Mobile Menu
      {isMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'white',
          borderBottom: '1px solid #f3f4f6',
          padding: '16px'
        }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                style={{
                  padding: '12px 16px',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#1f2937',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  transition: 'background 0.2s'
                }}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      )} */}
    </header>
  );
};

export default Header;
