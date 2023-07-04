const rateLimit = require('express-rate-limit')
const {isPrimeUser} = require("./models/User")


//middleware to avoid bruteforce attack 
const bruteforceLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // Limit each IP to 5 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

//middleware to limit the number of accounts created
//in realta mette un limite al numero di esecuzione della specifica route contando anche i casi di errori (come ad esempio i vincoli di chiave non soddisfatti) 
const createAccountLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 10, // Limit each IP to 10 create account requests per `window` (here, per hour)
	message:
		'Too many accounts created from this IP, please try again after an hour',
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// Middleware to control if user is logged or not  
const requireAuth = (req, res, next) => {
    if (req.session.loggedin) {
        next();
    } else {
        res.redirect('/logout');
    }
};

//middleware to control if user is prime 
const requirePrimeAuth = (req, res, next) => {

    const email = req.user ? req.user.email : req.session.user
    const table = req.user ? "googleUsers" : "Credenziali"
    
    if (req.session.prime && req.session.loggedin) {
        //controllo aggiuntivo lato Database
        if(isPrimeUser(email,table)){
            next();
        }else{
            res.redirect('/');    
        }
    } else {
        res.redirect('/');
    }
};



module.exports = {
    bruteforceLimiter,
    createAccountLimiter,
    requireAuth,
    requirePrimeAuth
}
