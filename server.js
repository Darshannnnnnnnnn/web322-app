/*********************************************************************************
* WEB322 – Assignment 03
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name:Darshan Kalpeshbhai Prajapati Student ID: 112908215 Date: 5th July 2024
*
* Vercel Web App URL: ________________________________________________________
*
* GitHub Repository URL: ______________________________________________________
*
********************************************************************************/
const express = require('express');
const path = require('path');
const storeService = require('./store-service');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const app = express();
const PORT = process.env.PORT || 8080;

// Cloudinary configuration
cloudinary.config({
    cloud_name: 'dh453rnwm',
    api_key: '623722143492837',
    api_secret: 'MMbPRCMxYwswR9YIfhK_pL5vBMA',
    secure: true
});

// Multer upload configuration
const upload = multer();

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect('/about');
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/items/add', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'addItem.html'));
});

app.post('/items/add', upload.single('featureImage'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };

    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
    }

    upload(req)
        .then((uploaded) => {
            processItem(uploaded.url, req.body, res); // Pass res object to processItem
        })
        .catch((err) => {
            console.error('Upload Error:', err);
            res.status(500).json({ message: 'Failed to upload image to Cloudinary' });
        });
});

function processItem(imageUrl, formData, res) { // Accept res parameter
    formData.featureImage = imageUrl; // Update the formData with the Cloudinary image URL
    storeService.addItem(formData)
        .then(() => {
            console.log('Item added successfully');
            res.redirect('/items');
        })
        .catch((err) => {
            console.error('Failed to add item:', err);
            res.status(500).json({ message: 'Failed to add item to store' });
        });
}

app.get('/items', (req, res) => {
    storeService.getAllItems()
        .then((items) => {
            res.json(items);
        })
        .catch((err) => {
            res.status(500).json({ message: err });
        });
});

app.get('/items/:id', (req, res) => {
    const itemId = req.params.id;
    storeService.getItemById(itemId)
        .then((item) => {
            res.json(item);
        })
        .catch((err) => {
            res.status(404).json({ message: err });
        });
});

app.get('/items/filter', (req, res) => {
    const { category, minDate } = req.query;

    if (category) {
        storeService.getItemsByCategory(parseInt(category))
            .then((filteredItems) => {
                res.json(filteredItems);
            })
            .catch((err) => {
                res.status(404).json({ message: err });
            });
    } else if (minDate) {
        storeService.getItemsByMinDate(minDate)
            .then((filteredItems) => {
                res.json(filteredItems);
            })
            .catch((err) => {
                res.status(404).json({ message: err });
            });
    } else {
        storeService.getAllItems()
            .then((items) => {
                res.json(items);
            })
            .catch((err) => {
                res.status(500).json({ message: err });
            });
    }
});

storeService.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Express http server listening on port ${PORT}`);
        });
    })
    .catch(err => {
        console.log("Unable to start server: " + err);
    });
