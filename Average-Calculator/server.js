const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const WINDOW_SIZE = parseInt(process.env.WINDOW_SIZE, 10);
const BEARER_TOKEN = process.env.BEARER_TOKEN;
let window = [];

// Function to calculate average
const calculateAverage = (numbers) => {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return (sum / numbers.length).toFixed(2);
};

// Function to fetch numbers from test server
const fetchNumbers = async (numberId) => {
    const urlMap = {
        'p': 'http://20.244.56.144/test/primes',
        'f': 'http://20.244.56.144/test/fibonacci',
        'e': 'http://20.244.56.144/test/even',
        'r': 'http://20.244.56.144/test/random'
    };

    const url = urlMap[numberId];

    try {
        const response = await axios.get(url, {
            timeout: 500,
            headers: {
                'Authorization': `Bearer ${BEARER_TOKEN}`
            }
        });

        if (response.status !== 200) {
            throw new Error(`Failed to fetch numbers. Status: ${response.status}`);
        }

        return response.data.numbers || [];
    } catch (error) {
        console.error(`Error fetching numbers: ${error.message}`);
        return [];
    }
};

// API endpoint
app.get('/numbers/:numberId', async (req, res) => {
    const { numberId } = req.params;
    const validIds = ['p', 'f', 'e', 'r'];

    if (!validIds.includes(numberId)) {
        return res.status(400).json({ error: 'Invalid number ID' });
    }

    try {
        const numbers = await fetchNumbers(numberId);
        const prevState = [...window];

        numbers.forEach(number => {
            if (!window.includes(number)) {
                if (window.length >= WINDOW_SIZE) {
                    window.shift();
                }
                window.push(number);
            }
        });

        const avg = calculateAverage(window);

        res.json({
            numbers,
            windowPrevState: prevState,
            windowCurrState: window,
            average: avg
        });
    } catch (error) {
        console.error(`Error processing request: ${error.message}`);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
