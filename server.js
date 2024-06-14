/*********************************************************************************
WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca Academic Policy.
No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or
distributed to other students.
Name:
Student ID:
Date:
Vercel Web App URL:
GitHub Repository URL:
********************************************************************************/

const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the "public" directory
app.use(express.static('public'));

// Redirect root URL to /about
app.get('/', (req, res) => {
    res.redirect('/about');
});

// Serve the about.html file for /about route
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Express http server listening on port ${PORT}`);
});
const storeService = require('./store-service.js');

storeService.initialize()
    .then(() => {
        app.get('/shop', (req, res) => {
            storeService.getPublishedItems()
                .then(data => res.json(data))
                .catch(err => res.status(500).json({ message: err }));
        });

        app.get('/items', (req, res) => {
            storeService.getAllItems()
                .then(data => res.json(data))
                .catch(err => res.status(500).json({ message: err }));
        });

        app.get('/categories', (req, res) => {
            storeService.getCategories()
                .then(data => res.json(data))
                .catch(err => res.status(500).json({ message: err }));
        });

        app.use((req, res) => {
            res.status(404).send('Page Not Found');
        });

        app.listen(PORT, () => {
            console.log(`Express http server listening on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error(`Unable to start the server: ${err}`);
    });
