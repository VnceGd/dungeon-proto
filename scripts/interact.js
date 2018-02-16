// interact.js
// Vincent Nguyen 2018

var playerPosX, playerPosY = 0
var playerPos = ''
var boardWidth = 5
var boardHeight = 5

var eventPosX = boardWidth
var eventPosY = boardHeight
var eventPos = '(' + eventPosX + ',' + eventPosY + ')'

var exitPosX = boardWidth
var exitPosY = boardHeight
var exitPos = '(' + exitPosX + ',' + exitPosY + ')'

var level = 1

// Resets player to (0,0)
function setSpawn(x, y) {
    playerPosX = playerPosY = 0
    playerPos = '(' + playerPosX + ',' + playerPosY + ')'
}

function startGame() {
    level = 1
    setBoard()
}

// Sets width and height of board, then generates it
function setBoard() {
    // boardWidth = document.getElementById("width").value
    // boardHeight = document.getElementById("height").value
    boardWidth = boardHeight = level + 4
    if(level == 1) {
        setSpawn(0, 0)
    }
    else {
        setSpawn(Math.floor(Math.random * boardWidth), Math.floor(Math.random * boardHeight))
    }
    document.getElementById("level").innerHTML = level
    makeBoard()
}

// Generates a table with coordinates starting from top left = (0,0)
function makeBoard() {
    var board = document.getElementById("board")
    var str = ''
    if(boardWidth < 1 || boardHeight < 1) {
        console.log("Cannot create board.")
        return
    }
    for(var j = 0; j < boardHeight; j++) {
        str += '<tr>'
        for(var i = 0; i < boardWidth; i++) {
            str += '<td class="undiscovered" id=(' + i + ',' + j + ')> </td>'
        }
        str += '</tr>'
    }
    board.innerHTML = str
    for(var k = 0; k < boardWidth * boardHeight; k++)    
        setEvent()
    setExit()
    setPlayer()
    visit()
}

function setTile() {
    var roll = Math.floor(Math.random() * 10)
    var str = ''
    if(roll > 7 && roll < 10)
        return 'hidbattle'
    if(roll > 3 && roll < 7)
        return 'hidevent'
    if(roll == 7)
        return 'hidlucky'
    else
        return 'undiscovered'
}

// Deletes the current player
function deletePlayer() {
    var player = document.getElementById("player")
    if(player)
        player.remove()
}

// Sets the player position
function setPlayer() {
    deletePlayer()
    playerPos = '(' + playerPosX + ',' + playerPosY + ')'
    var tile = document.getElementById(playerPos)
    tile.innerHTML += '<div id="player"> </div>'
}

// Creates an event at a pseudo-random location
function setEvent() {
    eventPosX = Math.floor(Math.random() * boardWidth)
    eventPosY = Math.floor(Math.random() * boardHeight)
    eventPos = '(' + eventPosX + ',' + eventPosY + ')'
    if(eventPos == playerPos) {
        setEvent()
    }
    var tile = document.getElementById(eventPos)
    tile.className = setTile()
}

function setExit() {
    exitPosX = Math.floor(Math.random() * boardWidth)
    exitPosY = Math.floor(Math.random() * boardHeight)
    exitPos = '(' + exitPosX + ',' + exitPosY + ')'
    if(exitPosX < playerPosX + 2 && exitPosX > playerPosX - 2 && exitPosY < playerPosY + 2 && exitPosY < playerPosY - 2) {
        setExit()
    }
    var tile = document.getElementById(exitPos)
    tile.className = 'hidexit'
    console.log("exit at: " + exitPos)
}

// Play event when player reaches certain coordinate
function playEvent() {
    console.log("Event!")
}

function playBattle() {
    console.log("Battle!")
}

function playLucky() {
    console.log("Lucky!")
}

function exit() {
    if(level == 10) {
        finish()
        return
    }
    if(confirm("You've reached the exit. Proceed to next level?")) {
        level += 1
        setBoard()
    }
    else {
        console.log('exit canceled')
    }
    return
}

function finish() {
    alert("You reached the end!")
}

// Marks tiles as visited as the player reaches them
function visit() {
    var tile = document.getElementById(playerPos)
    if(tile.className == "undiscovered") {
        tile.className = "discovered"
    }
    if(tile.className == "hidevent") {
        tile.className = "foundevent"
        playEvent()
    }
    if(tile.className == "hidbattle") {
        tile.className = "battle"
        playBattle()
    }
    if(tile.className == "hidlucky") {
        tile.className = "lucky"
        playLucky()
    }
    if(tile.className == "hidexit") {
        tile.className = "exit"
    }
    if(tile.className == "exit") 
        exit()
}

// Moves the player up, down, left, or right
function movePlayer(e) {
    var player = document.getElementById("player")
    if(!player)
        return
    if(e.code == 'KeyW') {
        if(playerPosY <= 0)
            return
        else {
            playerPosY -= 1
        }
    }
    if(e.code == 'KeyA') {
        if(playerPosX <= 0)
            return
        else {
            playerPosX -= 1
        }
    }
    if(e.code == 'KeyS') {
        if(playerPosY >= boardHeight - 1)
            return
        else {
            playerPosY += 1
        }
    }
    if(e.code == 'KeyD') {
        if(playerPosX >= boardWidth - 1)
            return
        else {
            playerPosX += 1
        }
    }
    setPlayer()
    visit()
    console.log("Moved to (" + playerPosX + "," + playerPosY + ")")
}