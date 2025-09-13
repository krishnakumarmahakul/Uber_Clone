const app=require('./app'); 
const http = require('http');
const dotenv = require('dotenv');

dotenv.config();
const server = http.createServer(app);



const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



