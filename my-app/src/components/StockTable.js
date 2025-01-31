import React, { useEffect, useState } from "react";
import "./StockTable.css";

const StockTable = () => {
  const [sectorData, setSectorData] = useState(() => {
    const savedData = sessionStorage.getItem("sectorData");
    return savedData ? JSON.parse(savedData) : {};
  });

  const [loading, setLoading] = useState(!Object.keys(sectorData).length);
  const [error, setError] = useState(null);
  const [currentSector, setCurrentSector] = useState(null);
  const [selectedClosingDate, setSelectedClosingDate] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState(null);

  useEffect(() => {
    if (!Object.keys(sectorData).length) {
      const fetchStockData = async () => {
        try {
          const response = await fetch("http://127.0.0.1:5000/api/etf-data");
          if (!response.ok) {
            throw new Error("Failed to fetch stock data");
          }
          const data = await response.json();
          setSectorData(data.sector_data || {});
          sessionStorage.setItem("sectorData", JSON.stringify(data.sector_data || {}));
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchStockData();
    }
  }, [sectorData]);

  if (loading) {
    return <div>Loading stock data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleSectorClick = (sector) => {
    setCurrentSector(currentSector === sector ? null : sector);
    setSelectedIndustry(null);
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

  const filteredStocks = selectedIndustry
    ? groupedData[selectedIndustry] || []
    : currentSectorData;

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
    return "-";
  };

  const getClosingPrice = (closingPrices) => {
    if (selectedClosingDate && closingPrices[selectedClosingDate]) {
      return parseFloat(closingPrices[selectedClosingDate]).toFixed(2);
    }
    return "-";
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

      {currentSector && (
        <div>
          <h2 style={{ marginTop: "50px" }}>{currentSector} Sector</h2>

          {/* Industry Dropdown */}
          <div className="filters-container">
            <div className="industry-dropdown">
              <label>Select Industry: </label>
              <select value={selectedIndustry} onChange={(e) => setSelectedIndustry(e.target.value)}>
                <option value="">All Industries</option>
                {Object.keys(groupedData).map((industry) => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            {/* Closing Date Picker */}
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

          {/* Display Stocks */}
          {filteredStocks.length > 0 ? (
            <table className="stock-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Name</th>
                  <th>Industry</th>
                  <th>Today Price ($)</th>
                  <th>Yesterday Price ($)</th>
                  <th>Difference (Today vs. Yesterday)</th>
                  <th>Market Cap ($)</th>
                  <th>Dividend Yield</th>
                  <th>Closing Price ($) {selectedClosingDate}</th>
                  <th>Difference (Today vs. Closing price {selectedClosingDate})</th>
                </tr>
              </thead>
              <tbody>
                {filteredStocks.map((stock, index) => {
                  const closingPrice = getClosingPrice(stock.closing_prices);
                  return (
                    <tr key={index}>
                      <td>{stock.symbol}</td>
                      <td>{stock.name}</td>
                      <td>{stock.industry}</td>
                      <td>{!isNaN(stock.today_price) ? stock.today_price.toFixed(2) : "N/A"}</td>
                      <td>{!isNaN(stock.yesterday_price) ? stock.yesterday_price.toFixed(2) : "N/A"}</td>
                      <td>{calculateDifference(stock.today_price, stock.yesterday_price)}</td>
                      <td>{stock.market_cap ? (stock.market_cap / 1e9).toFixed(2) + " B" : "N/A"}</td>
                      <td>{!isNaN(stock.dividend_yield) ? `${(stock.dividend_yield * 100).toFixed(2)}%` : "N/A"}</td>
                      <td>{closingPrice}</td>
                      <td>{calculateDifference(stock.today_price, parseFloat(closingPrice))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div>No stocks available</div>
          )}
        </div>
      )}
    </div>
  );
};

export default StockTable;
