const express = require('express')
const cors = require('cors')
const sqlite3 = require('sqlite3').verbose()
const app = express()
const bodyParser= require('body-parser')
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.use(bodyParser())
app.use(cors())
app.use(express.static('public'))

const auth = function(req, res, next){
    let db = new sqlite3.Database('my.db')
    let username = req.headers.username
    let password = req.headers.password
    let sintaks = `SELECT * FROM USER WHERE USERNAME="${username}"`
    let authorized = false
    db.all(sintaks, function(err, rows){
        if(rows.length && rows[0].USERNAME == username){
            let res = bcrypt.compareSync(password, rows[0].PASSWORD)
            if(res){
                authorized = true
            }
        }
        if(authorized){
            next()
        }
        else{
            res.send(401)
        }
    })
}

app.get(`/`, auth, function(req, res){
    res.send(
        `<html>
            <body>
                <div>
                    <h1>What you want to do?</h1>
                    <form action="/todo" method="post">
                        <input name="deskripsi"/>
                        <button type="submit">Add</button>
                    </form>
                </div>
            </body>
        </html>`
    )
})

app.get('/todo', auth, function(req, res){
    let db = new sqlite3.Database('my.db')
    let sintaks = "SELECT * FROM TODOTABLE"
    db.all(sintaks, function(err, rows){
        res.json(rows)
    })
    db.close()
})

app.post('/todo', auth, function(req, res){
    let db = new sqlite3.Database('my.db')
    let nilai = req.body.deskripsi
    let sintaks = `INSERT INTO TODOTABLE (TODO) VALUES ('${nilai}')`
    db.run(sintaks)
    db.close()
    res.end()
})

app.delete('/todo/:id', auth, function(req, res){
    let db = new sqlite3.Database('my.db')
    let id = req.params.id
    let sintaks = `DELETE FROM TODOTABLE WHERE ID=${id}`
    db.run(sintaks)
    db.close()
    res.end()
})

app.get('/user', auth, function(req, res){
    let db = new sqlite3.Database('my.db')
    let sintaks = "SELECT * FROM USER"
    db.all(sintaks, function(err, rows){
        res.json(rows)
    })
    db.close()
})

app.post('/user', function(req, res, next){
    console.log('test1')
    let db = new sqlite3.Database('my.db')
    db.all('SELECT * FROM USER', function(err, rows){
        if(rows.length){
            auth(req, res, next)
        }
        else{
            next()
        }
    })
    db.close()
} , function(req, res){
    console.log('test2')
    let db = new sqlite3.Database('my.db')
    let username = req.body.username
    let password = req.body.password
    bcrypt.hash(password, saltRounds, (err, hash) => {
        let sintaks = `INSERT INTO USER (USERNAME, PASSWORD) VALUES ('${username}','${hash}')`
        db.all(`SELECT * FROM USER WHERE USERNAME="${username}"`, function(err, rows){
            if(rows.length){
                res.send('User already exist, try another')
            }
            else{
                db.run(sintaks)
                db.close()
                res.end()
            }
        })
    });
})

app.delete('/user/:id', auth, function(req, res){
    let db = new sqlite3.Database('my.db')
    let id = req.params.id
    let sintaks = `DELETE FROM USER WHERE ID=${id}`
    db.run(sintaks)
    db.close()
    res.end()
})

app.listen(3000, function(){console.log('Server started')})