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

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'waiter'
  });
  const [loading, setLoading] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
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
        minHeight: '100vh',
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
          top: '2.5rem',
          left: '3rem',
          zIndex: 2,
          maxWidth: '480px',
        }}
      >
        <h1
          style={{
            fontSize: '2.6rem',
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
            marginTop: '0.6rem',
            fontSize: '1.05rem',
            lineHeight: 1.5,
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
            margin: '1.4rem 0 0 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.7rem',
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
                fontSize: '0.95rem',
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
          minHeight: '100vh',
          padding: '2rem 5rem 2rem 1rem',
        }}
      >
        <div
          style={{
            background: 'rgba(88, 209, 179, 0.22)', // mint green, transparent glass panel
            backdropFilter: 'blur(14px)',
            padding: '2.5rem',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            width: '100%',
            maxWidth: '460px',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.6rem', color: '#F2FCFA', margin: 0, textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>RestaurantOS</h2>
            <p style={{ color: '#DDF7F1', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>Create your account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#F2FCFA', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
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
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#F2FCFA', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
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
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#F2FCFA', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                Password
              </label>
              <input
                type="password"
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
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#F2FCFA', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                Confirm Password
              </label>
              <input
                type="password"
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
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#F2FCFA', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
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
                }}
              >
                <option value="waiter">Waiter</option>
                <option value="chef">Chef</option>
                <option value="cashier">Cashier</option>
                <option value="manager">Manager</option>
                <option value="owner">Owner</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.8rem',
                fontSize: '1rem',
                background: '#58D1B3', // mint green accent
                color: '#183430',
                border: 'none',
              }}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#DDF7F1', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
            Already have an account? <Link to="/login" style={{ color: '#F2FCFA', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;