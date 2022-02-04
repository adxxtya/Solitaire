var PegSolitaire = (function() {
    "use strict";

    // Global vars
    var pin = 0,
        rowPin = null,
        points = 0,
        movements = 0,
        streak = 1,
        activePin,
        messageTimeout = null,
        gameOver = true,
        map = [],
        boardContainer = document.getElementById("boardContainer"),
        divMovements = document.getElementById("totalMovements"),
        divPoints = document.getElementById("totalPoints"),
        divStreak = document.getElementById("streak");

    /**
     * Public funtions
     */
    var Public = {
        init: function() {
            var disabled = [1, 2, 6, 7, 8, 9, 13, 14, 36, 37, 41, 42, 43, 44, 48, 49],
                row = 1;


            boardContainer.innerHTML = "";


            for (var i = 1; i <= 49; i++) {
                var div = document.createElement('div');
                if (disabled.indexOf(i) >= 0) {
                    div.className = "square s-" + i + " disabled";
                } else {

                    if (map[i] !== undefined)
                        map.push(i);
                    if (i == 25) {
                        div.className = "square s-" + i + " empty";
                        div.setAttribute("data-hole", true);
                        map[i] = {
                            type: "hole",
                            row: row
                        };
                    } else {
                        div.className = "square s-" + i + " active";
                        map[i] = {
                            type: "pin",
                            row: row
                        };
                    }
                    div.addEventListener("click", Private.selectPin);
                }
                div.setAttribute("data-row", row);
                if (i % 7 == 0) {
                    row++;
                }
                div.setAttribute("data-index", i);
                boardContainer.appendChild(div);
            }
        },

        restartGame: function() {
            divMovements.innerHTML = "0";
            divPoints.innerHTML = "0";
            divStreak.innerHTML = "0";
            Helper.removeClass(divStreak, "visible");
            Helper.removeClass(boardContainer, "blocked");
            map = [];
            points = 0;
            movements = 0;
            streak = 1;
            activePin = null;
            gameOver = true;


            Public.init();
        }
    };

    var Private = {
        selectPin: function() {
            var allowedTarget = this.getAttribute("data-hole") ? true : false;

            if (allowedTarget) {
                if (pin > 0) {
                    var allowMove = false,
                        direction,
                        deletePinIndex,
                        deletePin,
                        indexTarget = parseInt(this.getAttribute("data-index")),
                        rowPinTarget = parseInt(this.getAttribute("data-row")),
                        possibleTargets = [{
                            "position": parseInt(pin + 2),
                            "direction": "r",
                            row: rowPinTarget
                        }, {
                            "position": parseInt(pin - 2),
                            "direction": "l",
                            row: rowPinTarget
                        }, {
                            "position": parseInt(pin + 14),
                            "direction": "b"
                        }, {
                            "position": parseInt(pin - 14),
                            "direction": "t"
                        }];



                    for (var k in possibleTargets) {
                        if (possibleTargets[k]["position"] == indexTarget) {
                            direction = possibleTargets[k]["direction"];
                            if (direction == "l" || direction == "r") {
                                if (possibleTargets[k]["row"] != rowPin) {
                                    allowMove = false;
                                } else {
                                    allowMove = true;
                                }
                            } else {
                                allowMove = true;
                            }
                        }
                    }

                    switch (direction) {
                        case "l":
                            deletePinIndex = parseInt(pin - 1);
                            break;
                        case "r":
                            deletePinIndex = parseInt(pin + 1);
                            break;
                        case "b":
                            deletePinIndex = parseInt(pin + 7);
                            break;
                        case "t":
                            deletePinIndex = parseInt(pin - 7);
                            break;
                    }
                    deletePin = document.querySelector(".s-" + deletePinIndex + ".active");


                    if (allowMove && deletePin) {
                        this.removeAttribute("data-hole");
                        Helper.removeClass(this, "empty");
                        Helper.addClass(this, "active");

                        activePin.setAttribute("data-hole", true);
                        Helper.removeClass(activePin, "active");
                        Helper.addClass(activePin, "empty");

                        deletePin = document.querySelector(".s-" + deletePinIndex);
                        deletePin.setAttribute("data-hole", true);
                        Helper.removeClass(deletePin, "active");
                        Helper.addClass(deletePin, "empty");

                        map[pin].type = "hole";
                        map[deletePinIndex].type = "hole";
                        map[indexTarget].type = "pin";

                       
                        movements++;
                        if (movements % 4 == 0) {
                            streak++;
                        }
                        points += streak * 100;

                        pin = 0;

                        if (streak >= 2) {
                            divStreak.innerHTML = "x" + streak;
                            Helper.addClass(divStreak, "visible");
                        }
                        divMovements.innerHTML = movements;
                        divPoints.innerHTML = points;

                        gameOver = Private.checkGameOver();
                        if (gameOver) {
                            Private.showMessage("GAME OVER");
                            Helper.addClass(boardContainer, "blocked");
                        }
                    } else {
                        Private.showMessage("You cannot perform this move.");
                        return;
                    }
                } else {
                    Private.showMessage("There is no piece selected.");
                    return;
                }
            } else {
                var activeClass = this.className,
                    allPins = document.getElementsByClassName("active");

                pin = parseInt(this.getAttribute("data-index"));
                rowPin = parseInt(this.getAttribute("data-row"));
                activePin = this;

                if (Helper.hasClass(this, "selected")) {
                    this.classList.remove("selected");
                    pin = 0;
                } else {
                    for (var p = 0; p <= allPins.length; p++) {
                        Helper.removeClass(allPins[p], "selected");
                    }
                    Helper.addClass(this, "selected");
                }
            }
        },

        /**
         * 
         * @param {String} message 
         */
        showMessage: function(message) {
            var divMessage = document.getElementById("message");

            if (message) {
                divMessage.textContent = message;
                Helper.addClass(divMessage, "visible");

                if (messageTimeout) {
                    clearTimeout(messageTimeout);
                    messageTimeout = null;
                }
                messageTimeout = setTimeout(function() {
                    Helper.removeClass(divMessage, "visible");
                }, 3000);
            } else {
                console.warn("Parâmetro 'message' inválido.");
            }
        },


        checkGameOver: function() {
            var allPins = document.querySelectorAll("div[data-hole='true']");
            for (var p = 0; p <= allPins.length; p++) {
                if (allPins[p]) {
                    var indexHole = parseInt(allPins[p].getAttribute("data-index")),
                        rowPinHole = parseInt(allPins[p].getAttribute("data-row"))
                        //top
                    if (map[(indexHole - 7)] && map[(indexHole - 14)]) {
                        if (map[(indexHole - 7)].type == "pin" && map[(indexHole - 14)].type == "pin") {
                            gameOver = false;
                            break;
                        } else {
                            console.log(indexHole);
                            gameOver = true;
                        }
                    }
                    //bottom
                    if (map[(indexHole + 7)] && map[(indexHole + 14)]) {
                        if (map[(indexHole + 7)].type == "pin" && map[(indexHole + 14)].type == "pin") {
                            gameOver = false;
                            break;
                        } else {
                            console.log(indexHole);
                            gameOver = true;
                        }
                    }
                    //left
                    if (map[(indexHole - 1)] && map[(indexHole - 2)]) {
                        if (map[(indexHole - 1)].type == "pin" && map[(indexHole - 2)].type == "pin") {
                            if (rowPinHole == map[(indexHole - 1)].row && rowPinHole == map[(indexHole - 2)].row) {
                                gameOver = false;
                                break;
                            } else {
                                console.log(indexHole);
                                gameOver = true;
                            }
                        }
                    }
                    //right
                    if (map[(indexHole + 1)] && map[(indexHole + 2)]) {
                        if (map[(indexHole + 1)] == "pin" && map[(indexHole + 2)] == "pin") {
                            if (rowPinHole == map[(indexHole - 1)].row && rowPinHole == map[(indexHole - 2)].row) {
                                gameOver = false;
                                break;
                            } else {
                                console.log(indexHole);
                                gameOver = true;
                            }
                        }
                    }
                }
            }
            return gameOver;
        }
    };
    
    return Public;
})();
PegSolitaire.init();





