let express = require('express');
let mongoose = require('mongoose');

const {ethers} = require("ethers");

const {abi} = require('./Factory.json');
const {factoryAddress, RPCUrl} = require("./config.json");


let app = express();

mongoose.connect("mongodb://127.0.0.1:27017/events", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err) => {
    if (err) {
        console.log("db connection error");
    } else {
        console.log("connected to db");
    }
});

const collectionCreatedEvent = new mongoose.Schema({
    collectionAddress: String,
    name: String,
    symbol: String,
    eventData: {}
})

const tokenMintedEvent = new mongoose.Schema({
    collectionAddress: String,
    recipient: String,
    tokenId: {},
    tokenUri: String,
    eventData: {}
});


const collectionCreatedModel = mongoose.model('collectionCreatedEvent', collectionCreatedEvent);
const tokenMintedModel = mongoose.model('tokenMintedEvent', tokenMintedEvent);

async function listenEvents() {
    const provider = new ethers.providers.JsonRpcProvider(RPCUrl);

    const factory = new ethers.Contract(factoryAddress, abi, provider);

    factory.on('CollectionCreated', async (collection, name, symbol, event) => {
        let collectionCreated = {
            collectionAddress: collection,
            name: name,
            symbol: symbol,
            eventData: event
        }
        console.log(JSON.stringify(collectionCreated));

        let data = new collectionCreatedModel(collectionCreated);
        let savedData = await data.save();
        console.log(savedData._id);
    });

    factory.on('TokenMinted', async (collection, recipient, tokenId, tokenUri, event) => {
        let tokenMinted = {
            collectionAddress: collection,
            recipient: recipient,
            tokenId: tokenId,
            tokenUri: tokenUri,
            eventData: event
        }

        console.log(JSON.stringify(tokenMinted));

        let data = new tokenMintedModel(tokenMinted);
        let savedData = await data.save();
        console.log(savedData._id)
    });
}

app.get('/last_events/:eventName/:num', async (req, res) => {
    const {num} = req.params;
    const {eventName} = req.params;
    const events = {
        collection_created: collectionCreatedModel,
        token_minted: tokenMintedModel
    }
    const event = events[eventName];
    if (event === undefined) {
        res.status(400).send("Wrong event name")
        return;
    }
    let data = await event.find({}, {}).sort({_id: -1}).limit(num);
    res.send(data);
})

listenEvents();

const host = '0.0.0.0';
const port = 8080;
app.listen(port, () => {
    console.log(`Server listens http://${host}:${port}`)
});
