const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const TransactionSchema = new Schema ({
    sellerID: {
        type: String,
        required: true,
    },
    buyerName: {
        type: String,
        required: true,
    },
    amount:{
        type: Number,
        required: true,
    },
    transactionDate : {
        type: Date,
        required: true,
        default: Date.now(),
    },
})

module.exports = {
    TransactionSchema: mongoose.model('Transactions',TransactionSchema),
}