const connectToMongo = require('./db')
const express = require('express')
var cors = require('cors')
const app = express()
const port = process.env.PORT || 5000


app.use(cors())

connectToMongo()
app.use(express.json())

// Available routers
app.use('/apii/auth', require('./routes/auth')) //we can use any api like "apiii/auth"
app.use('/api/notes', require('./routes/notes'))

// app.listen(port,()=>{
//     console.log(`Server listen at port http://localhost:${port}/`)
// });
app.listen(port, () => {
    console.log(`Server listen at port ${port}`)
})