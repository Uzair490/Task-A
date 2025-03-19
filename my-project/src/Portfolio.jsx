import { useState, useEffect } from "react";
import axios from "axios";

export default function Portfolio() {
  const [trades, setTrades] = useState([]);
  const [symbol, setSymbol] = useState("");
  const [type, setType] = useState("buy");
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [stockPrices, setStockPrices] = useState({});
  const [portfolioSummary, setPortfolioSummary] = useState({
    totalInvestment: 0,
    totalProfit: 0,
    portfolioValue: 0,
  });

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/portfolio");

      setTrades(data.trades || []);
      setStockPrices(data.stockPrices || {});
      setPortfolioSummary(
        data.summary || {
          totalInvestment: 0,
          totalProfit: 0,
          portfolioValue: 0,
        }
      );
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    }
  };

  const addTrade = async () => {
    try {
      await axios.post("http://localhost:5000/api/trades", {
        stockSymbol: symbol.toUpperCase(),
        type,
        quantity,
        price,
      });
      fetchPortfolio();
    } catch (error) {
      console.error("Error adding trade:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl">Stock Portfolio</h1>
      <div className="mb-4">
        <input
          className="border p-2"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Stock Symbol"
        />
        <select
          className="border p-2"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>
        <input
          className="border p-2"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(+e.target.value)}
          placeholder="Quantity"
        />
        <input
          className="border p-2"
          type="number"
          value={price}
          onChange={(e) => setPrice(+e.target.value)}
          placeholder="Price"
        />
        <button className="bg-blue-500 text-white p-2" onClick={addTrade}>
          Add Trade
        </button>
      </div>

      <h2 className="text-xl">Portfolio Summary</h2>
      <div>
        <p>
          Total Investment: $
          {portfolioSummary?.totalInvestment?.toFixed(2) || "0.00"}
        </p>
        <p>
          Total Profit: ${portfolioSummary?.totalProfit?.toFixed(2) || "0.00"}
        </p>
        <p>
          Portfolio Value: $
          {portfolioSummary?.portfolioValue?.toFixed(2) || "0.00"}
        </p>
      </div>

      <h2 className="text-xl mt-4">Trades</h2>
      <div>
        {trades.map((trade, index) => (
          <div key={index} className="border p-2">
            <strong>{trade.stockSymbol}</strong>: {trade.quantity} shares @ $
            {trade.price}
          </div>
        ))}
      </div>
    </div>
  );
}
