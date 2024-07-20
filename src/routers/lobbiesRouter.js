import express from 'express';
import {
    LOBBIES_COLLECTION,
    FIELD_LOBBY_IDENTIFIER,
    FIELD_LOBBY_SOCKET_PORT,
    recordDuplicated,
    LOBBY_STATUS_READY,
    FIELD_LOBBY_CLIENT_ADDRESS,
    FIELD_LOBBY_STATE,
    LOBBY_STATUS_ONGOING,
    NO_CHANGE,
} from '../helpers/constants.js'
import mongoConnectionWraper from '../helpers/mongoConnectionWraper.js'
import bodyFieldIntegrity from '../middlewares/bobyFieldIntegrity.js'
import bodyFieldValue from '../middlewares/bodyFieldValue.js';
import bodyFieldEnum from '../middlewares/bodyFieldEnum.js';
import bodyIntegerField from '../middlewares/bodyIntegerField.js';
import bodyFieldRange from '../middlewares/bodyFieldRange.js';
import bodyFieldNotEmpty from '../middlewares/bodyFieldNotEmpty.js';


const router = express.Router();


router.get('/', mongoConnectionWraper(LOBBIES_COLLECTION, async (_, res, collection) => {
    const result = await collection.find({}).toArray();
    return res.status(200).json(result)
}));

router.post(
    '/',
    bodyFieldIntegrity([FIELD_LOBBY_IDENTIFIER, FIELD_LOBBY_SOCKET_PORT]),
    bodyIntegerField([FIELD_LOBBY_SOCKET_PORT]),
    bodyFieldRange(FIELD_LOBBY_SOCKET_PORT),
    bodyFieldNotEmpty([FIELD_LOBBY_IDENTIFIER]),
    mongoConnectionWraper(LOBBIES_COLLECTION, async (req, res, collection) => {
        const identifier = req.body[FIELD_LOBBY_IDENTIFIER];
        const isDuplicated = await collection.findOne({ [FIELD_LOBBY_IDENTIFIER]: identifier });
        if (isDuplicated) return res.status(400).json(recordDuplicated(identifier));
        const lobby = {
            [FIELD_LOBBY_IDENTIFIER]: identifier,
            [FIELD_LOBBY_CLIENT_ADDRESS]: req.ip,
            [FIELD_LOBBY_SOCKET_PORT]: req.body[FIELD_LOBBY_SOCKET_PORT],
            [FIELD_LOBBY_STATE]: LOBBY_STATUS_READY,
        };
        const { insertedId } = await collection.insertOne(lobby);
        return res.status(201).json({ _id: insertedId, ...lobby });
    })
);

router.delete('/:identifier', mongoConnectionWraper(LOBBIES_COLLECTION, async (req, res, collection) => {
    const { deletedCount } = await collection.deleteOne({ [FIELD_LOBBY_IDENTIFIER]: req.params.identifier });
    if (!deletedCount) return res.sendStatus(404);
    return res.sendStatus(204);
}));

router.delete('/', mongoConnectionWraper(LOBBIES_COLLECTION, async (_, res, collection) => {
    const { deletedCount } = await collection.deleteMany({});
    if (!deletedCount) return res.sendStatus(404);
    return res.sendStatus(204);
}));

router.patch(
    '/:identifier',
    bodyFieldIntegrity(['op', 'path', 'value']),
    bodyFieldValue([['op', 'replace'], ['path', FIELD_LOBBY_STATE]]),
    bodyFieldEnum('value', [LOBBY_STATUS_READY, LOBBY_STATUS_ONGOING]),
    mongoConnectionWraper(LOBBIES_COLLECTION, async (req, res, collection) => {
        const { matchedCount, modifiedCount } = await collection.updateOne(
            { [FIELD_LOBBY_IDENTIFIER]: req.params.identifier },
            { $set: { [FIELD_LOBBY_STATE]: req.body.value } });
        if (!matchedCount) return res.sendStatus(404);
        if (!modifiedCount) return res.status(400).json(NO_CHANGE);
        return res.sendStatus(204);
    })
);


export default router;
