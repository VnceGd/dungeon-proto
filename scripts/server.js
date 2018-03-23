// server.js
// CS275 Term Project - Dungeon Dilemma
// Vincent Nguyen
// March 2018

// *** DATABASE CONNECTION ***
var mysql = require('mysql')
var con = mysql.createConnection({
    // Local database -- SET UP ON LOCAL MACHINE --
    // Database: dungeon_dilemma
    // Tables: sessions, scores
    host: 'localhost',
    user: 'root',
    password: 'myPreSeq34',
    database: 'dungeon_dilemma'
})
con.connect(function(err) {
    if(err)
        console.log(err)
    else {
        console.log("Connected to database.")
    }
})

// *** EXPRESS APP STARTUP ***
var express = require('express')
var app = express()
var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

app.use(express.static("."))
app.listen(8080, function() {
    // Local host
    console.log("App started")
})

var board = []
var boardlen;

app.post('/login', function(req, res) {
    var userID = req.body.userID
    var pass = req.body.password
    var sql = "SELECT * FROM users WHERE userID = ? AND password = ?"
    con.query(sql, [userID, pass], function(err, result) {
        if(err) {
            throw err
        }
        if(result.length > 0) {
            con.query("SELECT sessionID FROM users WHERE userID = '" + userID + "'", function(err, result) {
                if(err)
                    throw err
                else {
                    console.log(result[0].sessionID)
                    var URL = 'load?id=' + result[0].sessionID
                    res.send(result[0].sessionID)
                    console.log("Retrieved session")
                }
            })
        }
        else 
            res.send(null)
    })
})

app.post('/newUser', function(req, res) {
    var userID = req.body.userID
    var pass = req.body.password
    var sql = "SELECT * FROM users WHERE userID = ?"
    con.query(sql, [userID], function(err, result) {
        if(err) {
            throw err
        }
        if(result.length > 0)
            res.send("User already exists. Please try a different username.")
        else {
            con.query("INSERT into users (userID, password) values ('" + userID + "', '" + pass + "')",
            function(err, result) {
                if(err)
                    throw err
                else
                    res.send("User created.")
            })   
        }
    })
})

// Receives needed data and stores it into the local database
app.get('/save', function(req, res) {
    console.log("Saving session...")
    var id = req.query.id
    var pos = req.query.pp
    var level = req.query.lvl
    var hp = req.query.hp
    var maxHP = req.query.max
    var gold = req.query.gold
    var tiles = ''
    for(var i = 0; i < board.length; i++) {
        for(var j = 0; j < board.length; j++) {
            tiles += board[i][j]
        }
    }
    if(!id || !pos || !level || !hp || !maxHP || !tiles) {
        console.log("Error: Invalid parameters.")
        return
    }
    var vals = "'" + id + "', '" + pos + "', " + level + ", " + hp + ", " + maxHP + ", " + gold + ", '" + tiles + "'"
    var q = "INSERT into sessions (id, pos, level, health, maxhealth, gold, tiles) values ("
    q += vals + ")"
    /* Fast overwrite, unused */
    // q += "ON DUPLICATE KEY UPDATE "
    // q += "pos = '" + pos + "', level = " + level + ", health = " + hp + ", maxhealth = " + maxHP + ", gold = " + gold + ", tiles = '" + tiles + "'"
    con.query(q,
    function(err, rows, fields) {
        if(err) {
            console.log(err)
            console.log("Error during query processing")
            // If duplicate key entry, send message to ask for overwrite
            if(err.code == 'ER_DUP_ENTRY') {
                console.log("Duplicate detected.")
                res.send("dup")
            }
        }
        else {
            console.log(rows)
            console.log("Save successful")
            return
        }
    })
})

