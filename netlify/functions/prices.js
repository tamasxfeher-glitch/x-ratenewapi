exports.handler = async () => {

    const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/bitcoin"
    );

    const text = await response.text();

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "text/plain"
        },
        body: text
    };
};
``