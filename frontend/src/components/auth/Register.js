import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Rotating background images — swap these for your own restaurant/food assets
const BACKGROUND_IMAGES = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1517244683847-7456b63c5969?auto=format&fit=crop&w=1920&q=80',
];

const SLIDE_INTERVAL_MS = 4000;

// Simple inline eye / eye-off icons (no external icon lib needed)
const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.6 18.6 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'waiter',
    secretKey: ''
  });
  const [loading, setLoading] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Cycle through background images with a time gap
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setLoading(true);
    const result = await register(formData);
    setLoading(false);
    if (result.success) {
      navigate('/login');
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: '#2F4348',
      }}
    >
      <style>{`
        .themed-input::placeholder {
          color: #6B7F80;
          opacity: 1;
        }
      `}</style>

      {/* FULL-SCREEN ROTATING BACKGROUND */}
      {BACKGROUND_IMAGES.map((src, i) => (
        <div
          key={src}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url('${src}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: activeSlide === i ? 1 : 0,
            transition: 'opacity 1.5s ease-in-out',
          }}
        />
      ))}

      {/* Slate-toned overlay so text/card stay readable over any photo */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(24,34,37,0.55) 0%, rgba(24,34,37,0.35) 40%, rgba(24,34,37,0.78) 100%)',
        }}
      />

      {/* Slide position dots */}
      <div
        style={{
          position: 'absolute',
          bottom: '1.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '0.5rem',
          zIndex: 2,
        }}
      >
        {BACKGROUND_IMAGES.map((_, i) => (
          <span
            key={i}
            style={{
              width: activeSlide === i ? '22px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: activeSlide === i ? '#58D1B3' : 'rgba(242,252,250,0.5)',
              transition: 'all 0.4s ease',
            }}
          />
        ))}
      </div>

      {/* BRAND DETAILS — top-left of screen */}
      <div
        style={{
          position: 'absolute',
          top: '2rem',
          left: '3rem',
          zIndex: 2,
          maxWidth: '480px',
        }}
      >
        <h1
          style={{
            fontSize: '2.4rem',
            color: '#F2FCFA',
            margin: 0,
            letterSpacing: '1px',
            textShadow: '0 2px 12px rgba(0,0,0,0.5)',
          }}
        >
          RestaurantOS
        </h1>
        <p
          style={{
            color: '#DDF7F1',
            marginTop: '0.5rem',
            fontSize: '1rem',
            lineHeight: 1.45,
            textShadow: '0 1px 6px rgba(0,0,0,0.5)',
          }}
        >
          The all-in-one platform for running your restaurant — track orders in
          real time, manage your kitchen and staff, and keep every table
          running smoothly from a single dashboard.
        </p>

        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: '1.1rem 0 0 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.55rem',
          }}
        >
          {[
            'Live order tracking from kitchen to table',
            'Staff scheduling and role-based access',
            'Menu, inventory, and billing in one place',
            'Real-time sales and performance insights',
          ].map((item) => (
            <li
              key={item}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem',
                color: '#F2FCFA',
                fontSize: '0.9rem',
                textShadow: '0 1px 6px rgba(0,0,0,0.5)',
              }}
            >
              <span
                style={{
                  color: '#58D1B3',
                  fontWeight: 700,
                  lineHeight: 1.3,
                }}
              >
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* REGISTER CARD — right side */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          height: '100vh',
          padding: '1rem 5rem 1rem 1rem',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            background: 'rgba(88, 209, 179, 0.22)', // mint green, transparent glass panel
            backdropFilter: 'blur(14px)',
            padding: '1.5rem 2rem',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            width: '100%',
            maxWidth: '440px',
            maxHeight: '94vh',
            overflow: 'hidden',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.4rem', color: '#F2FCFA', margin: 0, textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>RestaurantOS</h2>
            <p style={{ color: '#DDF7F1', margin: '0.2rem 0 0 0', fontSize: '0.9rem', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>Create your account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '0.65rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.88rem', color: '#F2FCFA', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                Full Name
              </label>
              <input
                type="text"
                name="name"
                className="input themed-input"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                style={{
                  background: '#F2FCFA',
                  border: '1px solid rgba(47, 67, 72, 0.25)',
                  color: '#2F4348',
                  padding: '0.5rem 0.7rem',
                  fontSize: '0.9rem',
                  width: '100%',
                  boxSizing: 'border-box',
                  borderRadius: '6px',
                }}
              />
            </div>

            <div style={{ marginBottom: '0.65rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.88rem', color: '#F2FCFA', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                className="input themed-input"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                style={{
                  background: '#F2FCFA',
                  border: '1px solid rgba(47, 67, 72, 0.25)',
                  color: '#2F4348',
                  padding: '0.5rem 0.7rem',
                  fontSize: '0.9rem',
                  width: '100%',
                  boxSizing: 'border-box',
                  borderRadius: '6px',
                }}
              />
            </div>

            <div style={{ marginBottom: '0.65rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.88rem', color: '#F2FCFA', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="input themed-input"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  style={{
                    background: '#F2FCFA',
                    border: '1px solid rgba(47, 67, 72, 0.25)',
                    color: '#2F4348',
                    padding: '0.5rem 2.4rem 0.5rem 0.7rem',
                    fontSize: '0.9rem',
                    width: '100%',
                    boxSizing: 'border-box',
                    borderRadius: '6px',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '0.6rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: '#2F4348',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '0.65rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.88rem', color: '#F2FCFA', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className="input themed-input"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  style={{
                    background: '#F2FCFA',
                    border: '1px solid rgba(47, 67, 72, 0.25)',
                    color: '#2F4348',
                    padding: '0.5rem 2.4rem 0.5rem 0.7rem',
                    fontSize: '0.9rem',
                    width: '100%',
                    boxSizing: 'border-box',
                    borderRadius: '6px',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '0.6rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: '#2F4348',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '0.65rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.88rem', color: '#F2FCFA', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                Role
              </label>
              <select
                name="role"
                className="input themed-input"
                value={formData.role}
                onChange={handleChange}
                style={{
                  background: '#F2FCFA',
                  border: '1px solid rgba(47, 67, 72, 0.25)',
                  color: '#2F4348',
                  padding: '0.5rem 0.7rem',
                  fontSize: '0.9rem',
                  width: '100%',
                  boxSizing: 'border-box',
                  borderRadius: '6px',
                }}
              >
                <option value="waiter">Waiter</option>
                <option value="chef">Chef</option>
                <option value="cashier">Cashier</option>
                <option value="manager">Manager</option>
                <option value="owner">Owner</option>
              </select>
            </div>

            <div style={{ marginBottom: '0.9rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.88rem', color: '#F2FCFA', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                Secret Key
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showSecretKey ? 'text' : 'password'}
                  name="secretKey"
                  className="input themed-input"
                  value={formData.secretKey}
                  onChange={handleChange}
                  placeholder="Enter the registration secret key"
                  required
                  style={{
                    background: '#F2FCFA',
                    border: '1px solid rgba(47, 67, 72, 0.25)',
                    color: '#2F4348',
                    padding: '0.5rem 2.4rem 0.5rem 0.7rem',
                    fontSize: '0.9rem',
                    width: '100%',
                    boxSizing: 'border-box',
                    borderRadius: '6px',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowSecretKey((prev) => !prev)}
                  aria-label={showSecretKey ? 'Hide secret key' : 'Show secret key'}
                  style={{
                    position: 'absolute',
                    right: '0.6rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: '#2F4348',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showSecretKey ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <small style={{ color: '#DDF7F1', display: 'block', marginTop: '0.3rem', fontSize: '0.78rem' }}>
                Ask your Owner/Admin for this key. Without it, no account will be created.
              </small>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.65rem',
                fontSize: '0.95rem',
                background: '#58D1B3', // mint green accent
                color: '#183430',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '0.9rem', marginBottom: 0, fontSize: '0.85rem', color: '#DDF7F1', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
            Already have an account? <Link to="/login" style={{ color: '#F2FCFA', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;