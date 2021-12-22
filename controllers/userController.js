const { validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const dbConnection = require("../utils/dbConnection");

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
    console.log(row[0].phone);
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

    if (!errors.isEmpty()) {
        return res.render('sell',{
            error: errors.array()[0].msg
        })
    }

    try{
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
                error: 'Property could not be added. Try again.'
            });
        }
        res.render("sell", {
            msg: 'You have successfully added property.'
        });
    }
    catch(e){
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