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

        const ids = [
            ...new Set(
                Object.values(portfolio).map(p => p.id)
            )
        ];

        for (const id of ids) {

            const response = await fetch(
                `https://api.coingecko.com/api/v3/coins/${id}`
            );

            if (!response.ok) {
                console.log(`Failed: ${id}`);
                continue;
            }

            const data = await response.json();

            result[id] = {
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