import { outOfBoundsField } from '../helpers/constants.js'


export default function (min, field, max) {
    return (req, res, next) => {
        const integer = Number.parseInt(req.body[field]);
        if (min > integer || integer > max) return res.status(400).json(outOfBoundsField(min, field, max));
        next();
    }
}
