let cloneBoard=require("./cloneBoard");

module.exports=(board)=>{
    let clone_board = cloneBoard(board);  
    for(let i =0;i<clone_board.length;i++){
        for(let j =0;j<clone_board[0].length;j++){
             if(clone_board[i][j]!=0) clone_board[i][j] = -1*clone_board[i][j]; 
        }   
    }
    return clone_board;
}
