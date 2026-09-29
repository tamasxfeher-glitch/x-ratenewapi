const fs = require("fs");
const path = require("path");

const coinCapMap = {
    bitcoin: "bitcoin",
    ethereum: "ethereum",
    solana: "solana",
    cardano: "cardano",
    sui: "sui",
    chainlink: "chainlink",
    "internet-computer": "internet-computer",
    ripple: "xrp",
    polkadot: "polkadot",
    dogecoin: "dogecoin",
    "shiba-inu": "shiba-inu",
    stellar: "stellar",
    "hedera-hashgraph": "hedera-hashgraph"
};

exports.handler = async () => {

    try {

        const portfolioPath = path.join(
            process.cwd(),
            "portfolio.json"
        );

        const portfolio = JSON.parse(
            fs.readFileSync(portfolioPath, "utf8")
        );

        const result = {};

        const response = await fetch(
            "https://api.coincap.io/v2/assets"
        );

        const data = await response.json();

        const assets = {};
        data.data.forEach(a => {
            assets[a.id] = Number(a.priceUsd);
        });

        for (const p of Object.values(portfolio)) {

            const coinCapId = coinCapMap[p.id];

            if (!coinCapId) continue;

            if (assets[coinCapId]) {

                result[p.id] = {
                    usd: assets[coinCapId]
                };
            }
        }

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(result)
        };

    } catch (err) {

        return {
            statusCode: 500,
            body: JSON.stringify({
                error: err.message
            })
        };

    }
};