const express = require('express')
const app = express()
const port = 5000
const ObjectId = require('mongodb').ObjectId;

/* ==== cors ==== */
const cors = require("cors");
app.use(cors());
app.use(express.json());

/* ==== dotenv ==== */
require('dotenv').config();

/* ==== mongoDB connect ==== */

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kniae.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
    console.log('Hit the DB')
});

/* create API */
async function run() {
    try {
        await client.connect();
        const database = client.db("jerin-parlour");
        const serviceCollection = database.collection("services");
        const bookingCollection = database.collection("booking");
        const usersCollection = database.collection("users");

        // get products
        app.get('/services', async (req, res)=>{
            const services = serviceCollection.find({});
            const result = await services.toArray();
            res.json(result);
        });

        // booking
        app.post('/booking', async (req, res)=>{
            const newBooking = req.body;
            const result = await bookingCollection.insertOne(newBooking);
            res.send(result);
        })

        // sent booking list according to the user
        app.get('/booking/:emailId', async (req, res)=>{
            const customerEmail = req.params.emailId;
            const query = { email: customerEmail };
            const customerBooking = bookingCollection.find(query);
            const result = await customerBooking.toArray();
            res.json(result);
        });

        // send all order list
        app.get('/order-list', async (req, res)=>{
            const orderList = bookingCollection.find({});
            const result = await orderList.toArray();
            res.json(result);
        });

        // update order status
        app.put('/update-order-status/:id', async (req, res)=>{
            const id = req.params.id;
            const updateDoc = req.body.status;
            const query = {_id: ObjectId(id)};
            const result = await bookingCollection.updateOne(
            query, 
            {$set:
                {
                    bookingStatus : updateDoc
                }
            }
            );
            res.send(result);
        });

        // subscriber
        app.post('/users', async (req, res)=>{
            const newUser = req.body;
            const result = await usersCollection.insertOne(newUser);
            res.send(result);
        })

        // check admin
        app.get('/admin/:emailId', async (req, res)=>{

            const adminEmail = req.params.emailId;
            const query = { email: adminEmail };
            const options = {
                "status": 'admin'
            }
            const checkAdmin = await usersCollection.findOne(query, options);
            res.json(checkAdmin);
        })

        
    } finally {
        // await client.close();
    }
}
run().catch(console.dir); 



app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})