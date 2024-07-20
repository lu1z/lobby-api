import { MongoClient } from 'mongodb';
import {
    CONNECTION_STRING,
    DATA_BASE_NAME,
} from './constants.js'

export default function (collectionName, routeWork) {
    return async (req, res) => {
        let client = null;
        try {
            client = new MongoClient(CONNECTION_STRING);
            const database = client.db(DATA_BASE_NAME);
            const collection = database.collection(collectionName);
            return await routeWork(req, res, collection);
        } finally {
            if (client) await client.close();
        }
    }
}
