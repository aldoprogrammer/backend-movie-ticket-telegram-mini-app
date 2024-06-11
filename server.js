const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const cors = require('cors'); // Import the cors package
require('dotenv').config();

const app = express();
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(botToken, { polling: true });

app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173', 'https://movie-ticket-fe.vercel.app/'] // Allow requests from multiple origins
}));

const movies = [
    { id: 1, title: 'Movie 1', showtimes: ['6:00 PM', '9:00 PM'] },
    { id: 2, title: 'Movie 2', showtimes: ['5:00 PM', '8:00 PM'] }
];

// Endpoint to browse movies
app.get('/movies', (req, res) => {
    res.json({ movies });
});

// Endpoint to purchase a ticket
app.post('/purchase-ticket', (req, res) => {
    const { chatId, movieId, showtime } = req.body;
    const movie = movies.find(m => m.id === movieId);
    if (movie) {
        // Save ticket to database or perform blockchain transaction here
        res.json({ message: 'Ticket purchased successfully', movie, showtime });
    } else {
        res.status(404).json({ message: 'Movie not found' });
    }
});

// Endpoint to get personalized recommendations
app.post('/recommendations', async (req, res) => {
    const { userId } = req.body;
    // Call your AI service to get recommendations
    const response = await axios.post('https://ai-service-url.com/recommend', { userId });
    const recommendations = response.data.recommendations;
    res.json({ recommendations });
});

// Telegram Bot Commands
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = "Let's get started 🎬\n\nPlease tap the button on the left side to order movie ticket with your partner!";
    const messageOptions = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [
                    {
                        text: 'Order Now',
                        web_app: {
                            url: 'https://movie-ticket-fe.vercel.app/' // Web App URL to open within Telegram
                        }
                    }
                ]
            ]
        })
    };
    bot.sendMessage(chatId, welcomeMessage);
});

// Handle inline queries
bot.on('inline_query', async (inlineQuery) => {
    const query = inlineQuery.query;
    const results = [];

    // If the query is empty or a specific command, return no results
    if (!query.trim() || query.trim().startsWith('/')) {
        bot.answerInlineQuery(inlineQuery.id, []);
        return;
    }

    // Add your web app URL as a result
    const appUrl = 'https://movie-ticket-fe.vercel.app/'; // The URL you want to open
    const result = {
        type: 'article',
        id: '1',
        title: 'Open Mini App',
        description: 'Launch your mini app',
        input_message_content: {
            message_text: appUrl,
        },
        url: appUrl,
        hide_url: true,
    };

    results.push(result);

    // Respond with the results
    bot.answerInlineQuery(inlineQuery.id, results);
});

const port = 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
