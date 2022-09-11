const express = require('express');
const path = require('path');
const port = process.env.PORT || 5000

const app = express();

const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgres://hcteujjqohwddz:78ce49bbaa80c14879b3231f8295635efe84319098207e628069cf8bb84c9e40@ec2-34-231-42-166.compute-1.amazonaws.com:5432/d8os3hkk306986',
    ssl:{
        rejectUnauthorized: false,
    }
});

client.connect(err => {
  if (err) {
    console.log(client.connectionString);
    console.error('connection error', err.stack)
  } else {
    console.log('connected')
  }
})

app.use(express.urlencoded({extended: false}))
app.set('viewsForMe', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/', (req, res)=>{
    res.render('newUser')
    
});
app.post('/user', (req, res)=>{
        // firstName: req.body.fname,
        // lastName: req.body.lname,
        // age: req.body.age,
        // email: req.body.email,

        const insertUser = async (firstName, lastName, age, email) => {
            try {
                await client.query(
                    `INSERT INTO "user_table" (id, firstName, lastName, age, email)  
                    VALUES${[ firstName, lastName, age, email]}`); // sends queries
                return true;
            }
            catch (error) {
                    console.error(error.stack);
                    return false;
            } 
            finally{
                    res.redirect('users');
            }
        };
        insertUser(req.body.fname,req.body.lname,req.body.age,req.body.email,)
            
    });
    
app.get('/users', (req, res)=>{
    client.query(`SELECT * FROM user_table`)
    .then(users =>{res.render('users', {
            pageTitle: 'List of users',
            users: users
        });
    });
   
});
app.get('/delete/:id', (req, res)=>{
    users.deleteOne({_id: req.params.id }).then(function(){
        console.log("Data deleted"); // Success
        res.redirect('back')
    }).catch(function(error){
        console.log(error); // Failure
    });
    
});
app.get('/edit/:id',(req, res)=>{
    users.findById(req.params.id, (err, doc)=>{
        if (err) {
            console.log(err);
        }
        else{
            res.render('edit', {
                pageTitle: 'Edit User: ' + doc.firstName + ' ' + doc.lastName,
                user: doc,
            });
        }
    });
});
app.post('/change/:id', (req,res)=>{
    users.findByIdAndUpdate(req.params.id, {
        firstName: req.body.fname,
        lastName: req.body.lname,
        age: req.body.age,
        email: req.body.email,
    }, (err, data)=>{
        if (err) {
            console.log(err);
        }
    });
    res.redirect('/users');
});
app.post('/searching', (req, res)=>{
    console.log(req.body.select);
    if(req.body.select === 'FirstName'){
        users.find({firstName: req.body.search}, (err, docs)=>{
            if (err){
                console.log(err);
            }
            else{
                console.log(docs);
                res.render('results', {
                    pageTitle: 'Search Results',
                    results: docs,
                });
            }
        });
    }
    else if(req.body.select === 'LastName'){
        users.find({lastName: req.body.search}, (err, docs)=>{
            if (err){
                console.log(err);
            }
            else{
                console.log(docs);
                res.render('results', {
                    pageTitle: 'Search Results',
                    results: docs,
                });
            }
        });
    }
    else{
        console.log('ERROR: did not select search params');
    }
});
app.post('/sort', (req,res)=>{
    if(req.body.sortSelect === 'sFName' && req.body.sortOrd === 'ASC') {
        users.find({}).sort('firstName').exec((err,docs)=>{
            res.render('users', {
                pageTitle: 'Ordered list Z>a',
                users: docs,
            });
        });
    }
    else if(req.body.sortSelect === 'sFName' && req.body.sortOrd === 'DSC') {
        users.find({}).sort({firstName: 'desc'}).exec((err,docs)=>{
            res.render('users', {
                pageTitle: 'Ordered list Z>a',
                users: docs,
            });
        });
    }
    else if(req.body.sortSelect === 'sLName' && req.body.sortOrd === 'ASC') {
        users.find({}).sort('lastName').exec((err,docs)=>{
            res.render('users', {
                pageTitle: 'Ordered list Z>a',
                users: docs,
            });
        });
    }
    else if(req.body.sortSelect === 'sLName' && req.body.sortOrd === 'DSC') {
        users.find({}).sort({lastName: 'desc'}).exec((err,docs)=>{
            res.render('users', {
                pageTitle: 'Ordered list Z>a',
                users: docs,
            });
        });
    }
});

app.listen(port, ()=>{
    console.log("on port " + port);
});