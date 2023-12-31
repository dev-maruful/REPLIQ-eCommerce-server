const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.s92qhby.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // collections
    const usersCollection = client.db("repliqEcommerce").collection("users");
    const productsCollection = client
      .db("repliqEcommerce")
      .collection("products");
    const cartProductsCollection = client
      .db("repliqEcommerce")
      .collection("cartProducts");

    // user related APIs

    // get specific user by email
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    // get specific user by id
    app.get("/usersId/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    // get all the users
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // create user API
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user?.email };
      const existingUser = await usersCollection.findOne(query);

      if (existingUser) {
        return res.send({ message: "user already exists" });
      }

      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // product related APIs

    // get products from cart products
    app.get("/cartProducts/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await cartProductsCollection.find(query).toArray();
      res.send(result);
    });

    // delete product from cart
    app.delete("/cartProducts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartProductsCollection.deleteOne(query);
      res.send(result);
    });

    // product add to cart API
    app.post("/cartProducts", async (req, res) => {
      const cartProduct = req.body;
      const query = { name: cartProduct.name, email: cartProduct.email };
      const existingProduct = await cartProductsCollection.findOne(query);

      if (existingProduct) {
        return res.send({ message: "Product already added to cart" });
      }

      const result = await cartProductsCollection.insertOne(cartProduct);
      res.send(result);
    });

    // get all the products
    app.get("/products", async (req, res) => {
      const result = await productsCollection.find().toArray();
      res.send(result);
    });

    // get single product
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    // add product API
    app.post("/products", async (req, res) => {
      const product = req.body;
      const query = { name: product?.name };
      const existingProduct = await productsCollection.findOne(query);

      if (existingProduct) {
        return res.send({ message: "product already added" });
      }

      const result = await productsCollection.insertOne(product);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("REPLICA server running");
});

app.listen(port, () => {
  console.log(`REPLICA listening on port: ${port}`);
});
