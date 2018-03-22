// interact.js
// CS275 Term Project - Dungeon Dilemma
// Vincent Nguyen 
// March 2018

// *** SETTINGS ***

var MAXHEALTH = 30
var playerHealth = 30

var MINSTART = 10
var MAXSTART = 50
// Keep max health between MINSTART and MAXSTART
function checkHealth() {
    var hp = document.getElementById("startHealth")
    if(hp.value > MAXSTART)
        hp.value = MAXSTART
    else if(hp.value < MINSTART)
        hp.value = MINSTART
    MAXHEALTH = hp.value
}

var MINBOARDLEN = 5
var MAXBOARDLEN = 8
var boardLen = 6
// Keep board length between MINBOARDLEN and MAXBOARDLEN
function checkBoardLen() {
    var len = document.getElementById("boardLen")
    if(len.value > MAXBOARDLEN)
        len.value = MAXBOARDLEN
    else if(len.value < MINBOARDLEN)
        len.value = MINBOARDLEN
    boardLen = len.value
}

// Clears the board and resets numbers
function clearWorld() {
    if(confirm("This will end the game in progress. Continue?")) {
        document.getElementById('board').innerHTML = ''
        inProgress = false
        document.getElementById('new').style.display = "inline"
        document.getElementById('reset').style.display = "none"
        updateText()
        document.getElementById('eventDesc').innerHTML = 'Board cleared.'
    }
}

// Switches to login screen
function toLogin() {
    if(confirm("Exit game?")) {
        window.location = "login.html"
    }
}

// *** MODAL/MENU MANAGEMENT ***
// Show sets display to block, close sets display to none.
// While inMenu, player cannot move.

function showHelp() {
    var helpModal = document.getElementById("helpModal")
    helpModal.style.display = "block"
    inMenu = true
}

function closeHelp() {
    var helpModal = document.getElementById("helpModal")
    helpModal.style.display = "none"
    inMenu = false
}

function showSettings() {
    var settingsModal = document.getElementById("settingsModal")
    if(inProgress)
        document.getElementById('eventDesc').innerHTML = 'Cannot change settings while game in progress.'
    else {
        settingsModal.style.display = "block"
        inMenu = true
    }
}

function closeSettings() {
    var settingsModal = document.getElementById("settingsModal")
    settingsModal.style.display = "none"
    inMenu = false
}

function showBattle() {
    var battleModal = document.getElementById("battleModal")
    battleModal.style.display = "block"
    document.getElementById("atk").focus()
    inMenu = true
}

function closeBattle() {
    var battleModal = document.getElementById("battleModal")
    battleModal.style.display = "none"
    inMenu = false
}

function openSave() {
    var saveModal = document.getElementById("saveModal")
    saveModal.style.display = "block"
    inMenu = true
}

function closeSave() {
    var saveModal = document.getElementById("saveModal")
    saveModal.style.display = "none"
    inMenu = false
}

// *** GLOBAL VARIABLES ***

// NOTE: X, Y correspond to table row, column respectively. (Do not think in terms of graph coordinates!)
var playerPosX, playerPosY = 0
var playerPos = ''

var level = 1
var gold = 0

var inMenu = false
var inProgress = false
var wait = false

// *** GAME ***

// Check if game in progress, then set initial values and set up board
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
    document.getElementById("board").style.opacity = 1;
}

// Check for active game, then AJAX request with all data to be stored
function saveGame() {
    if(!inProgress) {
        document.getElementById("saveMsg").innerHTML = "No game active."
        return
    }
    console.log("Saving...")
    // Post to server
    var id = document.getElementById("sessionID").value
    var pos = playerPosX + ',' + playerPosY
    var URL = 'save?id=' + id + '&pp=' + pos + '&lvl=' + level + '&hp=' + playerHealth + '&max=' + MAXHEALTH + '&gold=' + gold
    $.ajax(URL, {
        type: "GET",
        url: URL,
        datatype: "jsonp",
        success: function(msg) {
            if(msg == "dup") {
                // If duplicate key, ask for overwrite
                if(confirm("Game already exists with that name. Overwrite?")) {
                    var DEL = 'delete?id=' + id
                    $.ajax(DEL, {
                        type: "GET",
                        url: URL,
                        datatype: "jsonp",
                        success: function(msg) {
                            console.log("Previous save deleted.")
                            saveGame()
                            console.log("Game overwritten.")
                        },
                        error: function() {
                            console.log("Error during save.")
                        }
                    })
                }
            }
            else {
                document.getElementById("saveMsg").innerHTML = "Game saved"
            }
        },
        error: function() {
            console.log("Error during save.")
        }
    })
}

