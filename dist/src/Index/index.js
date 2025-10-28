import express from 'express';
const app = express();
app.get("/HelloWorld", (req, res) => {
    res.send("Hello World!");
});
app.listen(8000);
