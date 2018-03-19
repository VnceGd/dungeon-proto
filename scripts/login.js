// login.js
// Vincent Nguyen 2018

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
    window.location = "../game.html"
}
