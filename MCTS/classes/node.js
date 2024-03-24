let NodeModel = require("../model/node"); 
const getNodeStateFromBoard = require("../utils/getNodeStateFromBoard");
const getBoardFromNodeState = require("../utils/getBoardFromNodeState");
const reverseBoard = require("../utils/reverseBoard");

let node_list = [];//state 

let NodeClass = class {
    constructor(board) {
        this.children = []; //[_id] 
        this.terminated_status = false; //Boolean can we stop right here 
        this.score = 0; //tổng số điểm// thắng +1, thua -1, hòa 0
        this.board = board; //[[0,0,0,0,0],...] 
        this.visit_count = 0; //tổng số lượng đã duyệt  
    }

    back_propagate = async (result) => {//return 1 là thắng, 0 là hòa
        return new Promise(async (resolve, reject) => { 
            if(result==0){//hòa
                //update toàn bộ các node trong node_list là hòa
                await NodeModel.update_nodes_score(node_list, 0);
            }else{
                let node_player_1 =[];
                let node_player_2 =[];
                for(let i = 0; i<node_list.length;i=i+2){
                    node_player_1.push(node_list[i]);
                }
                
                for(let i = 1; i<node_list.length;i=i+2){
                    node_player_2.push(node_list[i]);
                }
    
                const scoreAdjustment = node_list.length % 2 === 1 ? 1 : -1;  
                await NodeModel.update_nodes_score(node_player_1, scoreAdjustment);
                await NodeModel.update_nodes_score(node_player_2, -scoreAdjustment); // Invert the adjustment 
            } 
            return resolve()  
        });
    }

    check_ternmiated = () => {//return 1 là thắng, 0 là hòa, -1 là chưa biết 
        const board = this.board; 
        const boardSize = process.env.BOARD_SIZE; 
        //check hàng dọc
        for(let j =0; j< boardSize; j++){
            for(let i=0; i< boardSize-4; i++)
            if((board[i][j]==1)&&(board[i+1][j]==1)&&(board[i+2][j]==1)&&(board[i+3][j]==1)&&(board[i+4][j]==1)){
                if(board[i-1]){
                    if(board[i-1][j]==0) return 1;
                }

                if(board[i+5]){
                    if(board[i+5][j]==0) return 1;
                } 
            }
        }

        //check hàng ngang
        for(let i =0; i< boardSize; i++){
            for(let j=0; j< boardSize-4; j++)
            if((board[i][j]==1)&&(board[i][j+1]==1)&&(board[i][j+2]==1)&&(board[i][j+3]==1)&&(board[i][j+4]==1)){  
                if(board[i]){
                    if(board[i][j-1]==0) return 1;
                }

                if(board[i]){
                    if(board[i][j+5]==0) return 1;
                } 
            }
        }

        //check chéo chính
        for(let i =0; i< boardSize-4; i++){
            for(let j=0; j< boardSize-4; j++)
            if((board[i][j]==1)&&(board[i+1][j+1]==1)&&(board[i+2][j+2]==1)&&(board[i+3][j+3]==1)&&(board[i+4][j+4]==1)){
                if(board[i-1]){
                    if(board[i-1][j-1]==0)  return 1;
                }

                if(board[i+5]){
                    if(board[i+5][j+5]==0)  return 1;
                }
            }
        }

        //check chéo phụ
        for(let i = 4; i< boardSize; i++){
            for(let j=0; j< boardSize-4; j++)
            if((board[i][j]==1)&&(board[i-1][j+1]==1)&&(board[i-2][j+2]==1)&&(board[i-3][j+3]==1)&&(board[i-4][j+4]==1)){
                if(board[i-5]){
                    if(board[i-5][j+5]==0) return 1;
                }

                if(board[i+1]){
                    if(board[i+1][j-1]==0) return 1;
                } 
            }
        }

         //Kiểm tra xem bàn này đã full chưa
         let flag = false;//còn nước hợp lệ?
         for(let i =0; i< boardSize; i++){
             for(let j =0; j< boardSize; j++){
                 if(board[i][j]==0){
                     flag = true;
                     break;
                 }
             }
         }
 
         if(flag == false){
             return 0;
         }

        return -1;    
    }

    expand_children = () => {//Mục đích là tìm danh sách state con của node
        return new Promise(async (resolve, reject) => { 
            let children_states =[]; 
            
            let child_board = reverseBoard(this.board); 
            for(let i = 0; i < this.board.length; i++){
                for(let j = 0; j < this.board[0].length; j++){ 
                    if(this.board[i][j]==0){
                        child_board[i][j]=1;
                        let child_state =  getNodeStateFromBoard(child_board);
                        children_states.push(child_state);  //Không cần lưu lại danh sách này vào database 
                        child_board[i][j]=0;
                    }

                }    
            } 
            this.children =  children_states; 
            await NodeModel.update_children_list({board:this.board, children_states});
            return resolve();
        });
    }

    init = async () => {
        let document = await NodeModel.get_node_from_database({ board: this.board });
        this.children = document.children;
        this.terminated_status = document.terminated_status;
        this.score = document.score;
        this.visit_count = document.visit_count;
        node_list.push(document.state);
    }

    select_child = () => {
        return new Promise(async (resolve, reject) => {
            let children = await NodeModel.findChildren({board:this.board});
            //Chọn node có tỉ lệ thắng cao nhất, nhưng cũng không được bỏ ngõ những cơ hội của các node khác
            //Ví dụ node a có tỉ lệ thắng là 10%, nhưng nó được duyệt 1000 lần, thì vẫn có thể chọn node có tỉ lệ thắng là 0 nhưng mới chỉ duyệt 1 lần

            //Nếu có đứa con nào thắng thì chọn luôn
            for(let i=0; i<children.length;i++){
                let child = children[i];
                if(child.terminated_status==1){
                    return resolve(child);
                }
            }

         
            //tính ucb từng child và chọn ra best child
            let total_visit=0;
            for(let i = 0; i< children.length;i++){
                total_visit+=children[i].visit_count;
            }

            let best_ucb = -999999;
            let best_child_index=0;
            for(let i=0; i<children.length;i++){
                let child = children[i];
                let ucb = this.ucb1(child, total_visit);
                if(ucb==999999) return resolve(children[i]);
                if(ucb>best_ucb){
                    best_child_index = i;
                    best_ucb = ucb;
                }
            }  
            return resolve(children[best_child_index]);

        });
    }

    simulate = () => {
        return new Promise(async (resolve, reject) => {  
            if (this.terminated_status == undefined) {//Lần đầu node được tính toán là đã thắng hay thua
                this.terminated_status = this.check_ternmiated(); 
                await NodeModel.update_terminated_status({board:this.board, terminated_status:this.terminated_status})
            }

            
            if (this.terminated_status!=-1) {//nếu như đã phân định thắng thua, thì cập nhật toàn bộ chat
                await this.back_propagate(this.terminated_status);
                node_list=[];
                return resolve();
            }

            
            //Nếu như node này không có con thì mở rộng
            if (this.children.length == 0) {
                await this.expand_children(); 
            }
 
 
            //Chọn đứa con tốt nhất
            let child = await this.select_child();
  
            let child_board = getBoardFromNodeState(child.state);
            let new_node = new NodeClass(child_board);
            await new_node.init(); 
            await new_node.simulate();
            return resolve();
        });
    }

    ucb1 = (node, total_visit, c = parseFloat(process.env.C))=> {
        if (node.visit_count === 0) {
          return 999999; // Encourage exploration of unvisited nodes
        }
       
        const averageScore = node.score / node.visit_count;  
        const exploration = c*Math.sqrt(2 * Math.log(total_visit) / node.visit_count);
      
        return averageScore + exploration;
      } 
}

module.exports = NodeClass;