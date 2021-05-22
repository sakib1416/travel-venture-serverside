const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
//const { ObjectID } = require('bson');


app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yfcjm.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const serviceCollection = client.db(`${process.env.DB_NAME}`).collection("services");
  const reviewCollection = client.db(`${process.env.DB_NAME}`).collection("reviews");
  const orderCollection = client.db(`${process.env.DB_NAME}`).collection("orders");
  const adminCollection = client.db(`${process.env.DB_NAME}`).collection("admins");

  app.post("/addReviews", (req,res) => {
      const review = req.body;
      reviewCollection.insertOne(review)
      .then(result => {
          res.send(result.insertedCount > 0);
      })
  });

  app.get("/reviews", (req,res) => {
    reviewCollection.find().sort( { posted : -1}).limit(3)
    .toArray((err, documents) => {
        res.send(documents);
    })
  });

  app.post("/addService", (req,res) => {
      const service = req.body;
    serviceCollection.insertOne(service)
    .then(result => {
        res.send(result.insertedCount > 0)
    })
  });

  app.get("/services", (req,res) => {
      //sorting with the most recent
    serviceCollection.find().sort( { created : -1}).limit(3)
    .toArray((err, documents) => {
        res.send(documents)
    })
  });

  //updating a service
  app.patch("/update/:id", (req,res) => {
      console.log(req.body);
      const id = ObjectID(req.params.id);
      //be careful with the $set
      serviceCollection.updateOne({_id: id}, {
          $set: {packageName: req.body.name, packagePrice: req.body.price, packageDescription: req.body.description}
      })
      .then(result => res.send(result))
  })

  //deleting a service
  app.delete("/delete/:id", (req,res) => {
    const id = ObjectID(req.params.id);
    console.log('delete this', id);
    serviceCollection.deleteOne({_id: id})
    .then(documents => res.send(!!documents.value))
  })

  //showing a single service
  app.get("/service/:id", (req,res) => {
      const id = ObjectID(req.params.id);
      serviceCollection.findOne({_id: id})
      .then(result => {
          res.send(result);
      })
  });

  

  app.post("/addOrder", (req,res) => {
      const newOrder = req.body;
      console.log(newOrder);
      orderCollection.insertOne(newOrder)
      .then(result => {
          res.send(result.insertedCount>0)
      })
  });

  app.get("/orders", (req,res) => {
    orderCollection.find()
    .toArray((err, documents) => {
        res.send(documents);
    })
  });

  //deleting a review
  app.delete("/delete/review/:id", (req,res) => {
      const id = ObjectID(req.params.id);
      reviewCollection.deleteOne({_id: id})
      .then(result => {
          console.log(result)
          res.send(!!result.value)
      })
  })

  //showing a single review
  app.get("/review/:id", (req,res) => {
      const id = ObjectID(req.params.id);
      reviewCollection.findOne({_id: id})
      .then(result => res.send(result));
  })

  //updating review
  app.patch("/update/review/:id", (req,res) => {
      const id = ObjectID(req.params.id);
      reviewCollection.updateOne({_id: id}, 
        {$set: {name: req.body.name, country: req.body.country, review: req.body.review}
      })
      .then(result => res.send(result.modifiedCount > 0))
  })

  app.post("/addAdmin", (req,res) => {
    const admin = req.body.email;
    adminCollection.insertOne(admin)
    .then(result => {
        res.send(result.insertedCount > 0)
    })
  });

  app.post("/isAdmin", (req,res) => {
      const admin = req.body.email;
    adminCollection.findOne({email: admin})
    .then(result => {
        res.send(result);
    })
  })

  app.get("/single/service/:id", (req,res) => {
      const id = ObjectID(req.params.id);
      serviceCollection.findOne({_id: id})
      .then(result => res.send(result));
  })

    //delete service
    
  console.log("Database connected checked");
});




app.get("/", (req,res) => {
    res.send("Hello from the server side assignment checking for git");
});


app.listen(process.env.PORT || 5000, ()=>{
    console.log("Server started");
});