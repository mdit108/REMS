const { TransactionSchema } = require("./Transaction.schema");
const insertTransactionn = transactionObj => {
    return new Promise((resolve,reject)=> {
        try {
            TransactionSchema(transactionObj).save().then(data => {
                resolve(data)
            }).catch((error)=>reject(error));
        } catch (error) {
            reject(error);
        }
    })
}

module.exports = {
    insertTransactionn
}