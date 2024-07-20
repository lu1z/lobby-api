import express from 'express';
import bodyParser from 'body-parser';
import lobbiesRouter from './routers/lobbiesRouter.js'
import { LOBBIES_END_POINT } from './helpers/constants.js'


const app = express();


app.set('trust proxy', true);


app.use(bodyParser.json());
app.use(LOBBIES_END_POINT, lobbiesRouter);


app.get('/ip', (req, res) => {
    return res.status(200).json(req.ip);
});


export default app;
