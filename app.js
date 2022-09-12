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
    const insertUser = async (firstName, lastName, age, email) => {
        const id = await (await client.query("SELECT NOW()")).rows[0].now;
        try {
            await client.query(
                `INSERT INTO user_table(id, firstName, lastName, age, email)
                VALUES('${id}', '${firstName}', '${lastName}', ${age}, '${email}')`); // sends queries
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
    insertUser(req.body.fname, req.body.lname, req.body.age, req.body.email)
        
});
    
app.get('/users', async (req, res)=>{
    await client.query(`SELECT * FROM user_table`)
    .then(users =>{
        res.render('users', {
            pageTitle: 'List of users',
            users: users.rows
        });
    });
   
});
app.get('/delete/:id', async (req, res)=>{
    await client.query(`DELETE FROM user_table WHERE id = '${req.params.id}'`)
    .then(res.redirect('back'));
    
});
app.get('/edit/:id', async  (req, res)=>{
    await client.query(`SELECT * FROM user_table WHERE id = '${req.params.id}'`)
    .then(user =>{
        const doc = user.rows[0];
        res.render('edit', {
            pageTitle: 'Edit User: ' + doc.firstname + ' ' + doc.lastname,
            user: doc,
        });
    });
});
app.post('/change/:id', async (req,res)=>{

    await client.query(`UPDATE user_table SET firstname = '${req.body.fname}',
    lastname = '${req.body.lname}',age = ${req.body.age},email = '${req.body.email}' WHERE id = '${req.params.id}'`)
    .then(res.redirect('/users'));
});
app.post('/searching', async (req, res)=>{
    if(req.body.select === 'FirstName'){
        await client.query(`SELECT * FROM user_table WHERE UPPER(firstname) = UPPER('${req.body.search}')`)
        .then(user =>{
            res.render('results', {
                pageTitle: 'Search Results',
                results: user.rows,
             });
        });
    }
    else if(req.body.select === 'LastName'){
        await client.query(`SELECT * FROM user_table WHERE UPPER(lastname) = UPPER('${req.body.search}')`)
        .then(user =>{
            res.render('results', {
                pageTitle: 'Search Results',
                results: user.rows,
             });
        });
    }
    else{
        res.render('error');
    }
});
app.post('/sort', async (req,res)=>{
    if(req.body.sortSelect === 'sFName' && req.body.sortOrd === 'ASC') {
        await client.query(`SELECT * FROM user_table ORDER BY firstname;`)
        .then(users =>{
            res.render('users', {
                pageTitle: 'Ordered list Z>a',
                users: users.rows,
            });
        });
        
    }
    else if(req.body.sortSelect === 'sFName' && req.body.sortOrd === 'DSC') {
        await client.query(`SELECT * FROM user_table ORDER BY firstname DESC;`)
        .then(users =>{
            res.render('users', {
                pageTitle: 'Ordered list Z>a',
                users: users.rows,
            });
        });
    }
    if(req.body.sortSelect === 'sLName' && req.body.sortOrd === 'ASC') {
        await client.query(`SELECT * FROM user_table ORDER BY lastname;`)
        .then(users =>{
            res.render('users', {
                pageTitle: 'Ordered list Z>a',
                users: users.rows,
            });
        });
        
    }
    else if(req.body.sortSelect === 'sLName' && req.body.sortOrd === 'DSC') {
        await client.query(`SELECT * FROM user_table ORDER BY lastname DESC;`)
        .then(users =>{
            res.render('users', {
                pageTitle: 'Ordered list Z>a',
                users: users.rows,
            });
        });
    }
    else{
        res.render('error');
    }
});

app.listen(port, ()=>{
    console.log("on port " + port);
});