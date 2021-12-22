const router = require("express").Router();
const { body } = require("express-validator");

const {
    homePage,
    sellPage,
    register,
    registerPage,
    login,
    loginPage,
    addProperty,
} = require("./controllers/userController");

const ifNotLoggedin = (req, res, next) => {
    if(!req.session.userID){
        return res.redirect('/login');
    }
    next();
}

const ifLoggedin = (req,res,next) => {
    if(req.session.userID){
        return res.redirect('/');
    }
    next();
}

router.get('/', ifNotLoggedin, homePage);

router.get("/login", ifLoggedin, loginPage);

router.post("/login",
ifLoggedin,
    [
        body("_email", "Invalid email address")
            .notEmpty()
            .escape()
            .trim()
            .isEmail(),
        body("_password", "The Password must be of minimum 4 characters length")
            .notEmpty()
            .trim()
            .isLength({ min: 4 }),
    ],
    login
);
router.get("/sellPage",ifNotLoggedin, sellPage);
router.post("/sellPage",
    ifNotLoggedin,
    [
        body("inputAddress","Address must not be empty")
            .notEmpty()
            .trim(),
        body("inputState","State must not be empty")
            .notEmpty()
            .trim(),
        body("inputZip","Enter 6 digit zip code")
            .notEmpty()
            .trim()
            .isLength({min:6,max:6}),
        body("inputCity","City must not be empty")
            .notEmpty()
            .trim(),        
        body("description","Enter a minimum of 20 characters in description for better reference")
            .notEmpty()
            .trim()
            .isLength({min:20}),
        body("area","Area must not be empty")
            .notEmpty(),
        body("price","Price must not be empty")
            .notEmpty(),
    ],
    addProperty
)
router.get("/signup", ifLoggedin, registerPage);
router.post(
    "/signup",
    ifLoggedin,
    [
        body("_name", "The name must be of minimum 3 characters length")
            .notEmpty()
            .escape()
            .trim()
            .isLength({ min: 3 }),
        body("_email", "Invalid email address")
            .notEmpty()
            .escape()
            .trim()
            .isEmail(),
        body("_phone","Enter a valid ten digit phone number")
            .isLength({min:10,max:10})
            .isNumeric(),
        body("_password", "The Password must be of minimum 4 characters length")
            .notEmpty()
            .trim()
            .isLength({ min: 4 }),
    ],
    register
);

router.get('/logout', (req, res, next) => {
    req.session.destroy((err) => {
        next(err);
    });
    res.redirect('/login');
});

module.exports = router;