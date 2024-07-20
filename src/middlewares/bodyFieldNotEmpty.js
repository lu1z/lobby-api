import { emptyField } from '../helpers/constants.js'


export default function (stringFields) {
    return (req, res, next) => {
        for (const field of stringFields) {
            if (!req.body[field]) return res.status(400).json(emptyField(field));
        }
        next();
    }
}
