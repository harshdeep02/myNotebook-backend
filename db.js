const mongoose = require('mongoose')
// const mongooseURI = 'mongodb://localhost:27017/Notes'
require("dotenv").config()

const mongooseURI = process.env.mongoDB_URL ||'mongodb://127.0.0.1:27017/Notes'



const connectToMongo = ()=>{mongoose.connect(mongooseURI, { useNewUrlParser: true, useUnifiedTopology: true})
.then(()=>{
    console.log("connected sucessfully")
})
.catch((err)=>{
    console.log(err)
})
}
module.exports = connectToMongo