import React, { useEffect, useState } from "react";
import "./StockTable.css";

const StockTable = () => {
  const [sectorData, setSectorData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSector, setCurrentSector] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClosingDate, setSelectedClosingDate] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState(null); // Track selected industry
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/etf-data");
        if (!response.ok) {
          throw new Error("Failed to fetch stock data");
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


  const handleSectorClick = (sector) => {
    setCurrentSector(currentSector === sector ? null : sector);
    setCurrentPage(1);
    setSelectedIndustry(null); // Reset selected industry when changing sector
  };

  

  const handleIndustryClick = (industry) => {
    setSelectedIndustry(selectedIndustry === industry ? null : industry);
  };

  const getSortedSectorData = (stocks) => {
    return [...stocks].sort((a, b) => {
      const marketCapA = parseFloat(a.market_cap) || 0;
      const marketCapB = parseFloat(b.market_cap) || 0;
      return marketCapB - marketCapA;
    });
  };

  const groupByIndustry = (stocks) => {
    return stocks.reduce((acc, stock) => {
      const { industry } = stock;
      if (!acc[industry]) {
        acc[industry] = [];
      }
      acc[industry].push(stock);
      return acc;
    }, {});
  };

  const currentSectorData = currentSector
    ? getSortedSectorData(sectorData[currentSector])
    : [];
  const groupedData = groupByIndustry(currentSectorData);
  const totalPages = Math.ceil(currentSectorData.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const filteredStocks = selectedIndustry
    ? groupedData[selectedIndustry] || []
    : currentSectorData;

  const displayedStocks = filteredStocks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const calculateDifference = (price1, price2) => {
    if (!isNaN(price1) && !isNaN(price2)) {
      const difference = price1 - price2;
      const isIncrease = difference > 0;
      return (
        <span style={{ color: isIncrease ? "green" : "red" }}>
          {difference.toFixed(2)} {isIncrease ? "▲" : "▼"}
        </span>
      );
    }
    return "N/A";
  };

  const getClosingPrice = (closingPrices) => {
    if (selectedClosingDate && closingPrices[selectedClosingDate]) {
      return parseFloat(closingPrices[selectedClosingDate]).toFixed(2);
    }
    return "N/A";
  };

  return (
    <div className="stock-table-container">
      <h2>Stock Market Data</h2>

      

      
      
      {/* Sector Buttons */}
      <div className="sector-buttons">
        {Object.keys(sectorData).map((sector) => (
          <button
            key={sector}
            onClick={() => handleSectorClick(sector)}
            className={currentSector === sector ? "active" : ""}
          >
            {sector}
          </button>
        ))}
      </div>

      {/* Display Industries in the Selected Sector */}
      {currentSector && (
  <div>
    <h3>{currentSector} Sector</h3>
    <h2>Industries</h2>
    {/* <div className="industry-buttons">
      {Object.keys(groupedData).map((industry) => (
        <span
          key={industry}
          onClick={() => handleIndustryClick(industry)}
          className={selectedIndustry === industry ? "active" : ""}
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: selectedIndustry === industry ? '#000000' : '#4caf50',
            cursor: 'pointer',
            marginRight: '15px',
            transition: 'color 0.3s ease',
          }}
        >
          {industry}
        </span>
      ))}
    </div> */}
  <div className="filters-container">
  {/* Industry Dropdown (Left Side) */}
  <div className="industry-dropdown">
    <label>Select Industry: </label>
    <select value={selectedIndustry} onChange={(e) => setSelectedIndustry(e.target.value)}>
      <option value="">All Industries</option>
      {Object.keys(groupedData).map((industry) => (
        <option key={industry} value={industry}>{industry}</option>
      ))}
    </select>
  </div>

  {/* Closing Date Picker (Right Side) */}
  <div className="date-picker">
    <label htmlFor="closing-date">Select Closing Date: </label>
    <input
      type="date"
      id="closing-date"
      value={selectedClosingDate}
      onChange={(e) => setSelectedClosingDate(e.target.value)}
      placeholder="YYYY-MM-DD"
    />
  </div>
</div>

    {/* Display the Stocks for the Selected Industry */}
    {displayedStocks.length > 0 ? (
      <table className="stock-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Name</th>
            <th>industry</th>
            <th>Today Price ($)</th>
            <th>Yesterday Price ($)</th>
            <th>Difference (Today vs. Yesterday)</th>
            <th>Market Cap ($)</th>
            <th>Dividend Yield</th>
            <th>Closing Price ($)</th>
            <th>Difference (Today vs. Closing)</th>
          </tr>
        </thead>
        <tbody>
          {displayedStocks.map((stock, index) => {
            const closingPrice = getClosingPrice(stock.closing_prices);
            return (
              <tr key={index}>
                <td>{stock.symbol}</td>
                <td>{stock.name}</td>
                <td>{stock.industry}</td>
                <td>
                  {!isNaN(stock.today_price)
                    ? stock.today_price.toFixed(2)
                    : "N/A"}
                </td>
                
                <td>
                  {!isNaN(stock.yesterday_price)
                    ? stock.yesterday_price.toFixed(2)
                    : "N/A"}
                </td>
                <td>
                  {calculateDifference(
                    stock.today_price,
                    stock.yesterday_price
                  )}
                </td>
                <td>
                  {stock.market_cap !== "N/A" &&
                  !isNaN(stock.market_cap)
                    ? (stock.market_cap / 1e9).toFixed(2) + " B"
                    : "N/A"}
                </td>
                <td>
                  {stock.dividend_yield !== "N/A" &&
                  !isNaN(stock.dividend_yield)
                    ? `${(stock.dividend_yield * 100).toFixed(2)}%`
                    : "N/A"}
                </td>
                <td>{closingPrice}</td>
                <td>
                  {calculateDifference(
                    stock.today_price,
                    parseFloat(closingPrice)
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    ) : (
      <div></div>
    )}
  </div>
)}

      {/* Pagination Controls
      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div> */}
    </div>
  );
};

export default StockTable;

