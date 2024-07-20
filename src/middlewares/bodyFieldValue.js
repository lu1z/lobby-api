import { incorrectValueField } from '../helpers/constants.js'


export default function (pairs) {
    return (req, res, next) => {
        for (const [field, value] of pairs) {
            if (req.body[field] === value) return res.status(400).json(incorrectValueField(field, value));
        }
        next();
    }
}
