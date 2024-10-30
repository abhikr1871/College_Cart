const express = require('express');

require('./db/config');
const app = express();
const User = require("./db/User");

app.use(express.json());
app.post("/Login",async(req,resp)=>{
     let user = new User(req.body);
     let result = await user.save();
     resp.send(result);
});


app.listen(5000);
// const Mongodb_url ="mongodb+srv://abhiKr1871:Abhijeet123@collegecart.tgdzn.mongodb.net/";
