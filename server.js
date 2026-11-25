import express from 'express';

const app = express();
const PORT = 3016;

app.use('/', (req, res) => {
    res.status(200).json("hi");
});

app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}` + ` http://localhost:${PORT}`);
});

