/*

*/

/*
**********************************
isolate the checkers game from the hooks added
to make use of ws.js. 

make pieces draggable and then modify event handling so
players may drag to play instead of clicking.  Add a
nearest-dark-square function

exercise: switch to proper checker board (play on darks,
and what is the bottom right square supposed to be?)

Add crown for kings, and make it automatic if you hit
the far row.  Fin.

*/

var MESSAGE_PROPERTIES = {
    "pieceId" : "PIECEID",
    "newTop" : "NEWTOP",
    "newLeft" : "NEWLEFT"
};

var readyToPlay = false;
var redplayer = false;
var channel = (Math.round (Math.random()*100000)).toString();
var destination = "/topic/checkers";

function setUpMessaging() {
    // construct the WebSocket location
    var locationURI = new URI(document.URL || location.href);

    locationURI.scheme = locationURI.scheme.replace("http", "ws");
    locationURI.path = "/jms";
    delete locationURI.query;
    delete locationURI.fragment;
    // default the location
    url = locationURI.toString();
    destination = destination + channel;
    ccps.startConnection(url, destination, init, MESSAGE_PROPERTIES, makeMove);
}

function init() {
}

function makeMove(messageData) {
    // console.log("rtp in make move is " + readyToPlay);
    // console.log(messageData);
    if (readyToPlay) {
        pieceToMove = document.getElementById(messageData.pieceId);
        $pieceToMove =$(pieceToMove);
        // console.log('pieceToMove ' + $pieceToMove);
        var top = messageData.newTop;
        var left = messageData.newLeft;
        // if (redplayer) {
        var coords = getCoords(parseInt(top, 10),parseInt(left, 10));
        var pixels = getPixels(coords.x, coords.y, true);
        top = pixels.top;
        left = pixels.left;
        // }
        $pieceToMove.css('top', top);
        $pieceToMove.css('left', left);
    }
}
    
function movePieceTo($piece,newTop,newLeft) {
    //set the css 'top' and 'left'
    //attributes of the passed piece
    //to the arguments newTop and newLeft
    // console.log('move piece ' + $piece);
    $piece.css('top', newTop);
    $piece.css('left', newLeft);
    // console.log("rtp in movePieceTo is " + readyToPlay);
    if (readyToPlay) {
        var newMessageData = {};
        newMessageData.pieceId = $piece[0].id;
        newMessageData.newTop = newTop;
        newMessageData.newLeft = newLeft;
        // console.log("sending ...");
        // console.log($piece);
        // console.log(newMessageData);
        ccps.sendMessagePlay(newMessageData);
    }
}

function setUpPieces() {
    //select all the divs with class 'piece'
    //add the 'red' class to half of them
    //add the 'blue' to the other half
    $('div.piece:even').addClass('red');
    $('div.piece:odd').addClass('blue');
}


function setUpBoard() {
    //iterate through all of the divs 
    //with class `square`
    //figure out whether each one should be
    //light or dark, and assign the proper class
    
    //heres a helper function that takes a number between
    //0 and 63 (inclusive) and returns 1 if the square should be
    //dark, and 0 if the square should be light
    function squareDark(index) {
        var x = index % 8;
        var y = Math.floor(index / 8);
        var oddX = x % 2;
        var oddY = y % 2;
        return (oddX ^ oddY);
    }
    $('.square').each(function(index, square){
        var $square = $(square);
        if (squareDark(index)) {
            $square.addClass('dark');
            console.log("set square dark", index);
        } else {
            $square.addClass('light');
        }
    });
}

function toggleSelect($piece) {
    //if $piece has the class 'selected',
    //remove it
    
    //if $piece does not have the class 'selected'
    //make sure no other divs with the class 'piece'
    //have that class, then set $piece to have the class
    if ($piece.hasClass('selected')) {
        $piece.removeClass('selected');
    } else {
        $('.piece').each(function(index, old) {
            var $old = $(old);
            $old.removeClass('selected');
        });
        $piece.addClass('selected');
    }
}

function incrementMoveCount() {
    //gets the html of the span with id
    //moveCount
    //turns it into a number
    //increments it by one
    //sets the html of the span with id moveCount
    //to the new move count
}


//global variables for one square
var width = 46;
var border = 2;

//utility function for translating an x,y coordinate
//to a pixel position
//the convention is that the square in the upper left
//corner is at position 0,0
//the square in the upper right, at 7,0 and the lower
//right at 7,7
function getPixels(x,y,flip) {
    //ok... so takes an x,y position, returns
    //pixels from the left, right
    if (flip) {
        // console.log("x, y are ", x, y);
        var xNew = 7-x;
        var yNew = 7-y;
        // console.log("flipping: new x = ", xNew, " new y = ", yNew);
        x = xNew;
        y = yNew;
    }
    return {
        'top':  (y * (width+border))+'px',
        'left': (x * (width+border))+'px'
    };
}

//utility function for turning a pixel position
//into the x,y coordinate of a square on the board
//it follows the same coordinate convention as getPixels
function getCoords(top,left) {
    //returns an x and a y
    //given a top and left pixels
    return {
        'x': left / (width + border),
        'y': top / (width + border)
    };
}