app.get('/load', function(req, res) {
    console.log("Loading session...")
    board = []
    var id = req.query.id
    con.query("SELECT * from sessions where id = '" + id + "'",
    function(err, rows, fields) {
        if(err) {
            console.log(err)
            console.log("Error during query processing")
            res.send("err")
            return
        }
        else {
            if(!rows[0]) {
                console.log("No column with id = " + id)
                res.send("err")
                return
            }   
            var pos = rows[0].pos
            var level = rows[0].level
            var health = rows[0].health
            var maxhealth = rows[0].maxhealth
            var gold = rows[0].gold
            var tiles = rows[0].tiles
            var data = pos + ' ' + level + ' ' + health + ' ' + maxhealth + ' ' + gold
            boardlen = Math.sqrt(rows[0].tiles.length)
            var tile = 0
            for(var i = 0; i < boardlen; i++) {
                board[i] = []
                for(var j = 0; j < boardlen; j++) {
                    board[i][j] = tiles.charAt(tile)
                    tile++
                }
            }
            console.log(board)
            res.send(data)
            return
        }
    })
})

app.get('/delete', function(req, res) {
    var id = req.query.id
    con.query("DELETE from sessions where id = '" + id + "'",
    function(err, rows, fields) {
        if(err) {
            console.log(err)
            console.log("Cannot delete column where id = " + id)
        }
        else {
            console.log(rows)
            res.send(id)
            return
        }
    })
})

// Generate a randomized board with specified player position and board length
// Board stored as matrix of characters
app.get('/board', function(req, res) {
    var playerPos = req.query.pp
    var splitPos = playerPos.replace('(' , '').replace(')', '').split(',')
    var playerPosX = splitPos[0]
    var playerPosY = splitPos[1]
    board = []
    boardlen = req.query.len
    console.log("Generating board with width " + boardlen)
    for(var i = 0; i < boardlen; i++) {
        board[i] = []
        for(var j = 0; j < boardlen; j++) {
            if(i == playerPosX && j == playerPosY) {
                console.log("Player at: " + i + ',' + j)
                board[i][j] = 'u'
            }
            else {
                var tile = Math.floor(Math.random() * 100)
                if(tile > 70 && tile <= 100) {
                    board[i][j] = 'x'
                }
                else if(tile >= 0 && tile < 30) {
                    board[i][j] = '?'
                }
                else if(tile >= 35 && tile < 40) {
                    board[i][j] = 'h'
                }
                else {
                    board[i][j] = 'u'
                }
            }
        }
    }
    do { // Make sure exit is not on same tile as player
        exitPosX = Math.floor(Math.random() * boardlen)
        exitPosY = Math.floor(Math.random() * boardlen)
    } while (exitPosX == playerPosX && exitPosY == playerPosY)
    board[exitPosX][exitPosY] = 'o'
    console.log(board)
    res.send(board)
})

// Changes the tile that the player is on top of
app.get('/visit', function(req, res) {
    // Player coordinates provided as (x,y) or x,y
    var playerPos = req.query.pp
    var splitPos = playerPos.replace('(' , '').replace(')', '').split(',')
    var x = splitPos[0]
    var y = splitPos[1]
    // Store current tile as tmp before updating
    tmp = board[x][y]
    if(board[x][y] == 'u') {
        board[x][y] = 'd'
    }
    else if(board[x][y] == 'x') {
        board[x][y] = 't'
    }
    else if(board[x][y] == '?') {
        board[x][y] = 'b'
    }
    else if(board[x][y] == 'h') {
        board[x][y] = 'l'
    }
    else if(board[x][y] == 'o') {
        board[x][y] = 'e'
    }
    // Send tmp tile
    res.send(tmp)
})

app.get('/update', function(req, res) {
    console.log("Update tiles requested")
    var tiles = ''
    for(var i = 0; i < board.length; i++) {
        for(var j = 0; j < board.length; j++) {
            tiles += board[i][j]
        }
    }
    res.send(tiles)
    return tiles
})

app.get('/finish', function(req, res) {
    console.log("Submitting score...")
    var name = req.query.name
    var score = req.query.score
    con.query("INSERT into scores (name, score) values ('" + name + "', " + score + ")",
    function(err, rows, fields) {
        if(err){
            console.log(err)
            if(err.code == "ER_DUP_ENTRY") {
                res.send("dup")
                return
            }
        }
        else {
            res.send("success")
            return
        }
    })
})