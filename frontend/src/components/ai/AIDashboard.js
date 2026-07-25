import React, { useState, useEffect } from 'react';
import { getPredictions, getRecommendations } from '../../api/aiApi';
import { FiTrendingUp, FiAlertCircle, FiClock, FiDollarSign, FiPackage, FiMenu, FiThumbsUp, FiRefreshCw } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import StockPredictions from './StockPredictions';
import MenuRecommendations from './MenuRecommendations';
import toast from 'react-hot-toast';

const AIDashboard = () => {
  const [predictions, setPredictions] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAIData();
  }, []);

  const fetchAIData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [predRes, recRes] = await Promise.all([
        getPredictions(),
        getRecommendations()
      ]);
      setPredictions(predRes.data);
      setRecommendations(recRes.data);
    } catch (error) {
      console.error('Error fetching AI data:', error);
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to fetch AI data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
        <p style={{ marginTop: '1rem', color: '#6B7280' }}>Loading AI insights...</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div>
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

            {/* Overview Cards */}
            <div className="grid-4" style={{ marginBottom: '2rem' }}>
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <FiTrendingUp size={30} color="#4F46E5" />
                  <div>
                    <h4 style={{ color: '#6B7280' }}>Stock Predictions</h4>
                    <h3>{predictions?.stockPredictions?.length || 0} items</h3>
                  </div>
                </div>
              </div>
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <FiAlertCircle size={30} color="#F59E0B" />
                  <div>
                    <h4 style={{ color: '#6B7280' }}>Shortage Alerts</h4>
                    <h3 style={{ color: '#EF4444' }}>{predictions?.shortageAlerts || 0}</h3>
                  </div>
                </div>
              </div>
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <FiDollarSign size={30} color="#10B981" />
                  <div>
                    <h4 style={{ color: '#6B7280' }}>Menu Pricing</h4>
                    <h3>{predictions?.menuPricing?.length || 0} items</h3>
                  </div>
                </div>
              </div>
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <FiClock size={30} color="#8B5CF6" />
                  <div>
                    <h4 style={{ color: '#6B7280' }}>Prep Time</h4>
                    <h3>{predictions?.prepTime || 'N/A'}</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid-3" style={{ marginBottom: '2rem' }}>
              <Link to="/ai/stock-predictions" className="card" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <FiPackage size={24} color="#4F46E5" />
                  <div>
                    <h4>Stock Predictions</h4>
                    <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                      View AI-powered stock shortage predictions
                    </p>
                  </div>
                </div>
              </Link>
              <Link to="/ai/menu-recommendations" className="card" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <FiMenu size={24} color="#10B981" />
                  <div>
                    <h4>Menu Recommendations</h4>
                    <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                      AI-powered menu pricing optimization
                    </p>
                  </div>
                </div>
              </Link>
              <Link to="/ai/invoice-processing" className="card" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <FiThumbsUp size={24} color="#F59E0B" />
                  <div>
                    <h4>Invoice Processing</h4>
                    <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                      AI-powered invoice OCR and processing
                    </p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Recommendations Section */}
            {recommendations && (
              <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>AI Recommendations</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <h4 style={{ color: '#6B7280', marginBottom: '0.5rem' }}>
                      <FiPackage /> Stock Reorder
                    </h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {recommendations.stockReorder?.map((item, index) => (
                        <li key={index} style={{ padding: '0.5rem 0', borderBottom: '1px solid #E5E7EB' }}>
                          {item.ingredient}: Order <strong>{item.quantity}</strong> units
                        </li>
                      ))}
                      {(!recommendations.stockReorder || recommendations.stockReorder.length === 0) && (
                        <li style={{ padding: '0.5rem 0', color: '#6B7280' }}>No recommendations</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 style={{ color: '#6B7280', marginBottom: '0.5rem' }}>
                      <FiAlertCircle /> Waste Reduction
                    </h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {recommendations.wasteReduction?.map((item, index) => (
                        <li key={index} style={{ padding: '0.5rem 0', borderBottom: '1px solid #E5E7EB' }}>
                          {item.ingredient}: Reduce by <strong>{item.reduction}%</strong>
                        </li>
                      ))}
                      {(!recommendations.wasteReduction || recommendations.wasteReduction.length === 0) && (
                        <li style={{ padding: '0.5rem 0', color: '#6B7280' }}>No recommendations</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'stock':
        return <StockPredictions />;
      case 'menu':
        return <MenuRecommendations />;
      default:
        return <StockPredictions />;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>AI Dashboard</h1>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`btn ${activeTab === 'stock' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('stock')}
          >
            Stock Predictions
          </button>
          <button
            className={`btn ${activeTab === 'menu' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('menu')}
          >
            Menu Recommendations
          </button>
          <button
            className="btn btn-secondary"
            onClick={fetchAIData}
          >
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>
      {renderContent()}
    </div>
  );
};

export default AIDashboard;