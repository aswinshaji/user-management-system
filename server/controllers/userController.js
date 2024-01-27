const mysql = require('mysql');

//Connection Pool
const pool = mysql.createPool({
    connectionLimit : 100,
    host            : /*"demo-db.chbihdstmhrd.us-east-2.rds.amazonaws.com"*/,
    port            : "3306",
    user            : "root",
    password        : "projectwork",
    database        : "usermanagement_tut"
});

//View users
exports.view = (req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err; //not connected!
        console.log('Connected as ID ' + connection.threadId);
        //User the connection
        connection.query('SELECT * FROM user WHERE status = "active"', (err, rows) => {
            //When done with the connection, release it
            connection.release();
            if(!err) {
                let removedUser = req.query.removed;
                res.render('home', { rows, removedUser });
            } else {
                console.log(err);
            }
            console.log('The data from the table: \n', rows);
        });
    });
};

//Find user by search
exports.find = (req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err; //not connected!
        console.log('Connected as ID ' + connection.threadId);
        let searchTerm = req.body.search;
        //User the connection
        connection.query('SELECT * FROM user WHERE first_name LIKE ? OR last_name LIKE ?', ['%' + searchTerm + '%', '%' + searchTerm + '%'], (err, rows) => {
            //When done with the connection, release it
            connection.release();
            if(!err) {
                res.render('home', { rows });
            } else {
                console.log(err);
            }
            console.log('The data from the table: \n', rows);
        });
    });
}

exports.form = (req, res) => {
    res.render('add-user');
}

//Add new user
exports.create = (req, res) => {
    const {first_name, last_name, email, phone, comments} = req.body;

    pool.getConnection((err, connection) => {
        if(err) throw err; //not connected!
        console.log('Connected as ID ' + connection.threadId);
        let searchTerm = req.body.search;
        //User the connection
        connection.query('INSERT INTO user SET first_name = ?, last_name = ?, email = ?, phone = ?, comments = ?',[first_name, last_name, email, phone, comments],(err, rows) => {
            //When done with the connection, release it
            connection.release();
            if(!err) {
                res.render('add-user', {alert: 'User added successfully.' });
            } else {
                console.log(err);
            }
            console.log('The data from the table: \n', rows);
        });
    });
}

//Edit user
exports.edit = (req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err; //not connected!
        console.log('Connected as ID ' + connection.threadId);
        //User the connection
        connection.query('SELECT * FROM user WHERE id = ?', [req.params.id], (err, rows) => {
            //When done with the connection, release it
            connection.release();
            if(!err) {
                res.render('edit-user', { rows });
            } else {
                console.log(err);
            }
            console.log('The data from the table: \n', rows);
        });
    });
}

//Update user
exports.update = (req, res) => {
    const {first_name, last_name, email, phone, comments} = req.body;

    pool.getConnection((err, connection) => {
        if(err) throw err; //not connected!
        console.log('Connected as ID ' + connection.threadId);
        //User the connection
        connection.query('UPDATE user SET first_name = ?, last_name = ?, email = ?, phone = ?, comments = ? WHERE id = ?', [first_name, last_name, email, phone, comments, req.params.id], (err, rows) => {
            //When done with the connection, release it
            connection.release();
            if(!err) {
                pool.getConnection((err, connection) => {
                    if(err) throw err; //not connected!
                    console.log('Connected as ID ' + connection.threadId);
                    //User the connection
                    connection.query('SELECT * FROM user WHERE id = ?', [req.params.id], (err, rows) => {
                        //When done with the connection, release it
                        connection.release();
                        if(!err) {
                            res.render('edit-user', { rows, alert: `${first_name} has been updated.` });
                        } else {
                            console.log(err);
                        }
                        console.log('The data from the table: \n', rows);
                    });
                });
            } else {
                console.log(err);
            }
            console.log('The data from the table: \n', rows);
        });
    });
}

// Delete user
exports.delete = (req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err; 
        connection.query('DELETE FROM user WHERE id = ?', [req.params.id], (err, rows) => {
            // return the connection the pool
            connection.release();
            if(!err) {
                let removedUser =  encodeURIComponent('User successfully removed.');
                res.redirect('/?removed=' +removedUser);
            } else {
                console.log(err);
            }
            console.log('The data from the table: \n', rows);
        });
    });
}

//View users
exports.viewall = (req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err; //not connected!
        console.log('Connected as ID ' + connection.threadId);
        //User the connection
        connection.query('SELECT * FROM user WHERE id = ?', [req.params.id], (err, rows) => {
            //When done with the connection, release it
            connection.release();
            if(!err) {
                res.render('view-user', { rows });
            } else {
                console.log(err);
            }
            console.log('The data from the table: \n', rows);
        });
    });
};

const AWS = require("aws-sdk");
AWS.config.loadFromPath('./config.json');
AWS.config.update({region:'us-east-2'});
var docClient = new AWS.DynamoDB.DocumentClient();

var params = {
    TableName: "usermanagementtutorial"
}

docClient.scan(params, (err, data) => {
    if (err){
        console.log(err);
    }else{
        var items = [];
        for (var i in data.Items){
            items.push({"id":data.Items[i]['id'], "first_name":data.Items[i]['last_name'], "id":data.Items[i]['last_name'], "email":data.Items[i]['phone'], "id":data.Items[i]['phone'], "comments":data.Items[i]['comments'], "status":data.Items[i]['status']})
        }
        console.log(items);
    }
})