// Check if game in progress then AJAX request for session given by ID
function loadGame() {
    if(inProgress) {
        if(!confirm("End current session and load different game?")) {
            return
        }
    }
    console.log("Loading...")
    var id = document.getElementById("sessionID").value
    var URL = 'load?id=' + id
    $.ajax(URL, {
        type: "GET",
        url: URL,
        datatype: "jsonp",
        success: function(msg) {
            if(msg == 'err') {
                document.getElementById("saveMsg").innerHTML = "Could not load game."
                return
            }
            var dat = msg.split(' ')
            playerPos = dat[0]
            var pos = playerPos.split(',')
            playerPosX = parseInt(pos[0])
            playerPosY = parseInt(pos[1])
            level = parseInt(dat[1])
            playerHealth = parseInt(dat[2])
            MAXHEALTH = parseInt(dat[3])
            gold = parseInt(dat[4])
            inProgress = true

            var board = msg
            var str = ''
            for(var i = 0; i < boardLen; i++) {
                str += '<tr>'
                for(var j = 0; j < boardLen; j++) {
                    var tid = board[i][j]
                    str += '<td id="(' + i + ',' + j + ')"> </td>'
                }
                str += '</tr>'
            }
            document.getElementById("board").innerHTML = str
            setPlayer()
            visitTile()
            document.getElementById("board").style.opacity = 1;
            document.getElementById('reset').style.display = "inline"
            document.getElementById('new').style.display = "none"
            updateText()
            updateTiles()
            console.log("Game loaded.")
            return
        },
        error: function() {
            document.getElementById("saveMsg").innerHTML = "Could not load game."
            console.log("Error during load.")
        }
    })
}

// Reveal all discovered tiles (on load)
function updateTiles() {
    console.log("Updating tiles...")
    var URL = 'update'
    $.ajax(URL, {
        type: "GET",
        url: URL,
        datatype: "text",
        success: function(msg) {
            var len = Math.sqrt(msg.length)
            var t = 0
            for(var i = 0; i < len; i++) {
                for(var j = 0; j < len; j++) {
                    var pos = '(' + i + ',' + j + ')'
                    var tile = document.getElementById(pos)
                    if(msg.charAt(t) == 'd') {
                        tile.className = 'discovered'
                    }
                    else if(msg.charAt(t) == 't') {
                        tile.className = 'foundevent'
                    }
                    else if(msg.charAt(t) == 'b') {
                        tile.className = 'battle'
                    }
                    else if(msg.charAt(t) == 'e') {
                        tile.className = 'exit'
                    }
                    else if(msg.charAt(t) == 'l') {
                        tile.className = 'lucky'
                    }
                    t++
                }
            }
            return
        },
        error: function() {
            console.log("Error while updating tiles.")
        }
    })
}

// *** PLAYER CONTROLLERS ***

