let mongoose = require("mongoose");
const NodeClass = require("./classes/node");
require("dotenv").config(); 
mongoose.connect(process.env.MONGODB_URI);

let boardSize = parseInt(process.env.BOARD_SIZE);

let blank_board = [];

// Loop to create the subarrays
for (let i = 0; i < boardSize; i++) {
  const subArray = new Array(boardSize).fill(0);  
  blank_board.push(subArray);  
}


let count = 0;
let run = async ()=>{
    count++;
    console.log("bắt đầu ván thứ "+ count)
    let node = new NodeClass(blank_board);
    await node.init();  
    await node.simulate(); 
    run();
}

run();