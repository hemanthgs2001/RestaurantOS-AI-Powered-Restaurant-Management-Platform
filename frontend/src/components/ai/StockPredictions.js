import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiAlertCircle, FiClock, FiPackage, FiRefreshCw } from 'react-icons/fi';
import { getStockPredictions } from '../../api/aiApi';
import toast from 'react-hot-toast';

const StockPredictions = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getStockPredictions();
      setPredictions(response.data || []);
    } catch (error) {
      console.error('Failed to fetch stock predictions:', error);
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to fetch stock predictions';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (daysUntilShortage) => {
    if (daysUntilShortage <= 2) {
      return { label: 'Critical', className: 'badge-danger', icon: <FiAlertCircle /> };
    } else if (daysUntilShortage <= 5) {
      return { label: 'Warning', className: 'badge-warning', icon: <FiClock /> };
    } else {
      return { label: 'Normal', className: 'badge-success', icon: <FiPackage /> };
    }
  };

  const getFilteredPredictions = () => {
    if (filter === 'all') return predictions;
    if (filter === 'critical') return predictions.filter(p => p.daysUntilShortage <= 2);
    if (filter === 'warning') return predictions.filter(p => p.daysUntilShortage > 2 && p.daysUntilShortage <= 5);
    if (filter === 'normal') return predictions.filter(p => p.daysUntilShortage > 5);
    return predictions;
  };

  const getSummaryStats = () => {
    const total = predictions.length;
    const critical = predictions.filter(p => p.daysUntilShortage <= 2).length;
    const warning = predictions.filter(p => p.daysUntilShortage > 2 && p.daysUntilShortage <= 5).length;
    const normal = predictions.filter(p => p.daysUntilShortage > 5).length;
    return { total, critical, warning, normal };
  };

  const stats = getSummaryStats();
  const filteredPredictions = getFilteredPredictions();

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '400px', flexDirection: 'column' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #E5E7EB',
          borderTop: '3px solid #4F46E5',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginTop: '1rem', color: '#6B7280' }}>Loading stock predictions...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Stock Predictions</h1>
          <p style={{ color: '#6B7280' }}>AI-powered stock shortage predictions</p>
        </div>
        <button className="btn btn-primary" onClick={fetchPredictions}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {error && (
        <div className="card" style={{ 
          background: '#FEF2F2', 
          borderLeft: '4px solid #EF4444',
          marginBottom: '1.5rem',
          padding: '1rem'
        }}>
          <p style={{ color: '#991B1B' }}>
            <strong>⚠️ Error:</strong> {error}
          </p>
          <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Showing mock data for demonstration purposes.
          </p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiPackage size={20} color="#4F46E5" />
            <h4 style={{ color: '#6B7280' }}>Total Items</h4>
          </div>
          <h2 style={{ marginTop: '0.5rem' }}>{stats.total}</h2>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #EF4444' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiAlertCircle size={20} color="#EF4444" />
            <h4 style={{ color: '#6B7280' }}>Critical</h4>
          </div>
          <h2 style={{ marginTop: '0.5rem', color: '#EF4444' }}>{stats.critical}</h2>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #F59E0B' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiClock size={20} color="#F59E0B" />
            <h4 style={{ color: '#6B7280' }}>Warning</h4>
          </div>
          <h2 style={{ marginTop: '0.5rem', color: '#F59E0B' }}>{stats.warning}</h2>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #10B981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiTrendingUp size={20} color="#10B981" />
            <h4 style={{ color: '#6B7280' }}>Normal</h4>
          </div>
          <h2 style={{ marginTop: '0.5rem', color: '#10B981' }}>{stats.normal}</h2>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilter('all')}
        >
          All ({stats.total})
        </button>
        <button
          className={`btn ${filter === 'critical' ? 'btn-danger' : 'btn-secondary'}`}
          onClick={() => setFilter('critical')}
        >
          Critical ({stats.critical})
        </button>
        <button
          className={`btn ${filter === 'warning' ? 'btn-warning' : 'btn-secondary'}`}
          onClick={() => setFilter('warning')}
        >
          Warning ({stats.warning})
        </button>
        <button
          className={`btn ${filter === 'normal' ? 'btn-success' : 'btn-secondary'}`}
          onClick={() => setFilter('normal')}
        >
          Normal ({stats.normal})
        </button>
      </div>

      {/* Predictions List */}
      <div className="grid-3">
        {filteredPredictions.map((prediction, index) => {
          const status = getStatusBadge(prediction.daysUntilShortage);
          const isShortage = prediction.daysUntilShortage <= 2;
          const isWarning = prediction.daysUntilShortage > 2 && prediction.daysUntilShortage <= 5;

          return (
            <div
              key={index}
              className="card"
              style={{
                borderLeft: `4px solid ${
                  isShortage ? '#EF4444' : isWarning ? '#F59E0B' : '#10B981'
                }`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ marginBottom: '0.25rem' }}>{prediction.ingredient}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`badge ${status.className}`}>
                      {status.icon} {status.label}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                    Current Stock
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                    {prediction.currentStock} units
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#6B7280' }}>Predicted Demand</span>
                  <span><strong>{prediction.predictedDemand} units</strong></span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#6B7280' }}>Days Until Shortage</span>
                  <span>
                    <strong style={{ color: isShortage ? '#EF4444' : isWarning ? '#F59E0B' : '#10B981' }}>
                      {prediction.daysUntilShortage} days
                    </strong>
                  </span>
                </div>
                <div style={{ 
                  marginTop: '0.5rem',
                  padding: '0.5rem',
                  background: '#F9FAFB',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}>
                  <span style={{ color: '#4F46E5' }}>💡 {prediction.recommendation}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ marginTop: '1rem' }}>
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: '#E5E7EB',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${Math.min((prediction.currentStock / prediction.predictedDemand) * 100, 100)}%`,
                    height: '100%',
                    background: isShortage ? '#EF4444' : isWarning ? '#F59E0B' : '#10B981',
                    borderRadius: '3px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginTop: '0.25rem',
                  fontSize: '0.75rem',
                  color: '#6B7280'
                }}>
                  <span>Stock Level</span>
                  <span>
                    {Math.round((prediction.currentStock / prediction.predictedDemand) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPredictions.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <FiPackage size={48} color="#9CA3AF" />
          <h3 style={{ marginTop: '1rem', color: '#6B7280' }}>No predictions found</h3>
          <p style={{ color: '#9CA3AF' }}>No stock predictions available for the selected filter</p>
        </div>
      )}

      {/* AI Insights */}
      {predictions.length > 0 && (
        <div className="card" style={{ marginTop: '2rem', background: '#F0F4FF' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiTrendingUp /> AI Insights
          </h3>
          <div className="grid-2">
            <div>
              <h4 style={{ color: '#4F46E5', marginBottom: '0.5rem' }}>Top Recommendations</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {predictions
                  .filter(p => p.daysUntilShortage <= 5)
                  .slice(0, 3)
                  .map((p, idx) => (
                    <li key={idx} style={{
                      padding: '0.5rem',
                      borderBottom: '1px solid #E5E7EB',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span>{p.ingredient}</span>
                      <span style={{ color: '#4F46E5' }}>{p.recommendation}</span>
                    </li>
                  ))}
              </ul>
            </div>
            <div>
              <h4 style={{ color: '#10B981', marginBottom: '0.5rem' }}>Well Stocked Items</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {predictions
                  .filter(p => p.daysUntilShortage > 10)
                  .slice(0, 3)
                  .map((p, idx) => (
                    <li key={idx} style={{
                      padding: '0.5rem',
                      borderBottom: '1px solid #E5E7EB',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span>{p.ingredient}</span>
                      <span style={{ color: '#10B981' }}>
                        {p.daysUntilShortage} days remaining
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockPredictions;