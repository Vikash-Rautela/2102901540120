const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

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
                'Authorization': `Bearer ${process.env.BEARER_TOKEN}`
            }
        });
        return response.data.numbers;
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

    const numbers = await fetchNumbers(numberId);

    res.json({
        numbers
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
