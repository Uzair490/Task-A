const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");


require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.DB_URI, {
 
});

const TradeSchema = new mongoose.Schema({
  stockSymbol: String,
  type: { type: String, enum: ["buy", "sell"] },
  quantity: Number,
  price: Number,
  date: { type: Date, default: Date.now },
});
const Trade = mongoose.model("Trade", TradeSchema);

const getStockPrice = async (symbol) => {
  try {
    const response = await axios.get(
      `https://api.example.com/stock/${symbol}/price?apikey=${process.env.STOCK_API_KEY}`
    );
    return response.data.price;
  } catch (error) {
    console.error("Error fetching stock price:", error);
    return null;
  }
};

app.post("/api/trades", async (req, res) => {
  const trade = new Trade(req.body);
  await trade.save();
  res.status(201).json(trade);
});

app.get("/api/portfolio", async (req, res) => {
  const trades = await Trade.find();
  const portfolio = {};
  for (const trade of trades) {
    if (!portfolio[trade.stockSymbol]) {
      portfolio[trade.stockSymbol] = {
        quantity: 0,
        totalInvested: 0,
        avgPrice: 0,
        profitLoss: 0,
        currentPrice: 0,
      };
    }
    if (trade.type === "buy") {
      portfolio[trade.stockSymbol].quantity += trade.quantity;
      portfolio[trade.stockSymbol].totalInvested +=
        trade.quantity * trade.price;
    } else {
      portfolio[trade.stockSymbol].quantity -= trade.quantity;
    }
  }

  let totalProfitLoss = 0;
  let totalInvestment = 0;
  for (const symbol in portfolio) {
    if (portfolio[symbol].quantity > 0) {
      portfolio[symbol].avgPrice =
        portfolio[symbol].totalInvested / portfolio[symbol].quantity;
      portfolio[symbol].currentPrice = await getStockPrice(symbol);
      portfolio[symbol].profitLoss =
        (portfolio[symbol].currentPrice - portfolio[symbol].avgPrice) *
        portfolio[symbol].quantity;
      totalProfitLoss += portfolio[symbol].profitLoss;
      totalInvestment += portfolio[symbol].totalInvested;
    }
  }

  res.json({ portfolio, totalInvestment, totalProfitLoss });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
