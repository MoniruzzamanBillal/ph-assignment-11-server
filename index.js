const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId, upsert } = require("mongodb");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 5000;

// resto
// fCIrwFhJ0z0Ky5qM

console.log(process.env.DB_PASS);
console.log(process.env.DB_USER);

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// mongo db configurations

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@coffeemaster.pnefqpd.mongodb.net/?retryWrites=true&w=majority`;
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
    const database = client.db("Resto");
    const menusCollection = database.collection("all-menus");
    const cartCellection = database.collection("cart");
    const orderCollection = database.collection("order");

    // get all menus pagination
    app.get("/menus", async (req, res) => {
      // console.log("hit in menu");

      const { dataPerPage, currentPage } = req.query;

      const perpageData = parseInt(dataPerPage);
      const currentActive = parseInt(currentPage);
      const skip = (currentActive - 1) * perpageData;

      const response = menusCollection.find().skip(skip).limit(perpageData);
      const data = await response.toArray();

      res.send(data);
    });

    app.get("/searchMenu", async (req, res) => {
      const response = await menusCollection.find().toArray();
      res.send(response);
    });

    // count total data from all menus
    app.get("/productCount", async (req, res) => {
      const count = await menusCollection.estimatedDocumentCount();
      res.send({ count: count });
    });

    // get specific data based on id
    app.get("/menu/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);

      const query = { _id: new ObjectId(id) };

      const response = await menusCollection.findOne(query);

      // console.log(response);

      res.send(response);
    });

    //  update menu item
    app.patch("/update/:id", async (req, res) => {
      const id = req.params.id;

      const updatedData = req.body;

      const query = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const update = {
        $set: {
          ...updatedData,
        },
      };
      const result = await menusCollection.updateOne(query, update, option);
      res.send(result);

      //
    });

    // add new item
    app.post("/addNew", async (req, res) => {
      const body = req.body;
      // console.log("hit in add api ", body);

      const result = await menusCollection.insertOne(body);
      res.send(result);
    });

    // !
    // !
    // !
    // !
    // !
    // !
    // !
    // app.post("/updateAll", async (req, res) => {
    //   const updatedData = req.body;
    //   const result = await orderCollection.insertMany(updatedData);
    //   res.send(result);
    // });
    app.put("/updateAll", async (req, res) => {
      const updatedDataArray = req.body;
      const results = [];
      for (const updatedData of updatedDataArray) {
        const id = updatedData._id; // Assuming each data item has an _id field
        delete updatedData._id;
        const query = { _id: new ObjectId(id) };
        const option = { upsert: true };
        const update = {
          $set: {
            updatedData,
          },
        };

        const result = await orderCollection.updateOne(query, update, option);
        results.push(result);
      }

      res.send(results);
    });

    // get all order items
    app.get("/order", async (req, res) => {
      const response = await orderCollection.find().toArray();
      const uniqueObjectId = new ObjectId();

      res.send(response);
    });

    // !
    // !
    // !
    // !
    // !
    // !
    // !
    // !
    // !

    //  ? ==================cart section api =================

    // add item in cart

    app.patch("/addCart", async (req, res) => {
      console.log("hit in add cart ");

      const { id, orderQuantity, byuer } = req.body;

      const query = { _id: new ObjectId(id) };
      const expectedData = await menusCollection.findOne(query);
      const withUID = { ...expectedData, orderQuantity, byuer };
      const option = { upsert: true };

      const update = {
        $set: {
          ...withUID,
        },
      };

      const result = await cartCellection.updateOne(query, update, option);

      res.send(result);
    });

    // for gettingcart data
    app.get("/cartData", async (req, res) => {
      // console.log(req.query);

      let query = {};

      if (req?.query?.email) {
        query = {
          byuer: req.query.email,
        };
      }

      const response = await cartCellection.find(query).toArray();

      console.log(response);

      res.send(response);
    });

    // delete from cart
    app.delete(`/cartData/:id`, async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await cartCellection.deleteOne(query);
      res.send(result);
    });

    // delete all cart items
    app.delete("/cartDelete", async (req, res) => {
      const response = await cartCellection.deleteMany();

      res.send(response);
    });

    //
    //

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

// mongo db configurations

app.get("/", (req, res) => {
  res.send("Your resto server is running ");
});

app.listen(port, () => {
  console.log(`listening from port ${port} `);
});
