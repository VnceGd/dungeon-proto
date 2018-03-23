// login.js
// CS275 Term Project - Dungeon Dilemma
// Vincent Nguyen 
// March 2018

// Insecure login method using json
function login() {
    var iname = document.getElementById("exUser").value
    var ipass = document.getElementById("exPass").value
    $.ajax({
        type: "GET",
        url: URL = "../info/users.json",
        datatype: "json",
        success: function(json) {
            for(i = 0; i < json.users.length; i++) {
                if(json.users[i].name == iname) {
                    if(json.users[i].pass == ipass) {
                        console.log("Password matches")
                        startGame()
                    }
                }
            }
            console.log("Finished")
        }
    })
}

// DEPRECATED
// Inserts a user into the users.json file.
function makeUser() {
    var iname = document.getElementById("newUser").value
    var ipass = document.getElementById("newPass").value
    var exists = false
    $.ajax({
        type: "GET",
        url: URL = "../info/users.json",
        datatype: "json",
        success: function(json) {
            for(i = 0; i < json.users.length; i++) {
                if(json.users[i].name == iname) {
                    console.log("User exists")
                    exists = true
                    break
                }
            }
            if(!exists) {
                var obj = json['users'].push({"name": iname, "pass": ipass})
                postUser(obj)
                console.log(json.users)
            }
        }
    })
}

// Switches window to game
function startGame() {
    window.location = "../game.html"
}

function sqlLogin() {
    var usr = document.getElementById("exUser").value
    var pass = document.getElementById("exPass").value
    if(!usr || !pass) {
        return
    }
    else {
        var URL = 'login'
        var iname = $("#exUser").val()
        var ipass = $("#exPass").val()
        params = { userID: iname, password: ipass }
        $.ajax(URL, {
            type: "POST",
            url: URL,
            data: params,
            datatype: "html",
            success: function(msg) {
                if(msg.length <= 0) {
                    document.getElementById("output").innerHTML = "Password does not match."
                    return
                }
                else if(msg.length > 0) {
                document.getElementById("output").innerHTML = "Session found: " + msg
                    var URL = 'load?id=' + msg
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
            }
        })
    }
}

function newUser() {
    var URL = 'newUser'
    var iname = $("#newUser").val()
    var ipass = $("#newPass").val()
    params = { userID: iname, password: ipass }
    
    $.ajax({
        type: "POST",
        url: URL,
        data: params,
        datatype: "html",
        success: function(msg) {
            document.getElementById("output").innerHTML = msg
        }
    })
}