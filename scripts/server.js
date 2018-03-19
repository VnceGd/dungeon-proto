// server.js
// CS275 Term Project - Dungeon Dilemma
// Vincent Nguyen
// March 2018

// *** DATABASE CONNECTION ***
var mysql = require('mysql')
var con = mysql.createConnection({
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

app.use(express.static("."))
app.listen(8080, function() {
    console.log("App started")
})

var board = []
var boardlen;

app.post('/save', function(req, res) {
    console.log("Saving board...")
})

app.get('/finish', function(req, res) {
    console.log("Saving score...")
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
    // console.log("Board: " + board)
    // Send tmp tile
    res.send(tmp)
})