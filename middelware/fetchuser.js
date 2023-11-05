const jwt = require('jsonwebtoken');

jwtSecret_key = "noteswebkey@112#"

const fetchuser = (req, res, next) => {
    const token = req.header('auth-Token')
    if (!token) {
        return res.status(401).send({ error: "Please authenticate using a valid token" })
    }
    try {
        let data = jwt.verify(token, jwtSecret_key)
        // we already send user id in the form of "data" in auth.js or "jwt token"
        req.user = data.user
        next()
    } catch (error) {
        return res.status(401).send({ error: "Please don't edit or change the token" })
    }
}

module.exports = fetchuser