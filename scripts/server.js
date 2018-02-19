// server.js
// Vincent Nguyen
// Feb 2018

var express = require('express')
var app = express()

app.use(express.static("."))
app.listen(8080, function() {
    console.log("App started")
})

function login() {
    var iname = document.getElementById("exUser").value
    var ipass = document.getElementById("exPass").value
    $.ajax({
        type: "GET",
        url: URL = "../dungeon-proto/info/users.json",
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

function makeUser() {
    var iname = document.getElementById("newUser").value
    var ipass = document.getElementById("newPass").value
    var exists = false
    $.ajax({
        type: "GET",
        url: URL = "../dungeon-proto/info/users.json",
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

function postUser(obj) {
    $.ajax({
        type: "POST",
        url: URL = "../dungeon-proto/info/users.json",
        data: obj,
        datatype: "json",
        success: function(json) {
            console.log(data)
        }
    })
}

function startGame() {
    window.location = "../dungeon-proto/game.html"
}
