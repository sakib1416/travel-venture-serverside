const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const fileUpload = require('express-fileupload');
//const { ObjectID } = require('bson');


app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//file upload images for admins
app.use(express.static('admins'));
app.use(fileUpload());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yfcjm.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const serviceCollection = client.db(`${process.env.DB_NAME}`).collection("services");
  const reviewCollection = client.db(`${process.env.DB_NAME}`).collection("reviews");
  const orderCollection = client.db(`${process.env.DB_NAME}`).collection("orders");
  const adminCollection = client.db(`${process.env.DB_NAME}`).collection("admins");
  const userCollection = client.db(`${process.env.DB_NAME}`).collection("users");

  app.post("/addReviews", (req,res) => {
      const review = req.body;
      reviewCollection.insertOne(review)
      .then(result => {
          res.send(result.insertedCount > 0);
      })
  });

  app.post("/addAdmin", (req,res) => {
     const admin = req.body;
     console.log(admin);
     userCollection.insertOne(admin)
     .then(result => {
        res.send(result.insertedCount > 0)
    })
  });

  //fetching the latest 3 reviews
  app.get("/reviews", (req,res) => {
    reviewCollection.find().sort( { posted : -1}).limit(3)
    .toArray((err, documents) => {
        res.send(documents);
    })
  });

  //fetching reviews for a particular service
  app.get("/services/reviews/:id", (req,res) => {
    const id = req.params.id;
    reviewCollection.find({serviceID: id}).sort( { posted : -1})
    .toArray((err, documents) => {
      res.send(documents);
  })
  })

  //fetching reviews for a particular user
  app.post("/user/reviews", (req,res) => {
    const userEmail = req.body.email;
    reviewCollection.find({reviewerEmail: userEmail})
    .toArray((err,documents) => {
      res.send(documents);
    })
  })

  app.post("/addService", (req,res) => {
      const service = req.body;
    serviceCollection.insertOne(service)
    .then(result => {
        res.send(result.insertedCount > 0)
    })
  });

  // adding a user
  app.post("/addUser", (req,res) => {
    const user = req.body;
    console.log(user);
  userCollection.insertOne(user)
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

  //looking for orders for a particular user
  app.post("/orders", (req,res) => {
      const orderEmail = req.body.email;
    orderCollection.find({'user.email': orderEmail})
    .toArray((err, documents) => {
        res.send(documents);
    })
  });

//looking for orders for a particular user
  app.post("/order", (req,res) => {
    const userEmail = req.body.userEmail;
    const orderID = req.body.orderID;
    // console.log(userEmail, orderID);
    orderCollection.findOne({
      $and: [
        {'user.email': userEmail},
        {'product._id': orderID}
      ]
    })
    .then(result => {
      // console.log(result)
      res.send(result);
    })
  })

  //deleting a review
  app.delete("/delete/review/:id", (req,res) => {
      const id = ObjectID(req.params.id);
      reviewCollection.deleteOne({_id: id})
      .then(result => {
          console.log(result)
          res.send(!!result.value);
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

  
  app.get("/admins", (req,res) => {
      adminCollection.find()
      .toArray((err, documents) => {
        res.send(documents);
    });
  });

  app.post("/isAdmin", (req,res) => {
      const admin = req.body.email;
      userCollection.findOne({email: admin}, {isAdmin: true})
    .then(result => {
        console.log(result);
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