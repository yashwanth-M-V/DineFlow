import React, { useState } from 'react';
import TableLayout from './components/TableLayout/TableLayout';
import OrderScreen from './components/orderscreen/orderscreen';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('tables');
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [currentTable, setCurrentTable] = useState(null);

  const handleTableSelect = (orderId, table) => {
    setCurrentOrderId(orderId);
    setCurrentTable(table);
    setCurrentView('order');
  };

  const handleBackToTables = () => {
    setCurrentView('tables');
    setCurrentOrderId(null);
    setCurrentTable(null);
  };

  return (
    <div className="App">
      {currentView === 'tables' && (
        <TableLayout onTableSelect={handleTableSelect} />
      )}
      
      {currentView === 'order' && (
        <OrderScreen 
          orderId={currentOrderId}
          table={currentTable}
          onBack={handleBackToTables}
        />
      )}
    </div>
  );
}

export default App;