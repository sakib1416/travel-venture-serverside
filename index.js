const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();


app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get("/", (req,res) => {
    res.send("Hello from the server side assignment");
});


app.listen(process.env.PORT || 5000, ()=>{
    console.log("Server started");
});