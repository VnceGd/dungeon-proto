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
var gold = 0
var MAXHEALTH = 30
var playerHealth = MAXHEALTH

var inBattle = false
var inProgress = false

// Resets player to (0,0)
function setSpawn(x, y) {
    playerPosX = x
    playerPosY = y
    playerPos = '(' + playerPosX + ',' + playerPosY + ')'
    // console.log("Spawn set to" + playerPos)
}

function startGame() {
    if(inProgress) {
        if(confirm("Restart the game?")) {
            level = 1
            gold = 0
            playerHealth = MAXHEALTH
            setBoard()
        }
    }
    else {
        level = 1
        gold = 0
        playerHealth = MAXHEALTH
        setBoard()
    }
    inProgress = true
}

function saveGame() {
    console.log("Saving...")
    // Run save
    console.log("Game saved.")
}

// Sets width and height of board, then generates it
function setBoard() {
    // boardWidth = document.getElementById("width").value
    // boardHeight = document.getElementById("height").value
    boardWidth = boardHeight = 6
    if(level == 1) {
        setSpawn(0, 0)
    }
    else {
        setSpawn(exitPosX, exitPosY)
    }

    document.getElementById("level").innerHTML = level
    document.getElementById("playerHealth").innerHTML = playerHealth
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
    var roll = Math.floor(Math.random() * 100)
    var str = ''
    if(roll > 75 && roll <= 100)
        return 'hidbattle'
    else if(roll >= 0 && roll < 25)
        return 'hidevent'
    else if(roll >= 25 && roll < 30)
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
    tile.innerHTML += "<div class='token' id='player'> </div>"
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
    if(level == 1) {
        while(exitPosX == 0 && exitPosY == 0) {
            setExit()
        }
    }
    while(exitPosX < playerPosX + 2 && exitPosX > playerPosX - 2 && exitPosY < playerPosY + 2 && exitPosY < playerPosY - 2) {
        setExit()
    }
    var tile = document.getElementById(exitPos)
    tile.className = 'hidexit'
    // console.log("exit at: " + exitPos)
}

// Play event when player reaches certain coordinate
function playEvent() {
    console.log("Event!")
    gold += 1
    var bonus = Math.floor(Math.random())
    playerHealth += bonus
    if(bonus > 0)
        document.getElementById("eventDesc").innerHTML = 'You found a health potion among the treasure. Gold +1, Health +1'
    else
        document.getElementById("eventDesc").innerHTML = 'You found some gold pieces. Gold +1'
    document.getElementById("gold").innerHTML = gold
}

function playBattle() {
    console.log("Battle!")
    var modal = document.getElementById("battleModal")
    showBattle(modal)
    var atkBtn = document.getElementById("atk")

    inBattle = true
    monsterHealth = Math.floor(Math.random() * 4 + 1)
    document.getElementById("eventDesc").innerHTML = 'You fought a monster and took ' + monsterHealth + ' damage.'

    // document.getElementById("playerHealth").innerHTML = playerHealth
    document.getElementById("playerHP").innerHTML = playerHealth
    document.getElementById("monsterHP").innerHTML = monsterHealth

    console.log("Entering battle")
    atkBtn.onclick = function() {
        console.log("ATTACK")
        monsterHealth -= 1
        playerHealth -= 1
        document.getElementById("playerHP").innerHTML = playerHealth
        document.getElementById("monsterHP").innerHTML = monsterHealth
        if(monsterHealth <= 0) {
            closeBattle(modal)
            inBattle = false
            document.getElementById("playerHealth").innerHTML = playerHealth
        }
        if(playerHealth <= 0) {
            closeBattle(modal)
            document.getElementById("playerHealth").innerHTML = playerHealth
            defeat()
        }
    }
    console.log("Battle finished")
}

function showBattle(modal) {
    modal.style.display = "block"
    document.getElementById("atk").focus();
}

function closeBattle(modal) {
    modal.style.display = "none"
}

function playLucky() {
    console.log("Lucky!")
    playerHealth += 10
    if(playerHealth > MAXHEALTH)
        playerHealth = MAXHEALTH
    document.getElementById("playerHealth").innerHTML = playerHealth
    document.getElementById("eventDesc").innerHTML = 'You find a large health potion. Health +10'
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
    inProgress = false
}

function defeat() {
    alert("Game over. You collected " + gold + " treasures.")
    inProgress = false
}

// Marks tiles as visited as the player reaches them
function visit() {
    var tile = document.getElementById(playerPos)
    if(tile.className == "undiscovered") {
        tile.className = "discovered"
        document.getElementById("eventDesc").innerHTML = ''
    }
    if(tile.className == "hidevent") {
        tile.className = "foundevent"
        tile.innerHTML += "<div class='token' id='treasure'></div>"
        playEvent()
    }
    if(tile.className == "hidbattle") {
        tile.className = "battle"
        tile.innerHTML += "<div class='token' id='monster'></div>"
        playBattle()
    }
    if(tile.className == "hidlucky") {
        tile.className = "lucky"
        tile.innerHTML += "<div class='token' id='lucky'></div>"
        playLucky()
    }
    if(tile.className == "hidexit") {
        tile.className = "exit"
        document.getElementById("eventDesc").innerHTML = 'You found the exit!'
    }
    if(tile.className == "exit") {
        exit()
    }
    document.getElementById("playerHealth").innerHTML = playerHealth
}

// Moves the player up, down, left, or right
function movePlayer(e) {
    var player = document.getElementById("player")
    if(!player || inBattle == true)
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
    // console.log("Moved to (" + playerPosX + "," + playerPosY + ")")
}