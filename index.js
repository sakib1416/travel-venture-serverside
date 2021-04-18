const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;


app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yfcjm.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const serviceCollection = client.db(`${process.env.DB_NAME}`).collection("services");
  const reviewCollection = client.db(`${process.env.DB_NAME}`).collection("reviews");

  app.post("/addReviews", (req,res) => {
      const review = req.body;
      reviewCollection.insertOne(review)
      .then(result => {
          res.send(result.insertedCount > 0);
      })
  });

  app.get("/reviews", (req,res) => {
    reviewCollection.find()
    .toArray((err, documents) => {
        res.send(documents);
    })
  })
  console.log("Database connected checked");
});


app.get("/", (req,res) => {
    res.send("Hello from the server side assignment");
});


app.listen(process.env.PORT || 5000, ()=>{
    console.log("Server started");
});