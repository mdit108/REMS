const { validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const dbConnection = require("../utils/dbConnection");
const { TransactionSchema } = require("../models/Transaction.schema");

// Home Page
exports.homePage = async (req, res, next) => {
    const [row] = await dbConnection.execute("SELECT * FROM `remsusers` WHERE `email`=?", [req.session.userID]);
    const [rowdetails] = await dbConnection.execute("SELECT * FROM `remsdetails` WHERE `phone`=?", [row[0].phone])
    if (row.length !== 1) {
        return res.redirect('/logout');
    }

    res.render('home', {
        user: row[0],
        userdetails: rowdetails[0]
    });
}

exports.sellPage = async (req, res, next) => {
    const [row] = await dbConnection.execute("SELECT * FROM `remsusers` WHERE `email`=?", [req.session.userID]);
    const [rowdetails] = await dbConnection.execute("SELECT * FROM `remsdetails` WHERE `phone`=?", [row[0].phone])
    // console.log(rowdetails[0]);    
    if (row.length !== 1) {
        return res.redirect('/logout');
    }

    res.render('sell', {
        user: row[0],
        userdetails: rowdetails[0]
    });
}

exports.viewPage = async (req,res,next) => {
    try{
    const [row] = await dbConnection.execute("SELECT * FROM `remsusers` WHERE `email`=?", [req.session.userID]);
    const [rowdetails] = await dbConnection.execute("SELECT * FROM `remsdetails` WHERE `phone`=?", [row[0].phone])
    const [details] = await dbConnection.execute("SELECT name,email,propid,properties.address,city,state,zip,price,area,description,rent FROM remsdetails,remsusers,properties WHERE remsdetails.phone = remsusers.phone and remsusers.email = properties.userid and properties.userid != ?; ",[req.session.userID])
     if (row.length !== 1) {
        return res.redirect('/logout');
    }

    res.render('view', {
        details,
        userdetails: rowdetails[0],
        userID: req.session.userID,
        user: row[0]
    });
}
catch(e){
    console.log(e);
    next();
}
}

// Register Page
exports.registerPage = (req, res, next) => {
    res.render("register");
};

// User Registration
exports.register = async (req, res, next) => {
    const errors = validationResult(req);
    const { body } = req;

    if (!errors.isEmpty()) {
        return res.render('register', {
            error: errors.array()[0].msg
        });
    }

    try {

        const [row] = await dbConnection.execute(
            "SELECT * FROM `remsusers` WHERE `email`=?",
            [body._email]
        );

        if (row.length >= 1) {
            return res.render('register', {
                error: 'This email already in use.'
            });
        }

        const hashPass = await bcrypt.hash(body._password, 12);

        const [rows] = await dbConnection.execute(
            "INSERT INTO `remsusers`(`email`,`password`,`phone`) VALUES(?,?,?)",
            [body._email,hashPass,body._phone]
        );
        const [rowsdetails] = await dbConnection.execute(
            "INSERT INTO `remsdetails`(`phone`,`name`,`address`) VALUES(?,?,?)",
            [body._phone,body._name,body._address]
        );
        // const [rows] = await dbConnection.execute(
        //     "INSERT INTO `remsusers`(`name`,`email`,`phone`,`address`,`password`) VALUES(?,?,?,?,?)",
        //     [body._name, body._email,body._phone,body._address, hashPass]
        // );
        if (rows.affectedRows !== 1 || rowsdetails.affectedRows !== 1) {
            return res.render('register', {
                error: 'Your registration has failed.'
            });
        }
        
        res.render("register", {
            msg: 'You have successfully registered.'
        });

    } catch (e) {
        next(e);
    }
};

// Login Page
exports.loginPage = (req, res, next) => {
    res.render("login");
};

exports.addProperty = async (req,res,next) => {
    
    const errors = validationResult(req);
    const {body} = req;
    
    const [row] = await dbConnection.execute("SELECT * FROM `remsusers` WHERE `email`=?", [req.session.userID]);
    const [rowdetails] = await dbConnection.execute("SELECT * FROM `remsdetails` WHERE `phone`=?", [row[0].phone])


    if (!errors.isEmpty()) {
        console.log(errors)
        return res.render('sell',{
            error: errors.array()[0].msg,
            user: row[0],
        userdetails: rowdetails[0]
        })
    }
    

    try{
        const [row] = await dbConnection.execute("SELECT * FROM `remsusers` WHERE `email`=?", [req.session.userID]);
    const [rowdetails] = await dbConnection.execute("SELECT * FROM `remsdetails` WHERE `phone`=?", [row[0].phone])
        var option;
        if (body.rent == "Sell"){
            option = 0
        }
        else if (body.rent == "Rent"){
            option = 1
        }
        const [rows] = await dbConnection.execute(
            "INSERT INTO `properties`(`userid`,`address`,`city`,`state`,`zip`,`description`,`price`,`area`,`rent`) VALUES(?,?,?,?,?,?,?,?,?)",
            [req.session.userID,body.inputAddress,body.inputCity,body.inputState,body.inputZip,body.description,body.price,body.area,option]
        );
        
        
        if (rows.affectedRows !== 1) {
            return res.render('sell', {
                error: 'Property could not be added. Try again.',
                user: row[0],
                userdetails: rowdetails[0]
            });
        }
        return res.render("sell", {
            msg: 'You have successfully added property.',
            user: row[0],
            userdetails: rowdetails[0]
        });
        console.log(req.session.userID)
    }
    catch(e){
        next(e);
    }

}

exports.mylistings = async (req,res,next) => {
    try{
        const [properties] = await dbConnection.execute('SELECT * FROM `properties` WHERE `userid`=?', [req.params.id]);
        return res.render('listings', {
            userID: req.params.id,
        properties
    });
    }
    catch(e){
        console.log(e);
        next(e);
    }
    return res.render('listings');
}

exports.sellerInfo = async (req,res,next) => {

    try{

        // var name
        // var address
        // var phone

        const [row] = await dbConnection.execute("SELECT name,remsdetails.phone,remsdetails.address FROM remsdetails,properties,remsusers WHERE properties.userid=remsusers.email AND remsusers.phone=remsdetails.phone AND properties.propid=?",[req.params.propid]);
        return res.render('info',{
            ownerdetails : row[0],
        propid: req.params.propid
    })
    
    }
    catch(e){
        console.log(e)
        next()
    }
    return res.render('info',{
        
        propid: req.params.id
    })
    
}


exports.transactionForm = async (req,res,next) => {
    return res.render('form',{
        seller: req.params.id,
        propid: req.params.propid
    });
}
exports.deletelisting = async (req,res,next) => {
    try{
        const [row] = await dbConnection.execute("SELECT * FROM `remsusers` WHERE `email`=?", [req.session.userID]);
    const [rowdetails] = await dbConnection.execute("SELECT * FROM `remsdetails` WHERE `phone`=?", [row[0].phone])
    const [properties] = await dbConnection.execute('SELECT * FROM `properties` WHERE `userid`=?', [req.params.id]);
    const [query] = await dbConnection.execute("DELETE FROM `properties` WHERE `propid`=?",[req.params.propid]);
    return res.redirect('/sellPage')
        next();
}
catch(e){
    console.log(e)
    next(e);
}
}

// Login User
exports.login = async (req, res, next) => {

    const errors = validationResult(req);
    const { body } = req;

    if (!errors.isEmpty()) {
        return res.render('login', {
            error: errors.array()[0].msg
        });
    }

    try {

        const [row] = await dbConnection.execute('SELECT * FROM `remsusers` WHERE `email`=?', [body._email]);

        if (row.length != 1) {
            return res.render('login', {
                error: 'Invalid email address.'
            });
        }

        const checkPass = await bcrypt.compare(body._password, row[0].password);

        if (checkPass === true) {
            req.session.userID = row[0].email;
            return res.redirect('/');
        }

        res.render('login', {
            error: 'Invalid Password.'
        });


    }
    catch (e) {
        next(e);
    }

}

exports.reports = async(req,res,next) => {
    const d = new Date();
    let month = d.getMonth();
    try {
        [countUsers] = await dbConnection.execute("SELECT count(*) as count FROM remsdetails WHERE MONTH(DATE) = ?",[month+1]);
        numberUsers = countUsers[0].count;
        [countActive] = await dbConnection.execute("SELECT COUNT(*) as count FROM properties WHERE MONTH(DATE) = ?",[month+1]);
        numberActive = countActive[0].count;
        numberTransaction = await TransactionSchema.countDocuments();
        
        const highest = await TransactionSchema
                            .find({},function(err,result){
                                if (err){
                                    console.log(err)
                                }
                                else{
                                }
                            }).clone().sort({amount:-1})
        if (highest.length == 0){
            numberHighest = "No transactions made"
        }
        else{
        numberHighest = highest[0].amount
        }

        const lowest = await TransactionSchema
                            .find({},function(err,result){
                                if (err){
                                    console.log(err)
                                }
                                else{
                                }
                            }).clone().sort({amount:0})
        if (lowest.length == 0){
            numberLowest = "No transactions made"
        }
        else{
        numberLowest = lowest[0].amount
        }
        return res.render('reports',{
         numberUsers,
         numberActive,
         numberTransaction,
         numberHighest,
         numberLowest,
    });
}

    catch(e){
        console.log(e);
        next();
    }
}