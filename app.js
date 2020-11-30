const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const CONNECTION_URL = "YOUR_MONGO_CONNECTION_STRING";
const DATABASE_NAME = "cosmos_emulator_mongo";
const fs = require("fs");

let app = Express();
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
let database, collection;

app.get("/api/celebrities", (request, response) => {
  collection.find({}).toArray((error, result) => {
      if(error) {
          return response.status(500).send(error);
      }
      response.send(result);
  });
});

app.listen(5000, () => {
  MongoClient.connect(
    CONNECTION_URL,
    {
      useNewUrlParser: true,
      sslValidate: false,
    },
    (error, client) => {
      if (error) {
        throw error;
      }
      database = client.db(DATABASE_NAME);
      collection = database.collection("celebrities");
      collection.estimatedDocumentCount({}, (erorr, numOfRecords) => {
        if (numOfRecords <= 0) {
          fs.readFile("./info.json", "utf8", (err, data) => {
            if (err) {
              console.log(`Error reading file from disk: ${err}`);
            } else {
              // parse JSON string to JSON object
              const celebrities = JSON.parse(data);

              collection.insertMany(celebrities, (error, result) => {
                if (error) {
                  console.log(`Error in saving seed data: ${error}`);
                }

                console.log(`Seed data inserted into the database!`);
              });
            }
          });
        } else {
          console.log(`Connected to database`);
        }
      });
    }
  );
});
