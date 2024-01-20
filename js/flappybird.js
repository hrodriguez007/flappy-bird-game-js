//board
//access to canvas tag
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34;//408px wide by 228px height = ratio 17/12 * 2 = 34/24
let birdHeight = 24;
let birdX = boardWidth/8; //bird x-axis
let birdY = boardHeight/2; //bird y-axis
let birdImg;

let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
}

//pipes
//use array for two pipes
let pipesArray = [];
let pipeWidth = 64; //384px wide by 3072 px height = ratio 1/8 * 8 = 64/512
let pipeHeight = 512;
let pipeX = boardWidth; //place pipe at top
let pipeY = 0; //place pipe in right corner

//declare pipes images
let topPipeImg;
let bottomPipeImg;

//game physics
let velocityX = -2; //how the pipes move left towards the bird

//to jump upward, need negative number 
//rate at which bird changes its y poisition
let velocityY = 0;//bird jump speed, need to have it change to jump when a key is pressed

//add gravity to bring bird down after each jump frame
//positive number to go downwards
let gravity = 0.4;

//for gameover when collision happens
let gameOver = false;

//score
let score = 0;//start at 0


//load canvas tag
window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");//to draw on board

    //draw the bird rectangle practice
    // context.fillStyle = "green";
    // context.fillRect(bird.x, bird.y, bird.width, bird.height);


    //load flappy bird image
    birdImg = new Image();
    birdImg.src = "images/flappybird.png";
    birdImg.onload = function() {
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    //load pipes images
    topPipeImg = new Image();
    topPipeImg.src = "images/toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "images/bottompipe.png";

    //place pipes in every frame
    setInterval(placePipes, 1500); //1.5s = 1500ms
    document.addEventListener("keydown", moveBird); //tap a key will call moveBird funtion
    //listen for the press a key to start the game
    //run only once so space and jump aren't the same once game 'starts'
    document.addEventListener("keydown", handleStart, {once: true});
    //game home screen
    context.fillStyle = "white";
    context.font = "20px courier";
    context.fillText("PRESS ANY KEY TO START", 50, 180);
}

//to update the frames as you play the game
function update() {
    requestAnimationFrame(update);
    //when gameover stop painting canvas
    if (gameOver) {
        return;
    }

    //clear previous frame to avoid stacking
    context.clearRect(0,0, board.width, board.height);

    //before bird position changed
    //need to apply gravity before velocityY
    velocityY += gravity;

    //before bird draw update the velocity position
    //negative number to move upwards
    // bird.y += velocityY;

    //limit how far bird can go up
    //0 is the top of the canvas
    bird.y = Math.max(bird.y + velocityY, 0);


    //draw bird for each frame
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    //gameover if you fall down w/o collision
    //canvas stops
    //y position of the bird has gone past height of canvas
    if (bird.y > board.height) {
        gameOver = true;
    }


    //update canvas to show pipes for each frame
    for(let i = 0; i < pipesArray.length; i++) {
        let pipe = pipesArray[i];
        pipe.x += velocityX; //over time top pipe is shift 2 left each frame
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        //update score after each pipe passed
        //pipe.x is left corner of pipe
        //add width to get right corner of pipe
        //once bird passes right corner of pipe increment score
        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; //needs to be 0.5 bec bottom & top pipe count as 2 (i.e. 2 * 0.5 = 1 point)
            pipe.passed =  true;
        }

        //for collision
        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    //clear pipes, memory issue and pipes move off canvas eventually
    //check x-position to see if has gone pass 0, a negative #
    //-pipeWidth = right side of pipe
    //pipes disappear only once the right side of pipe leaves the canvas
    while (pipesArray.length > 0 && pipesArray[0].x < -pipeWidth) {
        pipesArray.shift();//removes first pipe element from array
    }


    //draw the score
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);//x-axis position of 5, y-axis of 45

    //text on canvas when gameover
    if (gameOver) {
        context.fillStyle = "red";
        context.fillText("GAME OVER" , 5, 90); //x-axis positon of 5, y-axis of 90
    }
}

//press to start game
function handleStart() {
    // startScreenElem.classList.add("hide");
    requestAnimationFrame(update);
}

//have pipes show up every 1.5s and add to pipesArray
function placePipes() {
    //why place pipes there is gameover
    if (gameOver) {
        return;
    }

    //have pipes randomly show on y-axis height, adjust pipe y position
    //512/4 = 128 shifted pipe upwards
    //return number 0 - 0.9999 from Math.random
    //ex: return 0 then height be -128px (pipeHeight/4) 512/4
    //ex: return 1 then height be -128px - 256 (512/2) (256 is 2 times = 512)
    //pipeHeight/4 - pipeHeight/2 = -3/4 pipeHeight
    //range 1/4 height of pipe to 3/4 height of pipe shift upwards
    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2); 

    //open space for bird to go through
    let openingSpace = board.height/4; //equal to 1/4 of board height

    //variable to call the image with these parameters
    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false //check if bird has passed the pipe
    }

    pipesArray.push(topPipe);

    //bottom pipe image
    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipesArray.push(bottomPipe);
    

}

//to have the bird jump
function moveBird(e) {
    //for small screen use KeyX to avoid scrolling issues
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        velocityY = -6;

        //reset game with keystroke
        //reset properties to default values
        //over time as bird jumps, gravity is applied, only y-position changes
        //clear pipes set empty array
        if (gameOver) {
            bird.y = birdY;
            pipesArray = [];
            score = 0;
            gameOver = false;
        }
    }
}

//check for bird hit pipes
//a and b are two rectangles
//rectangles are to compare bird position and pipe position
function detectCollision(a, b) {
    //return a boolean
    return a.x < b.x + b.width && //less than
           a.x + a.width > b.x && //greater than
           a.y < b.y + b.height && //less than
           a.y + a.height > b.y; //greater than
}
