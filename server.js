"use strict";

const express = require("express");
const cors = require("cors");
const axios = require("axios").default;
require("dotenv").config();

const cardData = require("./Card_Data/data.json");

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
app.post('/addNewCard', addNewCardHandler);//*

app.get('/getAllCards', getCardsHandler); //For Us , Locally //*
app.get('/getCards/:category', getCardsByCategoryHandler);

app.put('/updateCard/:id', updateCardHandler); //For Us , Locally//*
app.put('/updateFavorite/:id', updateHandler);

app.delete('/deleteCard/:id', deleteCardHandler); //For Us , Locallyrrr //*

app.use(handleServerError);
app.use(handleNotFoundError);

class Card {
    constructor(card_name, card_category, card_level, job_title, img, portfolio) {
        this.card_name = card_name;
        this.card_category = card_category;
        this.card_level = card_level;
        this.job_title = job_title;
        this.img = img;
        this.portfolio = portfolio;
    }
}

function homeHandler(req, res) {
    res.send("WELCOME IN OUR ICONIC PROJECT");
}

function addLocallyDataHandler(req, res) {
    const allCardsData = cardData.map((item) => {
        return new Card(
            item.name,
            item.category,
            item.level,
            item.job_title,
            item.image,
            item.portfolio
        );
    });

    for (const card of allCardsData) {
        let sql =
            "INSERT INTO card( card_name, card_category, card_level, job_title, img, portfolio) VALUES($1, $2, $3, $4, $5, $6) RETURNING *;"; // sql query
        let values = [
            card.card_name,
            card.card_category,
            card.card_level,
            card.job_title,
            card.img,
            card.portfolio,
        ];
        client
            .query(sql, values)
            .then((result) => {
                // console.log(result.rows);
                return res.status(201).json(result.rows);
            })
            .catch((error) => {
                handleServerError(error, req, res);
                console.log(error.message);
            });
    }
}

function addNewCardHandler(req, res) {
    console.log(req.body)
    //to collect the data:
    //const title= req.body.title;
    //const time= req.body.time;
    //const image= req.body.image;

    const { card_name, card_category, card_level, job_title, img, portfolio } = req.body //destructuring ES6
    const sql = `INSERT INTO card (card_name, card_category, card_level, job_title, img, portfolio)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`
    const values = [card_name, card_category, card_level, job_title, img, portfolio]
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
    const sql = `SELECT * FROM card;`

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
    let cardId = req.params.id;
    let { card_name, card_category, card_level, job_title, img, portfolio } = req.body;
    let sql = `UPDATE card
         SET card_name = $1, card_category = $2, card_level = $3, job_title = $4, img = $5, portfolio= $6
             WHERE id = $7;`;
    let values = [card_name, card_category, card_level, job_title, img, portfolio, cardId];

    client.query(sql, values)
        .then(result => {
            console.log('card updated:');
            res.status(200).send("successfully ubdate")
        })
        .catch(error => {
            console.error('Error updating a card:', error);
            res.status(500).send('Error updating card');
        });
}

function deleteCardHandler(req, res) {
    const { id } = req.params;
    const sql = 'DELETE FROM card WHERE id = $1;';
    const valuse = [id];

    client.query(sql, valuse)
        .then(result => {
            console.log('card deleted:');
            res.status(204).send("successfully Deleted");

        })
        .catch(error => {
            console.error('Error deleting a card:', error);
            res.status(500).send('Error deleting card');
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