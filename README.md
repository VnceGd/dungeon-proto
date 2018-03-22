# dungeon-proto
A project for CS 275 (Web and Mobile App Development)

'Dungeon Dilemma' is a board game in which you control a hero that traverses rooms in a dungeon, with the goal of escaping through the 10 levels in the dungeon.

Visit 'https://vncegd.github.io/dungeon-proto/game.html' to play the game.
Note: The current available version does not allow for saving the game or user creation.

To learn how to play the game, click the 'Help' button on the left navigation bar.

Playing the game with the server side options requires the user to set up NodeJS and MySQL on a local machine.

From the top-level directory: '> node scripts/server'
    - Message "App started" indicates the server is running.
    
Modify parameters in 'server.js' to connect to a local database with the following structure:

    Tables:
    
        sessions (id varchar(16) key, pos varchar(3), level int, health int, maxhealth int, gold int, tiles varchar(64)
        
        scores (name varchar(32) key, score int)

Technologies Used:
    HTML
    CSS
    Javascript
    JQuery
    JSON
    AJAX
    NodeJS
    MySQL
