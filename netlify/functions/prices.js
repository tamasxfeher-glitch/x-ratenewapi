const fs = require("fs");
const path = require("path");

exports.handler = async () => {
    try {

        const portfolioPath = path.join(
            process.cwd(),
            "portfolio.json"
        );

        const portfolio = JSON.parse(
            fs.readFileSync(portfolioPath, "utf8")
        );

        const ids = [
            ...new Set(
                Object.values(portfolio).map(p => p.id)
            )
        ];

        const result = {};

        // IDEIGLENESEN CSAK AZ ELSŐ 3 TOKEN
        const testIds = ids.slice(0, 3);

        for (const id of testIds) {

            const response = await fetch(
                `https://api.coingecko.com/api/v3/coins/${id}`
            );

            if (!response.ok) {
                result[id] = {
                    error: `HTTP ${response.status}`
                };
                continue;
            }

            const data = await response.json();

            result[id] = {
                hasMarketData: !!data.market_data,
                hasCurrentPrice: !!(
                    data.market_data &&
                    data.market_data.current_price
                ),
                usd: (
                    data.market_data &&
                    data.market_data.current_price
                )
                    ? data.market_data.current_price.usd
                    : null
            };
        }

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(result, null, 2)
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