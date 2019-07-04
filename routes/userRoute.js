const errors = require('restify-errors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../auth');
const config = require('../config');


module.exports = server =>{
    //Register a user
    server.post('/register', (req, res, next)=>{
        //get deatils from req.body
        const {email, password} = req.body;

        const user = new User({
            email: email,
            password: password
        });

        //first encrypt password then save the user
        bcrypt.genSalt(10, (err, salt)=>{
            if(err){
                return next(new errors.InternalError(err.message));
            }else{
                bcrypt.hash(user.password, salt, async (err, hash)=>{
                    user.password = hash;

                    try{
                        const newUser = await user.save();
                        res.send(201);
                        next();
                    }catch(err){
                        return next(new errors.InternalError(err.message));
                    }

                });
            }
        });

    });



    //Authenticate a user
    server.post('/auth', async (req, res, next)=>{
        //get details from req.body
        const {email, password} = req.body;

        try{
            //authenticate user
            const user = await auth.authenticate(email, password);
            //create jwt
            const token = jwt.sign(user.toJSON(), config.JWT_SECRET, {
                expiresIn: '15m'
            });
            const {iat, exp} = jwt.decode(token);
            res.send({iat, exp, token});
            next();
        }catch(err){
            return next(new errors.UnauthorizedError(err));
        }
    });
}