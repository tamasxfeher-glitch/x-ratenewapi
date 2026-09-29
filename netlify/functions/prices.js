exports.handler = async () => {

    const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
    );

    return {
        statusCode: response.status,
        headers: {
            "Content-Type": "application/json"
        },
        body: await response.text()
    };
};