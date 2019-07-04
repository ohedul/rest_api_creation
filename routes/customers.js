const errors = require('restify-errors');
const Customer = require('../models/customerModel');
const rjwt = require('restify-jwt-community');
const config = require('../config');

module.exports = server =>{
    //Add a Customer
    server.post('/customers',rjwt({secret: config.JWT_SECRET}), async (req, res, next)=>{
        //check for JSON
        if(!req.is('application/json')){
            return next(new errors.InvalidContentError("expects 'application/json'"));
        }

        //create a instance of customers from body-parser
        const {name, email, balance} = req.body;
        const customer = new Customer({
            name: name,
            email: email,
            balance: balance
        });

        //to save instance into db, use try-catch
        try{
            const newCustomer = await customer.save();
            res.send(201);
            next();

        } catch(err){
            return next(new errors.InternalError(err.message));

        }
    });



    // Get a list of customers
    server.get('/customers', async (req, res, next)=>{
        try{
            const customers = await Customer.find({});
            res.send(customers);
            next();
        }catch(err){
            return next(new errors.InvalidContentError(err));
        }
    });


    // get a single customer
    server.get('/customers/:id', async (req, res, next)=>{
        try{

            //use findById
            const customer = await Customer.findById(req.params.id);
            res.send(customer);
            next();

        }catch(err){
            return next(new errors.ResourceNotFoundError(`no customer found with id: ${req.params.id}`));
        }
    });


    //update a customer 
    server.put('/customers/:id',rjwt({secret: config.JWT_SECRET}), async (req, res, next)=>{

         //check for JSON
         if(!req.is('application/json')){
            return next(new errors.InvalidContentError("expects 'application/json'"));
        }

        //create a instance of customers from body-parser
        const {name, email, balance} = req.body;
        const customer = new Customer({
            name: name,
            email: email,
            balance: balance
        });

        //to save instance into db, use try-catch
        try{
            const customer = await Customer.findOneAndUpdate({ _id: req.params.id}, req.body);
            res.send(200);
            next();

        } catch(err){
            return next(new 
                errors.ResourceNotFoundError(`customer with this id ${req.params.id} is not found`));

        }

    });




    //delete a customer
    server.del('/customers/:id',rjwt({secret: config.JWT_SECRET}), async (req, res, next)=>{
        try{
            const customer = await Customer.findOneAndRemove({ _id: req.params.id});
            res.send(204);
            next();
        }catch(err){
            return next(new errors.ResourceNotFoundError(`there is no customer with id ${req.params.id}`));
        }
    });
    
}