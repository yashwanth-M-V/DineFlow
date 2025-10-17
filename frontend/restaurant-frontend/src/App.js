import React, { useState } from 'react';
import TableLayout from './components/TableLayout/TableLayout';
import OrderScreen from './components/orderscreen/orderscreen';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [currentTable, setCurrentTable] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleTableSelect = (orderId, table) => {
    setCurrentOrderId(orderId);
    setCurrentTable(table);
    setCurrentView('order');
    setIsMenuOpen(false);
  };

  const handleNavigation = (view) => {
    setCurrentView(view);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Render current view based on state
  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage onNavigate={handleNavigation} />;
      case 'tables':
        return <TableLayout onTableSelect={handleTableSelect} />;
      case 'order':
        return (
          <OrderScreen 
            orderId={currentOrderId}
            table={currentTable}
            onBack={() => handleNavigation('tables')}
          />
        );
      case 'analytics':
        return <AnalyticsDashboard onBack={() => handleNavigation('home')} />;
      default:
        return <HomePage onNavigate={handleNavigation} />;
    }
  };

  return (
    <div className="App">
      {/* Navigation Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo">🍽️</div>
            <h1 className="app-title">BistroManager</h1>
          </div>
          
          {/* Hamburger Menu */}
          <button 
            className={`hamburger-menu ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Navigation Menu */}
          <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <button 
              className={`nav-item ${currentView === 'home' ? 'active' : ''}`}
              onClick={() => handleNavigation('home')}
            >
              🏠 Home
            </button>
            <button 
              className={`nav-item ${currentView === 'tables' ? 'active' : ''}`}
              onClick={() => handleNavigation('tables')}
            >
              🪑 Table Orders
            </button>
            <button 
              className={`nav-item ${currentView === 'analytics' ? 'active' : ''}`}
              onClick={() => handleNavigation('analytics')}
            >
              📊 Analytics
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {renderCurrentView()}
      </main>
    </div>
  );
}

// HomePage Component (Keep this in App.js since it's simple)
const HomePage = ({ onNavigate }) => {
  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to BistroManager</h1>
          <p className="hero-subtitle">
            Professional Restaurant Management System
          </p>
          <div className="hero-description">
            <p>Streamline your restaurant operations with our all-in-one solution:</p>
            <ul className="feature-list">
              <li>✅ Table Order Management</li>
              <li>✅ Real-time Analytics</li>
              <li>✅ Inventory Tracking</li>
              <li>✅ Profit Calculations</li>
              <li>✅ Kitchen Integration</li>
            </ul>
          </div>
          
          <div className="cta-buttons">
            <button 
              className="cta-button primary"
              onClick={() => onNavigate('tables')}
            >
              🪑 Start Taking Orders
            </button>
            <button 
              className="cta-button secondary"
              onClick={() => onNavigate('analytics')}
            >
              📊 View Analytics
            </button>
          </div>
        </div>
        
        <div className="hero-image">
          <div className="restaurant-illustration">
            <div className="table-group">
              <div className="table">🍽️</div>
              <div className="table">🍽️</div>
              <div className="table">🍽️</div>
            </div>
            <div className="stats-card">
              <h4>Today's Performance</h4>
              <p>Orders: <strong>24</strong></p>
              <p>Revenue: <strong>$580</strong></p>
            </div>
          </div>
        </div>
      </div>

      <div className="quick-stats">
        <div className="stat-card">
          <h3>Efficient</h3>
          <p>Reduce order errors by 80%</p>
        </div>
        <div className="stat-card">
          <h3>Profitable</h3>
          <p>Increase margins with smart analytics</p>
        </div>
        <div className="stat-card">
          <h3>Simple</h3>
          <p>Staff trained in 30 minutes</p>
        </div>
      </div>
    </div>
  );
};

export default App;