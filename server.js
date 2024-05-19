"use strict";

const express = require("express");
const cors = require("cors");
const axios = require("axios").default;
require("dotenv").config();

const cardData = require("./Card_Data/data.json");

//const apiKey = process.env.API_KEY;
const pgUrl = process.env.DATABASE_URL;
const PORT = process.env.PORT || 3002; //3000

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

app.get("/", homeHandler); //For Us , Locally

app.post("/addLocallyData", addLocallyDataHandler); //For Us , Locally *
app.post("/addNewCard", addNewCardHandler);
app.post("/addAboutUsCard", addAboutUsCardHandler); // For Us , Locally *

app.get("/getAllCards", getCardsHandler); //For Us , Locally
app.get("/getCards/:category", getCardsByCategoryHandler); // *
app.get("/getOurCards", getOurCardsHandler);

app.put("/updateCard/:id", updateCardHandler); //For Us , Locally
app.put("/updateFavorite/:id", updateHandler); //*

app.delete("/deleteCard/:id", deleteCardHandler); //For Us , Locallyrrr //*
app.delete("/deleteAllCards", deleteAllCardsHandler); //For Us , Locally *

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
/* 
    Get data from data.json file 
*/
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

    /*
    the response is sent only once, after all the insert operations have completed successfully. 
    
    */
    const insertPromises = allCardsData.map((card) => {
        let sql =
            "INSERT INTO card (card_name, card_category, card_level, job_title, img, portfolio) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;";
        let values = [
            card.card_name,
            card.card_category,
            card.card_level,
            card.job_title,
            card.img,
            card.portfolio,
        ];

        return client.query(sql, values);
    });
    /*
  The Promise.all function is called with the insertPromises array. 
  This function waits for all the promises to either fulfill or reject.
  */
    Promise.all(insertPromises)
        .then((results) => {
            // The inserted cards are collected in an array and sent as the response using res.status(201).json(insertedCards).
            const insertedCards = results.map((result) => result.rows[0]);
            res.status(201).json(insertedCards);
        })
        .catch((error) => {
            handleServerError(error, req, res);
        });
}

function addNewCardHandler(req, res) {
    console.log(req.body);
    //to collect the data:
    //const title= req.body.title;
    //const time= req.body.time;
    //const image= req.body.image;

    const { card_name, card_category, card_level, job_title, img, portfolio } =
        req.body; //destructuring ES6
    const sql = `INSERT INTO card (card_name, card_category, card_level, job_title, img, portfolio)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`;
    const values = [
        card_name,
        card_category,
        card_level,
        job_title,
        img,
        portfolio,
    ];
    client
        .query(sql, values)
        .then((result) => {
            console.log(result.rows);
            res.status(201).json(result.rows);
        })
        .catch();

    // res.send("data recived");
}

function addAboutUsCardHandler(req, res) {
    const { name, describtion, img, portfolio } = req.body; //destructuring ES6
    const sql = `INSERT INTO about_us (my_name, describtion, img, portfolio)
    VALUES ($1, $2, $3, $4) RETURNING *;`;
    const values = [name, describtion, img, portfolio];
    client
        .query(sql, values)
        .then((result) => {
            console.log(result.rows);
            res.status(201).json(result.rows);
        })
        .catch((error) => {
            handleServerError(error, req, res);
            console.log(error);
        });
}

/*update the value of the is_fav to true if the user clicked on add to favorites 
    and to false if the user clicked on delete from favorites.
*/
function updateHandler(req, res) {
    const id = req.params.id;
    const { is_fav } = req.body;

    const sql = `UPDATE card
    SET is_fav=$1
    WHERE id=$2 RETURNING *;`;

    let values = [is_fav, id];
    client
        .query(sql, values)
        .then((result) => {
            res.status(200).json(result.rows);
        })
        .catch((error) => {
            handleServerError(error, req, res);
            console.log(error);
        });
}
//Our data in about us page.
function getOurCardsHandler(req, res) {
    const sql = `SELECT * FROM about_us;`;

    client
        .query(sql)
        .then((result) => {
            const data = result.rows;
            res.json(data);
        })
        .catch((error) => {
            handleServerError(error, req, res);
            console.log(error);
        });
}

function getCardsHandler(req, res) {
    const sql = `SELECT * FROM card;`;

    client
        .query(sql)
        .then((result) => {
            const data = result.rows;
            res.json(data);
        })
        .catch();
}

function getCardsByCategoryHandler(req, res) {
    const category = req.params.category;
    const sql = `SELECT * FROM card WHERE card_category = $1;`;
    let values = [category];
    client
        .query(sql, values)
        .then((result) => {
            const data = result.rows;
            res.json(data);
        })
        .catch();
}

function updateCardHandler(req, res) {
    // console.log(req.params)
    let cardId = req.params.id;
    let { card_name, card_category, card_level, job_title, img, portfolio } =
        req.body;
    let sql = `UPDATE card
         SET card_name = $1, card_category = $2, card_level = $3, job_title = $4, img = $5, portfolio= $6
             WHERE id = $7;`;
    let values = [
        card_name,
        card_category,
        card_level,
        job_title,
        img,
        portfolio,
        cardId,
    ];

    client
        .query(sql, values)
        .then((result) => {
            console.log("card updated:");
            res.status(200).send("successfully ubdate");
        })
        .catch((error) => {
            console.error("Error updating a card:", error);
            res.status(500).send("Error updating card");
        });
}

function deleteCardHandler(req, res) {
    const { id } = req.params;
    const sql = "DELETE FROM card WHERE id = $1;";
    const valuse = [id];

    client
        .query(sql, valuse)
        .then((result) => {
            console.log("card deleted:");
            res.status(204).send("successfully Deleted");
        })
        .catch((error) => {
            console.error("Error deleting a card:", error);
            res.status(500).send("Error deleting card");
        });
}

function deleteAllCardsHandler(req, res) {
    const sql = "DELETE FROM card";

    client
        .query(sql)
        .then(() => {
            res.status(200).json({ message: "All data deleted successfully" });
        })
        .catch((error) => {
            handleServerError(error, req, res);
            console.log(error);
        });
}
function handleServerError(error, req, res) {
    const err = {
        status: 500,
        massage: error,
    };
    res.status(500).send(err);
}

function handleNotFoundError(error, req, res) {
    const err = {
        status: 404,
        massage: error,
    };
    res.status(404).send(err);
}

//listener
client
    .connect()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is listening ${PORT}`);
        });
    })
    .catch();