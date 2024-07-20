import { integerField } from '../helpers/constants.js'


export default function (integerFields) {
    return (req, res, next) => {
        for (const field of integerFields) {
            const integer = Number.parseInt(req.body[field]);
            if (isNaN(integer)) return res.status(400).json(integerField(field));
        }
        next();
    }
}
