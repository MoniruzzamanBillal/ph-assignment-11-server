const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
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

    // get all menus
    app.get("/menus", async (req, res) => {
      console.log("hit in menu");

      const { dataPerPage, currentPage } = req.query;

      const perpageData = parseInt(dataPerPage);
      const currentActive = parseInt(currentPage);

      console.log(perpageData);
      console.log(currentActive);

      const skip = currentActive * perpageData;

      const response = menusCollection.find().skip(skip).limit(perpageData);
      const data = await response.toArray();

      res.send(data);
    });

    // count total data from all menus
    app.get("/productCount", async (req, res) => {
      const count = await menusCollection.estimatedDocumentCount();

      //   console.log(count);

      res.send({ count: count });
    });

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
