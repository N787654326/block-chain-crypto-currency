const exchangeRates = {
    asset_id_base: "USD",
    rates: [
      { asset_id_quote: "LTC", rate: 0.030537365914358224607146457 },
      { asset_id_quote: "BTC", rate: 0.0002807956773388707203621601 },
      { asset_id_quote: "EOS", rate: 0.4121926588487459038354526906 },
      { asset_id_quote: "ETC", rate: 0.2318602151511556498865332176 },
      { asset_id_quote: "ETH", rate: 0.0086911948499158260365934815 },
      { asset_id_quote: "USDT", rate: 1.0019743231865289462786319379 }
    ]
};

// Function to display exchange rates
function displayRates(rates) {
    console.log(`Exchange rates based on ${rates.asset_id_base}:`);
    rates.rates.forEach(rate => {
        console.log(`${rate.asset_id_quote}: ${rate.rate.toFixed(8)}`);
    });
}

displayRates(exchangeRates);
