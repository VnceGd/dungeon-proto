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
