import express from "express";
import bodyParser from "body-parser";
import { MongoClient, ObjectId } from "mongodb";
import query from "./mongo"

const app = express();

app.use(bodyParser.json());
app.set('trust proxy', true);

const connectionString = process.env.DATABASE_URL;
const [, db] = connectionString.match(/mongodb.net\/(.*)$/);

const LOBBIES_COLLECTION = 'lobbies';
const LOBBIES_END_POINT = '/lobbies';

app.get('/ip', (req, res) => {
    return res.status(200).json(req.ip);
});

// app.get('/lobbies', async (req, res) => {
//     let client = null;
//     try {
//         client = new MongoClient(connectionString);
//         const database = client.db(db);
//         const collection = database.collection('lobbies');
//         let filter = {}
//         // if ('player' in req.body) filter = { player: req.body.player };
//         // if ('_id' in req.body) filter = { _id: new ObjectId(req.body._id) };
//         const result = await collection.find(filter).toArray();
//         return res.status(200).json(result)
//     } finally {
//         if (client) await client.close();
//     }
// });

app.get(LOBBIES_END_POINT, query(LOBBIES_COLLECTION, async (_, res, collection) => {
    let filter = {}
    // if ('player' in req.body) filter = { player: req.body.player };
    // if ('_id' in req.body) filter = { _id: new ObjectId(req.body._id) };
    const result = await collection.find(filter).toArray();
    return res.status(200).json(result)
}));

app.post('/lobbies', async (req, res) => {
    if (!('name' in req.body)) return res.status(400).json({ message: "Missing field 'name'!" });
    if (!('port' in req.body)) return res.status(400).json({ message: "Missing field 'port'!" });
    const name = req.body.name;
    if (!name) return res.status(400).json({ message: "Field 'name' must not be empty!" });
    const port = Number.parseInt(req.body.port);
    if (!Number.isInteger(port)) return res.status(400).json({ message: "Field 'port' must be an integer!" });
    if (port < 8100 || port > 65355) return res.status(400).json({ message: "Field 'port' must be inside (8100 .. 65355) integer interval!" });
    let client = null;
    try {
        client = new MongoClient(connectionString);
        const database = client.db(db);
        const collection = database.collection('lobbies');
        const isDuplicated = await collection.findOne({ name });
        if (isDuplicated) return res.status(400).json({ message: `A lobby with name: '${name}' already exists, please pick another!` });
        const address = req.ip;
        const status = 'open';
        const lobby = { name, address, port, status };
        const { insertedId } = await collection.insertOne(lobby);
        return res.status(201).json({ _id: insertedId, ...lobby });
    } finally {
        if (client) await client.close();
    }
});

app.delete('/lobbies/:name', async (req, res) => {
    let client = null;
    try {
        client = new MongoClient(connectionString);
        const database = client.db(db);
        const collection = database.collection('lobbies');
        const { deletedCount } = await collection.deleteOne({ name: req.params.name });
        if (!deletedCount) return res.sendStatus(404);
        return res.sendStatus(204);
    } finally {
        if (client) await client.close();
    }
});

app.delete('/lobbies', async (req, res) => {
    let client = null;
    try {
        client = new MongoClient(connectionString);
        const database = client.db(db);
        const collection = database.collection('lobbies');
        const { deletedCount } = await collection.deleteMany({});
        if (!deletedCount) return res.sendStatus(404);
        return res.sendStatus(204);
    } finally {
        if (client) await client.close();
    }
});

app.patch('/lobbies/:name', async (req, res) => {
    let client = null;
    try {
        client = new MongoClient(connectionString);
        const database = client.db(db);
        const collection = database.collection('lobbies');
        const required = ['op', 'path', 'value'];
        if (required.every((key) => key in req.body)) {
            if (req.body.op === 'replace' && req.body.path === '/status' && (req.body.value === 'open' || req.body.value === 'started')) {
                const { matchedCount, modifiedCount } = await collection.updateOne({ name: req.params.name }, { $set: { status: req.body.value } });
                if (!matchedCount) return res.sendStatus(404);
                if (!modifiedCount) return res.status(400).json({ message: 'Nothing has changed!' });
                return res.sendStatus(204);
            }
        }
        return res.status(400).json({
            message: "Request body must be a variation of this template: { 'op': 'replace', 'path': '/status',  'value': 'started|open' }!"
        });
    } finally {
        if (client) await client.close();
    }
});

export default app;
