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

        for (const id of ids) {

            try {

                const response = await fetch(
                    `https://api.coingecko.com/api/v3/coins/${id}`
                );

                if (!response.ok) {
                    console.log(`${id} skipped: HTTP ${response.status}`);
                    continue;
                }

                const data = await response.json();

                const usd =
                    data?.market_data?.current_price?.usd;

                if (!usd) {
                    console.log(`${id} skipped: no price`);
                    continue;
                }

                result[id] = {
                    usd: usd
                };

                // CoinGecko rate limit védelem
                await new Promise(r =>
                    setTimeout(r, 1500)
                );

            } catch (err) {

                console.log(
                    `${id} skipped: ${err.message}`
                );

                continue;
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