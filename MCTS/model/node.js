let mongoose = require("mongoose");
const Schema = mongoose.Schema;
let getNodeStateFromBoard = require("../utils/getNodeStateFromBoard");

const NodeSchema = new Schema({
    children: {
        type: [String],
        default: []
    },
    terminated_status: Number,//1 là thắng, 0 là hòa, -1 là chưa kết thúc
    score: {
        type: Number,
        default: 0
    },
    state: {
        type: String,
        index: "hashed"
    },
    visit_count: {
        type: Number,
        default: 0
    }
});

let Node = mongoose.model("node", NodeSchema);

module.exports = {
    findChildren: ({ board }) => {
        return new Promise(async (resolve, reject) => {
            try {
                // Get node state from the board
                const state =  getNodeStateFromBoard(board);

                // Find current node and its children
                const currentNode = await Node.findOne({ state });
                const children = await Node.find({ state: { $in: currentNode.children } });

                // Identify missing children states
                const missingChildrenStates = currentNode.children.filter(childState => (
                    !children.some(child => child.state === childState)
                ));

                // Create missing children in bulk
                const newChildren = await Node.insertMany(missingChildrenStates.map(state => ({ state })));

                // Combine existing and new children
                resolve([...children, ...newChildren]);

            } catch (error) {
                reject(error);
            }
        });
    }
    ,
    get_node_from_database: ({ board }) => {
        return new Promise(async (resolve, reject) => {
            let state =  getNodeStateFromBoard(board);
            const query = { state };

            let document = await Node.findOne(query);
            if (!document) {
                document = await new Node({ state }).save();
            }
            return resolve(document)
        });
    },
    update_children_list: ({ board, children_states }) => {
        return new Promise(async (resolve, reject) => {
            let state =  getNodeStateFromBoard(board);
            let query = { state: state };
            await Node.findOneAndUpdate(query, { children: children_states });
            return resolve();
        })
    },
    update_nodes_score: (states, scoreIncrease) => {
        return new Promise(async (resolve, reject) => {
            try {
                await Node.updateMany(
                    { state: { $in: states } },
                    {
                        $inc: {
                            visit_count: 1,
                            score: scoreIncrease
                        }
                    }
                );
            } catch (error) {
                console.log(error)
            }
            return resolve();
        })
    },
    update_terminated_status: ({ board, terminated_status }) => {
        return new Promise(async (resolve, reject) => {
            let state =  getNodeStateFromBoard(board);
            const query = { state };
            await Node.findOneAndUpdate(query, { terminated_status });
            return resolve();
        })
    }
};