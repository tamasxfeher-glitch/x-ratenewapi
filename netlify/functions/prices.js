const fs = require("fs");
const path = require("path");

exports.handler = async () => {

    try {

        const portfolio = JSON.parse(
            fs.readFileSync(
                path.join(process.cwd(), "portfolio.json"),
                "utf8"
            )
        );

        const ids = [
            ...new Set(
                Object.values(portfolio).map(p => p.id)
            )
        ];

        const result = {};

        // ELSŐ KÖRBEN CSAK 3 COIN
        const testIds = ids.slice(0, 3);

        for (const id of testIds) {

            const response = await fetch(
                `https://api.coingecko.com/api/v3/coins/${id}`
            );

            const data = await response.json();

            result[id] = {
                usd: data.market_data.current_price.usd
            };
        }

        return {
            statusCode: 200,
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