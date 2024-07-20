import { missingField } from "../helpers/constants.js";


export default function (requiredFields) {
    return (req, res, next) => {
        console.log(requiredFields);
        for (const field of requiredFields) {
            if (!(field in req.body)) return res.status(400).json(missingField(field));
        }
        next();
    }
}
