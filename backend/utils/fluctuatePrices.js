


const Ipo = require("../models/Ipo");
const PriceHistory = require("../models/PriceHistory");
const { predictAndStore } = require("./pricePredictor");

/**
 * Fluctuates prices, updates PriceHistory, predicts future price,
 * and emits real-time updates via Socket.IO
 */
async function fluctuatePrices(io) {
  try {
    const ipos = await Ipo.findAll({ where: { approved: true } });

    for (const ipo of ipos) {
      // ------------------
      // 1️⃣ Price fluctuation
      // ------------------
      const fluctuationPercent = (Math.random() * 4 - 2) / 100; // -2% to +2%
      let newPrice = parseFloat(ipo.shareCost) * (1 + fluctuationPercent);
      if (newPrice < 10) newPrice = 10;

      const previousClose = parseFloat(ipo.shareCost);
      const open = previousClose;
      const close = newPrice;
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);

      // Update IPO shareCost
      ipo.shareCost = parseFloat(newPrice.toFixed(2));
      await ipo.save();

      // ------------------
      // 2️⃣ Save PriceHistory candle
      // ------------------
      await PriceHistory.create({
        ipoId: ipo.id,
        timestamp: new Date(),
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
      });

      // ------------------
      // 3️⃣ Predict future price
      // ------------------
      const pred = await predictAndStore(ipo.id);

      // ------------------
      // 4️⃣ Emit real-time updates via Socket.IO
      // ------------------
      io.emit("priceUpdate", {
        ipoId: ipo.id,
        newPrice: ipo.shareCost,
        //predictedPrice: predictedPrice
        model1: pred.predictedPrice1,
  model2: pred.predictedPrice2
      });
    }

    console.log("✅ Prices fluctuated & predictions updated at", new Date().toLocaleString());
  } catch (err) {
    console.error("Error in fluctuatePrices:", err);
  }
}

/**
 * Start loop: runs every hour, avoids overlapping runs
 */
async function startFluctuationLoop(io) {
  while (true) {
    await fluctuatePrices(io);
    await new Promise(resolve => setTimeout(resolve, 1000 * 60 )); // wait 1 hour
  }
}

module.exports = startFluctuationLoop;
