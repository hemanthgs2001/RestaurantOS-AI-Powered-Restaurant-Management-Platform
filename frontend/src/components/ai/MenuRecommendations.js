import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiDollarSign, FiClock, FiBarChart2, FiThumbsUp, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import { getMenuPricingRecommendations } from '../../api/aiApi';
import toast from 'react-hot-toast';

const MenuRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMenuPricingRecommendations();
      setRecommendations(response.data || []);
    } catch (error) {
      console.error('Failed to fetch menu recommendations:', error);
      const errorMessage = error.message || 'Failed to fetch menu recommendations';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Set mock data for demo when API is not available
      setRecommendations([
        {
          menuItem: "Margherita Pizza",
          category: "Pizza",
          currentPrice: 12.99,
          recommendedPrice: 14.99,
          reason: "Ingredient cost increased by 15%"
        },
        {
          menuItem: "Caesar Salad",
          category: "Salads",
          currentPrice: 8.99,
          recommendedPrice: 9.99,
          reason: "High demand, slight price increase recommended"
        },
        {
          menuItem: "Pasta Carbonara",
          category: "Pasta",
          currentPrice: 15.99,
          recommendedPrice: 16.99,
          reason: "Ingredient cost increased by 8%"
        },
        {
          menuItem: "Garlic Bread",
          category: "Appetizers",
          currentPrice: 4.99,
          recommendedPrice: 5.49,
          reason: "High demand, slight price increase"
        },
        {
          menuItem: "Tiramisu",
          category: "Desserts",
          currentPrice: 6.99,
          recommendedPrice: 6.99,
          reason: "Pricing is optimal"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getCategories = () => {
    const categories = new Set(recommendations.map(r => r.category || 'Uncategorized'));
    return ['all', ...Array.from(categories)];
  };

  const getFilteredRecommendations = () => {
    if (selectedCategory === 'all') return recommendations;
    return recommendations.filter(r => (r.category || 'Uncategorized') === selectedCategory);
  };

  const getTotalPotentialRevenue = () => {
    return recommendations.reduce((sum, r) => {
      const priceDiff = r.recommendedPrice - r.currentPrice;
      return sum + (priceDiff > 0 ? priceDiff : 0);
    }, 0);
  };

  const getAverageIncrease = () => {
    const increases = recommendations
      .filter(r => r.recommendedPrice > r.currentPrice)
      .map(r => ((r.recommendedPrice - r.currentPrice) / r.currentPrice) * 100);
    return increases.length > 0 ? increases.reduce((a, b) => a + b, 0) / increases.length : 0;
  };

  const filteredRecommendations = getFilteredRecommendations();
  const categories = getCategories();
  const totalPotentialRevenue = getTotalPotentialRevenue();
  const avgIncrease = getAverageIncrease();

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
        <p style={{ marginTop: '1rem', color: '#6B7280' }}>Loading menu recommendations...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Menu Pricing Recommendations</h1>
          <p style={{ color: '#6B7280' }}>AI-powered menu pricing optimization</p>
        </div>
        <button className="btn btn-primary" onClick={fetchRecommendations}>
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
            <FiBarChart2 size={20} color="#4F46E5" />
            <h4 style={{ color: '#6B7280' }}>Total Items</h4>
          </div>
          <h2 style={{ marginTop: '0.5rem' }}>{recommendations.length}</h2>
        </div>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiDollarSign size={20} color="#10B981" />
            <h4 style={{ color: '#6B7280' }}>Potential Revenue</h4>
          </div>
          <h2 style={{ marginTop: '0.5rem', color: '#10B981' }}>
            ${totalPotentialRevenue.toFixed(2)}
          </h2>
        </div>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiTrendingUp size={20} color="#F59E0B" />
            <h4 style={{ color: '#6B7280' }}>Avg Increase</h4>
          </div>
          <h2 style={{ marginTop: '0.5rem', color: '#F59E0B' }}>
            {avgIncrease.toFixed(1)}%
          </h2>
        </div>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiThumbsUp size={20} color="#8B5CF6" />
            <h4 style={{ color: '#6B7280' }}>Recommendations</h4>
          </div>
          <h2 style={{ marginTop: '0.5rem' }}>
            {recommendations.filter(r => r.recommendedPrice > r.currentPrice).length}
          </h2>
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {categories.map(category => (
          <button
            key={category}
            className={`btn ${selectedCategory === category ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category === 'all' ? 'All Categories' : category}
          </button>
        ))}
      </div>

      {/* Recommendations List */}
      <div className="grid-2">
        {filteredRecommendations.map((item, index) => {
          const priceDiff = item.recommendedPrice - item.currentPrice;
          const percentIncrease = (priceDiff / item.currentPrice) * 100;
          const isIncrease = priceDiff > 0;
          const isDecrease = priceDiff < 0;
          const isSame = priceDiff === 0;

          let reasonColor = '#10B981';
          let reasonIcon = <FiThumbsUp />;
          if (isDecrease) {
            reasonColor = '#EF4444';
            reasonIcon = <FiAlertTriangle />;
          } else if (isSame) {
            reasonColor = '#6B7280';
            reasonIcon = <FiBarChart2 />;
          }

          return (
            <div key={index} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ marginBottom: '0.25rem' }}>{item.menuItem}</h3>
                  <span className="badge badge-info">{item.category || 'Uncategorized'}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Current Price</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', textDecoration: 'line-through', color: '#9CA3AF' }}>
                    ${item.currentPrice.toFixed(2)}
                  </div>
                </div>
              </div>

              <div style={{ 
                marginTop: '1rem',
                padding: '0.75rem',
                background: isIncrease ? '#ECFDF5' : isDecrease ? '#FEF2F2' : '#F9FAFB',
                borderRadius: '8px',
                borderLeft: `4px solid ${isIncrease ? '#10B981' : isDecrease ? '#EF4444' : '#6B7280'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ color: '#6B7280' }}>Recommended Price</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: isIncrease ? '#10B981' : isDecrease ? '#EF4444' : '#6B7280' }}>
                      ${item.recommendedPrice.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      color: isIncrease ? '#10B981' : isDecrease ? '#EF4444' : '#6B7280'
                    }}>
                      {isIncrease ? '+' : ''}{priceDiff.toFixed(2)} ({percentIncrease.toFixed(1)}%)
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                      {isIncrease ? 'Increase' : isDecrease ? 'Decrease' : 'No Change'}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ 
                marginTop: '1rem',
                padding: '0.75rem',
                background: '#F9FAFB',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'start',
                gap: '0.5rem'
              }}>
                <span style={{ color: reasonColor }}>{reasonIcon}</span>
                <div>
                  <div style={{ fontWeight: '500', color: '#1F2937' }}>Reason</div>
                  <div style={{ color: '#6B7280', fontSize: '0.875rem' }}>{item.reason}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                {isIncrease && (
                  <button className="btn btn-success btn-sm" style={{ flex: 1 }}>
                    Apply Recommendation
                  </button>
                )}
                {isDecrease && (
                  <button className="btn btn-warning btn-sm" style={{ flex: 1 }}>
                    Review Pricing
                  </button>
                )}
                {isSame && (
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                    Keep Current Price
                  </button>
                )}
                <button className="btn btn-secondary btn-sm">
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRecommendations.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <FiBarChart2 size={48} color="#9CA3AF" />
          <h3 style={{ marginTop: '1rem', color: '#6B7280' }}>No recommendations found</h3>
          <p style={{ color: '#9CA3AF' }}>No menu pricing recommendations available for this category</p>
        </div>
      )}

      {/* AI Insights */}
      {recommendations.length > 0 && (
        <div className="card" style={{ marginTop: '2rem', background: '#F0F4FF' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiTrendingUp /> AI Pricing Insights
          </h3>
          <div className="grid-3">
            <div>
              <h4 style={{ color: '#4F46E5', marginBottom: '0.5rem' }}>Top Opportunities</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {recommendations
                  .filter(r => r.recommendedPrice > r.currentPrice)
                  .sort((a, b) => (b.recommendedPrice - b.currentPrice) - (a.recommendedPrice - a.currentPrice))
                  .slice(0, 3)
                  .map((r, idx) => (
                    <li key={idx} style={{
                      padding: '0.5rem',
                      borderBottom: '1px solid #E5E7EB',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span>{r.menuItem}</span>
                      <span style={{ color: '#10B981' }}>
                        +${(r.recommendedPrice - r.currentPrice).toFixed(2)}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
            <div>
              <h4 style={{ color: '#F59E0B', marginBottom: '0.5rem' }}>Items to Review</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {recommendations
                  .filter(r => r.recommendedPrice < r.currentPrice)
                  .slice(0, 3)
                  .map((r, idx) => (
                    <li key={idx} style={{
                      padding: '0.5rem',
                      borderBottom: '1px solid #E5E7EB',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span>{r.menuItem}</span>
                      <span style={{ color: '#EF4444' }}>
                        -${(r.currentPrice - r.recommendedPrice).toFixed(2)}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
            <div>
              <h4 style={{ color: '#10B981', marginBottom: '0.5rem' }}>Optimization Summary</h4>
              <div style={{ fontSize: '0.9rem' }}>
                <p>
                  <strong>{recommendations.filter(r => r.recommendedPrice > r.currentPrice).length}</strong> items should increase price
                </p>
                <p>
                  <strong>{recommendations.filter(r => r.recommendedPrice < r.currentPrice).length}</strong> items should decrease price
                </p>
                <p>
                  <strong>{recommendations.filter(r => r.recommendedPrice === r.currentPrice).length}</strong> items are optimally priced
                </p>
                <p style={{ marginTop: '0.5rem', color: '#4F46E5' }}>
                  Potential revenue increase: <strong>${totalPotentialRevenue.toFixed(2)}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuRecommendations;