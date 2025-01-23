import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import StockTable from './components/StockTable'; 


function App() {
  return (
    <Router>
      <div className="App">
        <h1>Stock Data Viewer</h1>
        <Routes>
          
          <Route path="/" element={<StockTable />} />
          <Route path="/" element={<StockTable />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