//utility function for returning
//the set of unoccupied dark squares
//(possible places to move a checker piece)
function getOpenSquares() {
    
    //select all of the squares
    var $squares = $('div.square');
    
    //select the occupied ones using the jQuery map() method
    //map creates a new object from an existing one
    //using a translation function
    var $takenSquares =
        $('div.piece').map(function(index,piece) {
            
            //this function translates a piece
            var position = $(piece).position();
            var coords = getCoords(position.top,position.left);
            var squareIndex = coords.y * 8 + coords.x;
            // if (redplayer) {
                // console.log("perhaps sqi should be ", 63-squareIndex);
                // squareIndex = 63-squareIndex;
            // }
            return $squares[squareIndex];
        });
    
    var $out = $('div.square.dark').not($takenSquares);
    return $out;
}

function switcheroo(id, msg) {
    setUpReds();
    setUpBlues();

    $('div.start').fadeOut(200, function () {
        $(id).fadeIn('fast');
    });
    $(id).text(msg);
    setUpMessaging();
    readyToPlay = true;
    $('#game').fadeTo('fast', 1);
}

function setUpReds() {
    //this loop moves all the light pieces to their initial positions
    $('div.piece.red').each(function(index,piece) {
        
        //turning the index (from 0 - 11)
        //into a x,y square coordinate using math
        var y = Math.floor(index / 4);
        var x = (index % 4) * 2 + (1 - y%2);
        
        //turning the x,y coordingate into a pixel position
        var pixelPosition = getPixels(x,y,redplayer);
        
        //actually moving the piece to its initial position
        movePieceTo($(piece),pixelPosition.top,pixelPosition.left);
        // $(piece).draggable();
    });
}

function setUpBlues() {
    //this loop moves all the dark pieces to their initial positions
    $('div.piece.blue').each(function(index,piece) {
        
        //turning the index (from 0 - 11)
        //into a x,y square coordinate using math
        var y = Math.floor(index/4) + 5;
        var x = (index % 4) * 2 + (1-y%2);
        
        //turning the x,y coordinate into a pixel position
        var pixelPosition = getPixels(x,y,redplayer);
        
        //moving the piece to its initial position
        movePieceTo($(piece),pixelPosition.top,pixelPosition.left);
        // $(piece).draggable();
    });
}


$('document').ready(function() {

    //Creating the 64 squares and adding them to the DOM
    var squareCount = 8*8;
    for (var i = 0;i<squareCount;i++) {
        
        //this line creates a new div with the class 'square'
        //and appends it to the div with id 'board'
        $('div#board').append($('<div/>').addClass('square'));
    }
    
    //set up the board with the correct classes
    //for the light and dark squares
    setUpBoard();
    
    
    //creating the 24 pieces and adding them to the DOM
    var pieceCount = 24;
    var newp;
    for (i=0;i<pieceCount;i++) {
        newp = "<div id=piece" + i + "/>";
        //this line appends an empty div
        //with the class 'piece' to the div with id 'pieces'
        $('div#pieces').append($(newp).addClass('piece'));
    }
    
    //sets up the classes for the different types of piece
    setUpPieces();
    // setUpReds();
    // setUpBlues();
    
    //set up initial squares
    //the class 'open' represents a square
    //that is unoccupied
    getOpenSquares().addClass('open');
    $('#game').fadeTo('fast', 0.25);

    // make start/join the same height
    $('#newgame').height($('#join').height());
    // set focus for joining a game
    $('input[name=ourChannel]').focus();

    // events for the startbar
    $('#newgame').click(function () {
        var msg = "Started new game, channel = " + channel;
        redplayer = false;
        switcheroo('#startednew', msg);
    });
    $('#join').click(function () {
        var ocIn = $('input[name=ourChannel]');
        if (ocIn.val() === "") {
            ocIn[0].previousSibling.textContent = 'Enter game channel id string to join or start a new game.';
            ocIn.focus();
        } else {
            channel = ocIn.val();
            redplayer = true;
            switcheroo('#joined', 'Joined game on channel ' + channel);
            // try setting them up all over again?
        }
    });
    $('#join').submit(function (event) {
        event.preventDefault();
    });
    
    //and now the game events
    $('div.piece').click(function() {
        if (!readyToPlay) {
            return;
        }
        //turn `this` into a jQuery object
        var $this = $(this);
        
        //toggleing the 'selected' class of this piece
        //and possible deselecting other pieces
        toggleSelect($this);
    });
    
    $('div.square').click(function() {
        if (!readyToPlay) {
            return;
        }
        
        //turn `this` into a jQuery object
        var $this = $(this);
        
        //if $this is a legal square to move to...
        if ($this.hasClass('open')) {
            
            //get the piece with the class 'selected'
            var $selectedPiece = $('div.piece.selected');
            
            //we only move if there is exactly one selected piece
            if ($selectedPiece.length == 1) {
                //get the index of the square
                //and translate it to pixel position
                var squareIndex = $this.prevAll().length;
                var x = squareIndex % 8;
                var y = Math.floor(squareIndex / 8);
                var pixels = getPixels(x,y,false);
                // console.log("index " + squareIndex + " x " + x + " y " + y);
                
                //actually do the moving
                movePieceTo($selectedPiece,pixels.top,pixels.left);
                
                //increment the move counter
                incrementMoveCount();
                
                //un-select the piece
                $selectedPiece.removeClass('selected');
                
                //set the new legal moves
                $('div.square').removeClass('open');
                getOpenSquares().addClass('open');
            }
            
        }
    });

});