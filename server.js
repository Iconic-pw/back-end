"use strict";

const express = require("express");
const cors = require("cors");
const axios = require("axios").default;
require("dotenv").config();

const movieData = require("./Movie Data/data.json");

//const apiKey = process.env.API_KEY;
const pgUrl = process.env.DATABASE_URL;
const PORT = process.env.PORT || 3002;//3000

//for query in js file using pg package
const { Client } = require("pg");
const client = new Client(pgUrl);
//OR use this way
// const pg = require("pg");
// const client2 = pg.Client(pgUrl);

const app = express();

app.use(cors());
//for parsing body
app.use(express.json());

app.get('/', homeHandler); //For Us , Locally

app.post('/addLocallyData', addLocallyDataHandler); //For Us , Locally
app.post('/addNewCard', addNewCardHandler);

app.get('/getAllCards', getCardsHandler); //For Us , Locally
app.get('/getCards/:category', getCardsByCategoryHandler);

app.put('/updateCard/:id', updateCardHandler); //For Us , Locally
app.put('/updateFavorite/:id', updateHandler);

app.delete('/deleteCard/:id', deleteCardHandler); //For Us , Locally

app.use(handleServerError);
app.use(handleNotFoundError);



function homeHandler(req, res) {
    res.send("WELCOME IN OUR ICONIC PROJECT");
}

function addLocallyDataHandler(req, res) {
    console.log(req.body)
    //to collect the data:
    //const title= req.body.title;
    //const time= req.body.time;
    //const image= req.body.image;

    const { title, release_date, poster_path, overview, personal_comment } = req.body //destructuring ES6
    const sql = `INSERT INTO tMovie (title, release_date, poster_path, overview, personal_comment)
    VALUES ($1, $2, $3, $4, $5) RETURNING *;`
    const values = [title, release_date, poster_path, overview, personal_comment]
    client.query(sql, values).then((result) => {
        console.log(result.rows);
        res.status(201).json(result.rows)
    }).catch()


    // res.send("data recived");
}

function addNewCardHandler(req, res) {
    console.log(req.body)
    //to collect the data:
    //const title= req.body.title;
    //const time= req.body.time;
    //const image= req.body.image;

    const { title, release_date, poster_path, overview, personal_comment } = req.body //destructuring ES6
    const sql = `INSERT INTO tMovie (title, release_date, poster_path, overview, personal_comment)
    VALUES ($1, $2, $3, $4, $5) RETURNING *;`
    const values = [title, release_date, poster_path, overview, personal_comment]
    client.query(sql, values).then((result) => {
        console.log(result.rows);
        res.status(201).json(result.rows)
    }).catch()


    // res.send("data recived");
}

function updateHandler(req, res) {
    console.log(req.body)
    //to collect the data:
    //const title= req.body.title;
    //const time= req.body.time;
    //const image= req.body.image;

    const { title, release_date, poster_path, overview, personal_comment } = req.body //destructuring ES6
    const sql = `INSERT INTO tMovie (title, release_date, poster_path, overview, personal_comment)
    VALUES ($1, $2, $3, $4, $5) RETURNING *;`
    const values = [title, release_date, poster_path, overview, personal_comment]
    client.query(sql, values).then((result) => {
        console.log(result.rows);
        res.status(201).json(result.rows)
    }).catch()


    // res.send("data recived");
}

function getCardsHandler(req, res) {
    const sql = `SELECT * FROM tMovie;`

    client.query(sql).then((result) => {
        const data = result.rows
        res.json(data)
    })
        .catch()
}

function getCardsByCategoryHandler(req, res) {
    const sql = `SELECT * FROM tMovie;`

    client.query(sql).then((result) => {
        const data = result.rows
        res.json(data)
    })
        .catch()
}

function updateCardHandler(req, res) {
    // console.log(req.params)
    let movieId = req.params.movieId;
    let { title, release_date, poster_path, overview, personal_comment } = req.body;
    let sql = `UPDATE tMovie
         SET title = $1, release_date = $2, poster_path = $3, overview = $4, personal_comment = $5
             WHERE id = $6;`;
    let values = [title, release_date, poster_path, overview, personal_comment, movieId];

    client.query(sql, values)
        .then(result => {
            console.log('tMovie updated:');
            res.status(200).send("successfully ubdate")
        })
        .catch(error => {
            console.error('Error updating a tMovie:', error);
            res.status(500).send('Error updating tMovie');
        });
}

function deleteCardHandler(req, res) {
    const { id } = req.params;
    const sql = 'DELETE FROM tMovie WHERE id = $1;';
    const valuse = [id];

    client.query(sql, valuse)
        .then(result => {
            console.log('tMovie deleted:');
            res.status(204).send("successfully Deleted");

        })
        .catch(error => {
            console.error('Error deleting a movie:', error);
            res.status(500).send('Error deleting movie');
        });
}

function handleServerError(req, res) {
    res.status(500).json({
        status: 500,
        responseText: 'Sorry, something went wrong'
    });
}

function handleNotFoundError(req, res) {
    res.status(404).json({
        status: 404,
        responseText: 'Page not found'
    });
}

//listener
client.connect().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is listening ${PORT}`);
    })
}
).catch()