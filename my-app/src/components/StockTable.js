import React, { useEffect, useState } from 'react';
import './StockTable.css';

const StockTable = () => {
  const [sectorData, setSectorData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/etf-data');
        if (!response.ok) {
          throw new Error('Failed to fetch stock data');
        }
        const data = await response.json();
        setSectorData(data.sector_data || {});
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, []);

  if (loading) {
    return <div>Loading stock data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const allStockData = Object.values(sectorData).flat();
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = allStockData.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(allStockData.length / itemsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="stock-table-container">
      <h2>Stock Market Data</h2>
      <table className="stock-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Name</th>
            <th>Sector</th>
            <th>Industry</th>
            <th>Current Price ($)</th>
            <th>Yesterday Price ($)</th>
            <th>PE Ratio</th>
            <th>Market Cap ($)</th>
            <th>Dividend Yield</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((stock, index) => (
              <tr key={index}>
                <td>{stock.symbol}</td>
                <td>{stock.name}</td>
                <td>{stock.sector}</td>
                <td>{stock.industry}</td>
                <td>{!isNaN(stock.current_price) ? stock.current_price.toFixed(2) : "N/A"}</td>
                <td>{!isNaN(stock.yesterday_price) ? stock.yesterday_price.toFixed(2) : "N/A"}</td>
                <td>{!isNaN(stock.pe_ratio) ? stock.pe_ratio.toFixed(2) : "N/A"}</td>
                <td>{stock.market_cap !== "N/A" && !isNaN(stock.market_cap) ? (stock.market_cap / 1e9).toFixed(2) + " B" : "N/A"}</td>
                <td>{stock.dividend_yield !== "N/A" && !isNaN(stock.dividend_yield) ? `${(stock.dividend_yield * 100).toFixed(2)}%` : "N/A"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9">No stock data available</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="pagination">
        <button onClick={prevPage} disabled={currentPage === 1}>Previous</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={nextPage} disabled={currentPage === totalPages}>Next</button>
      </div>
    </div>
  );
};

export default StockTable;
