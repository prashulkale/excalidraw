import express from "express";
const app = express();
app.use(express.json());

app.post("/signup", (req, res) => {
    
})
app.post("/signin", (req, res) => {

})
app.post("/room", (req, res) => {

})

const PORT = 3001;
app.listen(PORT,()=>{
    console.log(`http-backend server running on ${PORT}`)
})