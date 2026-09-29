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
        const debug = [];

        for (const id of ids) {

            try {

                const response = await fetch(
                    `https://api.coingecko.com/api/v3/coins/${id}`
                );

                debug.push({
                    id,
                    status: response.status
                });

                if (!response.ok) continue;

                const data = await response.json();

                result[id] = {
                    usd: data.market_data.current_price.usd
                };

            } catch (e) {

                debug.push({
                    id,
                    error: e.message
                });

            }
        }

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ids,
                result,
                debug
            }, null, 2)
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