import { MongoClient } from "mongodb";

const CONNECTION_STRING = process.env.DATABASE_URL;
const [, DATA_BASE_NAME] = CONNECTION_STRING.match(/mongodb.net\/(.*)$/);

export default function query(collection, work) {
    return async (req, res) => {
        let client = null;
        try {
            client = new MongoClient(CONNECTION_STRING);
            const database = client.db(DATA_BASE_NAME);
            const mongoCollection = database.collection(collection);
            return work(req, res, mongoCollection)
        } finally {
            if (client) await client.close();
        }
    }
}
