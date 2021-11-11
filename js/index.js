
const g_state = {};
g_state.x = 5;
initButtons();
initGame();

function random(number) {
    return parseInt(Math.random() * number);
}
function initButtons() {
    const start_button = document.querySelector("#start_button");
    const pause_button = document.querySelector("#pause_button");
    const reset_button = document.querySelector("#reset_button");
    const add_circle_button = document.querySelector("#add_circle_button");
    start_button.addEventListener("click", start_button_click);
    pause_button.addEventListener("click", pause_button_click);
    reset_button.addEventListener("click", reset_button_click);
    add_circle_button.addEventListener("click", add_button_click);
    g_state.reset_button = reset_button;
    g_state.pause_button = pause_button;
    g_state.start_button = start_button;
}

function animate_circles() {

    let circles = g_state.circles;
    const circlesCollition = [];
    const newCricles = [];
    for (let circle of circles) {
        circlesCollition.push(false);
        circle.move();
        if (is_border_collition(circle)) {
            circle.handle_board_collition();
        }
    }

    for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
            if (is_ball_collition(circles[i], circles[j])) {
                circlesCollition[i] = true;
            }
        }
    }


    for (let i = 0; i < circles.length; i++) {
        if (circlesCollition[i]) {
            circles[i].remove();

        }
        else {
            newCricles.push(circles[i]);
        }
    }

    g_state.circles = newCricles;


}

function start_button_click() {
    window.onbeforeunload = function (e) {
        return "are you sure you want to exit";
    };
    console.log("start clicked");
    g_state.startGame();


}

function add_button_click() {

}

function is_border_collition(circle) {
    return (circle.x + 50 > g_state.get_width())
        || (circle.x < 0)
        || (circle.y < 0)
        || (circle.y + 50 > g_state.get_height());
}

function is_ball_collition(circle1, circle2) {
    const size = g_state.ball_size;
    return circle1.x <= circle2.x + size
        && circle1.x + size >= circle2.x
        && circle1.y <= circle2.y + size
        && circle1.y + size > circle2.y;

}
function pause_button_click() {
    window.onbeforeunload = null;
    console.log("pause clicked");
    g_state.pauseGame();
}


function reset_button_click() {


    for (let circle in g_state.circle) {
        circle.remove();
    }

    const width = g_state.get_width();
    const height = g_state.get_height();
    const ball_size = g_state.ball_size;
    const topBall = create_random_circle(Math.random() * (width - ball_size), 0);
    const downBall = create_random_circle(Math.random() * (width - ball_size), height - ball_size);
    const leftBall = create_random_circle(0, Math.random() * (height - ball_size));
    const rightBall = create_random_circle(width - ball_size, Math.random() * (height - ball_size));
    console.log("x = " + rightBall.x + "width = " + width);
    g_state.board.innerHTML = "";
    g_state.circles = [];
    const circles = [topBall, downBall, leftBall, rightBall];
    for (const circle of circles) {
        g_state.addCircle(circle);

    }




}
function initGame() {
    const screen_width = screen.width;
    //  console.log(screen_width);
    g_state.circles = [];
    g_state.board = document.querySelector("#GameBoard");
    g_state.board.style.width = parseInt((0.4 * screen_width)) + "px";
    console.log(g_state.board.style.width);
    g_state.delay = 1000;
    g_state.gameLoop = null;
    g_state.ball_size = 50;
    g_state.get_width = function () { return g_state.board.clientWidth; }
    g_state.get_height = function () { return g_state.board.clientHeight; }
    g_state.addCircle = function (circle) {
        g_state.circles.push(circle);
        g_state.board.append(circle);
    };
    g_state.pauseGame = function () {
        clearInterval(g_state.gameLoop);
        g_state.gameLoop = null;
    }
    g_state.startGame = function () {
        if (g_state.gameLoop == null) {
            g_state.gameLoop = setInterval(animate_circles, 20);
        }
    }
    let width = g_state.get_width();
    console.log(g_state.get_height());
    reset_button_click();



}

function create_random_circle(x, y) {
    const max_speed = 3;
    const x_speed = random(max_speed * 2) + 1;
    const y_speed = random(max_speed * 2) + 1;
    console.log("x speed = " + x_speed + " y speed = " + y_speed);
    return create_circle(x, y, x_speed, y_speed);
}
function create_circle(x, y, speed_x, speed_y) {
    const new_circle = document.createElement("div");
    new_circle.className = "circle";
    new_circle.x = x;
    new_circle.y = y;
    new_circle.speed_x = speed_x;
    new_circle.speed_y = speed_y;
    new_circle.style.left = x + "px";
    new_circle.style.top = y + "px";
    new_circle.move = function () {
        new_circle.x += new_circle.speed_x;
        new_circle.y += new_circle.speed_y;
        new_circle.style.top = new_circle.y + "px";
        new_circle.style.left = new_circle.x + "px";
    };
    new_circle.size = 50;



    new_circle.handle_board_collition = function () {
        if (new_circle.y < 0 || new_circle.y + 50 > g_state.get_height()) {
            new_circle.speed_y *= -1;
            new_circle.y %= g_state.get_height() + 1;
        }

        if (new_circle.x < 0 || new_circle.x + 50 > g_state.get_width()) {
            new_circle.speed_x *= -1;
            new_circle.x %= g_state.get_width() + 1;

        }


    };



    //new_circle.move();

    return new_circle;
}