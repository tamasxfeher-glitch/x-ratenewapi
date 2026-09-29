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

        const url =
            `https://api.coingecko.com/api/v3/simple/price` +
            `?ids=${ids.join(",")}` +
            `&vs_currencies=usd`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                `CoinGecko error ${response.status}`
            );
        }

        const data = await response.json();

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
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