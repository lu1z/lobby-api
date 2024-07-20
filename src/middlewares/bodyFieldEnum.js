import { incorrectEnumField } from '../helpers/constants.js'


export default function (field, values) {
    return (req, res, next) => {
        if (!values.some((value) => req.body[field] === value)) return res.status(400).json(incorrectEnumField(field, values));
        next();
    }
}