// Sets player position to (x,y)
function setSpawn(x, y) {
    playerPosX = x
    playerPosY = y
    playerPos = '(' + playerPosX + ',' + playerPosY + ')'
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

// Moves the player up, down, left, or right
$(document).keydown(function movePlayer(e) {
    if(wait == false) {
        var player = document.getElementById("player")
        if(typeof playerPosX == 'string' || typeof playerPosY == 'string') {
            playerPosX = parseInt(playerPosX)
            playerPosY = parseInt(playerPosY)
        }
        if(!player || inMenu == true)
            return
        else if(e.key == 'w' || e.key == 'W' || e.which == '38') { // 'w' or 'up arrow'
            if(playerPosX <= 0)
                return
            else {
                playerPosX -= 1
            }
        }
        else if(e.key == 'a' || e.key == 'A' || e.which == '37') { // 'a' or 'left arrow'
            if(playerPosY <= 0)
                return
            else {
                playerPosY -= 1
            }
        }
        else if(e.key == 's' || e.key == 'S' || e.which == '40') { // 's' or 'down arrow'
            if(playerPosX >= boardLen - 1)
                return
            else {
                playerPosX += 1
            }
        }
        else if(e.key == 'd' || e.key == 'D' || e.which == '39') { // 'd' or 'right arrow'
            if(playerPosY >= boardLen - 1)
                return
            else {
                playerPosY += 1
            }
        }
        else {
            return
        }
        wait = true
        setPlayer()
        visitTile()
        // visit() /* Offline mode only */
    }
})

// *** EVENTS *** 

// Rewards player with gold and sometimes health
function playEvent() {
    var bonus = Math.floor(Math.random() * 2)
    var gain = bonus + 1
    gold += gain
    if(bonus < 1) {
        playerHealth += 1
        if(playerHealth > MAXHEALTH)
            playerHealth = MAXHEALTH
        document.getElementById("playerHealth").innerHTML = playerHealth + "/" + MAXHEALTH + "  (<b style='color: green'>+1</b>)"
        document.getElementById("eventDesc").innerHTML = 'You found a health potion among the treasure. <br> Gold +' + gain + ', Health +1'
    }
    else {
        document.getElementById("eventDesc").innerHTML = 'You found some gold pieces. <br> Gold +' + gain
        document.getElementById("playerHealth").innerHTML = playerHealth + "/" + MAXHEALTH
    }
    document.getElementById("gold").innerHTML = gold + "  (<b style='color: yellow'>+" + gain + "</b>)"
}

// Initiates a battle. Two buttons allow for battle decisions.
function playBattle() {
    var modal = document.getElementById("battleModal")
    showBattle()

    var atkBtn = document.getElementById("atk")
    var fleeBtn = document.getElementById("flee")
    var doneBtn = document.getElementById("leaveBattle")

    // Monster starts with 1 to 4 health.
    var monsterStartHP = Math.floor(Math.random() * 4 + 1)
    var monsterHealth = monsterStartHP
    var startHP = playerHealth
    var battleTxt = document.getElementById("battleText")

    document.getElementById("playerHP").innerHTML = playerHealth + "/" + MAXHEALTH
    document.getElementById("monsterHP").innerHTML = monsterHealth + "/" + monsterStartHP

    battleTxt.innerHTML = ""

    atkBtn.onclick = function() {
        // Player and monster have 10% chance to miss attack
        var mRoll = Math.floor(Math.random() * 10)
        var pRoll = Math.floor(Math.random() * 10)

        if(mRoll == 0)
            mAtk = mRoll
        else {
            mAtk = 1
        }
        if(pRoll == 0)
            pAtk = pRoll
        else {
            pAtk = 1
        }

        monsterHealth -= pAtk
        playerHealth -= mAtk
        document.getElementById("playerHP").innerHTML = playerHealth + "/" + MAXHEALTH + "   (<b style='color: red'>-" + mAtk + "</b>)"
        document.getElementById("monsterHP").innerHTML = monsterHealth + "/" + monsterStartHP + "   (<b style='color: red'>-" + pAtk + "</b>)"

        if(mAtk == 0) {
            if(pAtk == 0)
                battleTxt.innerHTML = "You and the monster whiffed your attacks."
            if(pAtk == 1)
                battleTxt.innerHTML = "You dodge the monster's attack and deal 1 damage."
        }
        if(mAtk == 1) {
            if(pAtk == 0)
                battleTxt.innerHTML = "You miss, and the monster deals 1 damage to you."
            if(pAtk == 1)
                battleTxt.innerHTML = "You and the monster take 1 damage."
        }

        var hpDiff = startHP - playerHealth
        document.getElementById("playerHealth").innerHTML = playerHealth + "/" + MAXHEALTH + " (<b style='color: #b1183f'>-" + hpDiff + "</b>)"
        document.getElementById("eventDesc").innerHTML = 'You fought a monster and took ' + hpDiff + ' damage.'

        if(playerHealth <= 0) {
            // Player is defeated, game ends
            atkBtn.style.display = "none"
            fleeBtn.style.display = "none"
            doneBtn.style.display = "inline"
            battleTxt.innerHTML += " You are defeated."
            document.getElementById("eventDesc").innerHTML += '<br>Game Over.'
            document.getElementById("leaveBattle").focus()
            defeat()
        }
        else if(monsterHealth <= 0) {
            // Allows player to leave the battle screen
            atkBtn.style.display = "none"
            fleeBtn.style.display = "none"
            doneBtn.style.display = "inline"
            battleTxt.innerHTML += " The monster is slain!"
            document.getElementById("leaveBattle").focus()
        }
    }
    fleeBtn.onclick = function() {
        // Player uses 1/4 of gold to fleee if they have 4+ gold.
        if(gold < 4)
            battleTxt.innerHTML = "Cannot flee!"
        else {
            diff = Math.floor(gold * (1/4))
            gold -= diff
            document.getElementById("gold").innerHTML = gold + "  (<b style='color: red'>-" + diff + "</b>)"
            document.getElementById("eventDesc").innerHTML = "You toss some treasure at the monster to distract it as you flee."
            closeBattle()
        }
    }
    doneBtn.onclick = function() {
        // Closes the battle modal.
        closeBattle()
        if(playerHealth <= 0)
            inMenu = true
        atkBtn.style.display = "inline"
        fleeBtn.style.display = "inline"
        doneBtn.style.display = "none"
    }
    document.getElementById("gold").innerHTML = gold
}

// Player receives 5 health
function playLucky() {
    playerHealth += 5
    if(playerHealth > MAXHEALTH)
        playerHealth = MAXHEALTH
    document.getElementById("playerHealth").innerHTML = playerHealth + "/" + MAXHEALTH + " (<b style='color: green'>+5</b>)"
    document.getElementById("eventDesc").innerHTML = 'You find a large health potion. <br> Health +5'
    document.getElementById("gold").innerHTML = gold
}

// Exit a level or finish the game if level 10
function exit() {
    if(level == 10) {
        finish()
        return
    }
    if(confirm("You've reached the exit. Proceed to next level?")) {
        level += 1
        requestBoard()
        // setBoard()
    }
    else {
        console.log('Exit canceled')
    }
    return
}

// *** END GAME ***

// Prompt for score submission. Can be abused by constant loads.
function finish() {
    var name = prompt("You reached the end! Treasures collected: " + gold + "\nEnter a name to submit your score: ", "")
    if(!name) {
        if(confirm("Finish without submitting score?")) {
            document.getElementById("player").outerHTML = ''
            return
        }
        else
            finish()
    }
    var URL = 'finish?name=' + name + '&score=' + gold
    $.ajax(URL, {
        type: "GET",
        url: URL,
        success: function(msg) {
            if(msg == 'dup') {
                alert("Name taken. Try a different one.")
                finish()
            }
            else {
                alert("Score submitted")
                document.getElementById("player").outerHTML = ''
            }
        },
        error: function() {
            console.log("Error during score submission")
        }
    })
}

// End the game without submitting score
function defeat() {
    alert("Game over. You collected " + gold + " treasures.")
    document.getElementById("board").style.opacity = 0.5;
    document.getElementById('new').style.display = "inline"
    document.getElementById('reset').style.display = "none"
    inProgress = false
}

// *** SERVER SIDE FUNCTIONALITY ***

// Set player position to 0,0 and request board
function newGame() {
    playerPosX = 0
    playerPosY = 0
    playerHealth = MAXHEALTH
    gold = 0
    level = 1
    inProgress = true
    document.getElementById("board").style.opacity = 1;
    document.getElementById('reset').style.display = "inline"
    document.getElementById('new').style.display = "none"
    updateText()
    requestBoard()
}

// Request a random board from the server with specified player position and board length
function requestBoard() {
    playerPos = playerPosX + ',' + playerPosY
    var URL = 'board?pp=' + playerPos + '&len=' + boardLen
    $.ajax(URL, {
        type: "GET",
        url: URL,
        datatype: "text",
        success: function(msg) {
            var board = msg
            var str = ''
            for(var i = 0; i < boardLen; i++) {
                str += '<tr>'
                for(var j = 0; j < boardLen; j++) {
                    var tid = board[i][j]
                    str += '<td id="(' + i + ',' + j + ')"> </td>'
                }
                str += '</tr>'
            }
            document.getElementById("board").innerHTML = str
            setPlayer()
            visitTile()
            return
        }
    })
}

// Change the tile the player is on
function updateTile() {
    var tile = document.getElementById('(' + playerPosX + ',' + playerPosY + ')')
    if(tile.className == 'foundevent') {
        tile.innerHTML += "<div class='token' id='treasure'></div>"
        playEvent()
    }
    else if(tile.className == 'battle') {
        tile.innerHTML += "<div class='token' id='monster'></div>"
        playBattle()
    }
    else if(tile.className == 'lucky') {
        tile.innerHTML += "<div class='token' id='lucky'></div>"
        playLucky()
    }
    else if(tile.className == 'exit') {
        exit()
    }
    else
        updateText()
}

// Update text in navigation bar
function updateText() {
    document.getElementById('level').innerHTML = level
    document.getElementById('playerHealth').innerHTML = playerHealth + "/" + MAXHEALTH
    document.getElementById('gold').innerHTML = gold
    document.getElementById('eventDesc').innerHTML = ''
}

// Send player position to server then update tile
function visitTile() {
    playerPos = playerPosX + ',' + playerPosY
    var URL = 'visit?pp=' + playerPos
    $.ajax(URL, {
        type: "GET",
        url: URL,
        datatype: "text",
        success: function(msg) {
            var tile = document.getElementById('(' + playerPosX + ',' + playerPosY + ')')
            if(msg == 'u')
                tile.className = 'discovered'
            else if(msg == 'x')
                tile.className = 'foundevent'
            else if(msg == '?')
                tile.className = 'battle'
            else if(msg == 'o')
                tile.className = 'exit'
            else if(msg == 'e')
                tile.className = 'exit'
            else if(msg == 'h')
                tile.className = 'lucky'
            else {
                wait = false
                return
            }
            updateTile()
            wait = false
            return
        }
    })
}


// *** OFFLINE (CLIENT-SIDE) FUNCTIONALITY [DEPRECATED] ***

// Set length of board then generate it
function setBoard() {
    if(level == 1) {
        setSpawn(0, 0)
    }
    else {
        setSpawn(exitPosX, exitPosY)
    }

    document.getElementById("level").innerHTML = level
    document.getElementById("playerHealth").innerHTML = playerHealth + "/" + MAXHEALTH
    document.getElementById("gold").innerHTML = gold
    makeBoard()
}

// Generates a table with coordinates starting from top left = (0,0)
function makeBoard() {
    var board = document.getElementById("board")
    var str = ''
    if(boardLen < 1) {
        console.log("Board too small.")
        return
    }
    for(var j = 0; j < boardLen; j++) {
        str += '<tr>'
        for(var i = 0; i < boardLen; i++) {
            str += '<td class="undiscovered" id=(' + i + ',' + j + ')> </td>'
        }
        str += '</tr>'
    }
    board.innerHTML = str
    for(var k = 0; k < boardLen * boardLen; k++)    
        setEvent()
    setExit()
    setPlayer()
    visit()
}

// Randomize a tile
function setTile() {
    var roll = Math.floor(Math.random() * 100)
    var str = ''
    if(level < 5) {
        if(roll > 75 && roll <= 100)
            return 'hidbattle'
        else if(roll >= 0 && roll < 25)
            return 'hidevent'
        else if(roll >= 25 && roll < 30)
            return 'hidlucky'
        else
            return 'undiscovered'
    }
    else {
        if(roll > 60 && roll <= 100)
            return 'hidbattle'
        else if(roll >= 0 && roll < 30)
            return 'hidevent'
        else if(roll >= 30 && roll < 35)
            return 'hidlucky'
        else
            return 'undiscovered'
    }
}

// Creates an event at a pseudo-random location
function setEvent() {
    eventPosX = Math.floor(Math.random() * boardLen)
    eventPosY = Math.floor(Math.random() * boardLen)
    eventPos = '(' + eventPosX + ',' + eventPosY + ')'
    if(eventPos == playerPos) {
        setEvent()
    }
    var tile = document.getElementById(eventPos)
    tile.className = setTile()
}

// Set the exit tile
function setExit() {
    exitPosX = Math.floor(Math.random() * boardLen)
    exitPosY = Math.floor(Math.random() * boardLen)
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
}

// Marks tiles as visited as the player reaches them
function visit() {
    var tile = document.getElementById(playerPos)
    if(tile.className == "undiscovered") {
        tile.className = "discovered"
        document.getElementById("eventDesc").innerHTML = ''
        document.getElementById("gold").innerHTML = gold
        document.getElementById("playerHealth").innerHTML = playerHealth + "/" + MAXHEALTH
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
}
