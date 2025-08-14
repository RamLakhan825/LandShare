// const Ipo = require("../models/Ipo");
// const PriceHistory = require("../models/PriceHistory");

// async function fluctuatePrices() {
//   try {
//     const ipos = await Ipo.findAll({ where: { approved: true } });

//     for (const ipo of ipos) {
//       // Random fluctuation between -2% and +2%
//       const fluctuationPercent = (Math.random() * 4 - 2) / 100;
//       let newPrice = parseFloat(ipo.shareCost) * (1 + fluctuationPercent);

//       // Minimum price limit
//       if (newPrice < 10) newPrice = 10;

//       // Save previous close as open
//       const previousClose = parseFloat(ipo.shareCost);

//       // Set candle values
//       const open = previousClose;
//       const close = newPrice;
//       // For demo, high and low = open +/- small random range
//       const high = Math.max(open, close) * (1 + Math.random() * 0.01);
//       const low = Math.min(open, close) * (1 - Math.random() * 0.01);

//       ipo.shareCost = newPrice.toFixed(2);
//       await ipo.save();

//       // Save candle
//       await PriceHistory.create({
//         ipoId: ipo.id,
//         timestamp: new Date(),
//         open,
//         high,
//         low,
//         close,
//       });
//     }

//     //console.log("Prices fluctuated and candles saved at", new Date().toLocaleString());
//   } catch (err) {
//     console.error("Error fluctuating prices:", err);
//   }
// }

// setInterval(fluctuatePrices, 1000 * 60 * 60);

// module.exports = fluctuatePrices;


const Ipo = require("../models/Ipo");
const PriceHistory = require("../models/PriceHistory");

async function fluctuatePrices() {
  try {
    const ipos = await Ipo.findAll({ where: { approved: true } });

    for (const ipo of ipos) {
      // Random fluctuation between -2% and +2%
      const fluctuationPercent = (Math.random() * 4 - 2) / 100;
      let newPrice = parseFloat(ipo.shareCost) * (1 + fluctuationPercent);

      // Minimum price limit
      if (newPrice < 10) newPrice = 10;

      // Save previous close as open
      const previousClose = parseFloat(ipo.shareCost);

      // Set candle values
      const open = previousClose;
      const close = newPrice;
      // For demo, high and low = open +/- small random range
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);

      // Save new price as number, not string
      ipo.shareCost = parseFloat(newPrice.toFixed(2));
      await ipo.save();

      // Save candle to PriceHistory
      await PriceHistory.create({
        ipoId: ipo.id,
        timestamp: new Date(),
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
      });
    }

    //console.log("Prices fluctuated and candles saved at", new Date().toLocaleString());
  } catch (err) {
    console.error("Error fluctuating prices:", err);
  }
}

// Run every hour
setInterval(fluctuatePrices, 1000 * 60 * 60);

module.exports = fluctuatePrices;
