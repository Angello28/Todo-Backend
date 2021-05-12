const express = require('express')

const cors = require('cors')

const sqlite3 = require('sqlite3').verbose()

const app = express()

const bodyParser= require('body-parser')

app.use(bodyParser())

app.use(cors())

app.use(express.static('public'))

app.get(`/`, function(req, res){
    res.send(
        `<html>
            <head>
                <link rel="stylesheet" href="/style.css"/>
            </head>
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

app.get('/todo', function(req, res){
    let db = new sqlite3.Database('my.db')
    let sintaks = "SELECT * FROM TODOTABLE"
    db.all(sintaks, function(err, rows){
        res.json(rows)
    })
    db.close()
})

app.post('/todo', function(req, res){
    let db = new sqlite3.Database('my.db')
    let nilai = req.body.deskripsi
    let sintaks = `INSERT INTO TODOTABLE (TODO) VALUES ('${nilai}')`
    db.run(sintaks)
    db.close()
    res.send(
        `<html>
            <head>
                <link rel="stylesheet" href="/style.css"/>
            </head>
            <body class="tebal">
                Your Response was Submitted
            </body>
        </html>`
    )
})

app.delete('/todo/:id', function(req, res){
    let db = new sqlite3.Database('my.db')
    let id = req.params.id
    let sintaks = `DELETE FROM TODOTABLE WHERE ID=${id}`
    db.run(sintaks)
    db.close()
    res.end()
})

app.listen(3000, function(){console.log('Server started')})