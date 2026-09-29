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

        const result = {};

        for (const item of Object.values(portfolio)) {

            if (result[item.id]) continue;

            const response = await fetch(
                `https://api.coingecko.com/api/v3/coins/${item.id}`
            );

            if (!response.ok) {
                continue;
            }

            const data = await response.json();

            result[item.id] = {
                usd: data.market_data.current_price.usd
            };
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