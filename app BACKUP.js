const express = require('express');
const path = require('path');
const app = express();
const moment = require('moment');
const axios = require('axios');		// apparently needed for Flask
const PORT = process.env.PORT || 5000;
const logger = (req, res, next) => {
	console.log(`${req.protocol}://${req.get('host')}${req.originalUrl}:${moment().format()}`);
	next();
}

// used for console output
app.use(logger);
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.listen(PORT, () =>	{
	console.log(`server is started in port ${PORT}`);
})

// fetch data from Flask API (GET)
app.get('/flask-data', async(req, res) => {
    try{
        const response = await axios.get('http://localhost:4000/api/data');
        res.json(response.data);
    }catch(err){
        console.error(err.message);
        res.status(500).send('Error connecting to Flask API');
    }
});

// send data to Flask API (POST)
app.post('/flask-echo', async(req, res) => {
    try{
        const response = await axios.post('http://localhost:4000/api/echo', req.body);
        res.json(response.data);
    }catch(err){
        console.error(err.message);
        res.status(500).send('Error posting to Flask API');
    }
});

// start server
app.listen(PORT, () => {
    console.log(`Express server is running on port ${PORT}`);
});