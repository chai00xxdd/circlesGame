
const g_state = {};
initAll();

function initAll() {
    initButtons();
    initGame();
    fix_responsive();
    window.addEventListener('resize', function (event) {
        fix_responsive();
        if (!g_state.game_loop) {
            fix_circles_positions();
        }
    });
}

function fix_responsive() {
    if (screen.height > 700) {
        g_state.board.style.minHeight = "500px";
    }
    else {
        g_state.board.style.minHeight = "70%";
    }
    g_state.control_panel.style.top = (g_state.board.offsetHeight + g_state.board.offsetTop + 10) + "px";
}

function random_speed(max_speed) {
    const direction = Math.random() > 0.5 ? 1 : - 1;
    return (parseInt(Math.random() * max_speed) + 1) * direction;

}

function initButtons() {
    const start_button = document.querySelector("#start_button");
    const pause_button = document.querySelector("#pause_button");
    const reset_button = document.querySelector("#reset_button");

    start_button.addEventListener("click", start_button_click);
    pause_button.addEventListener("click", pause_button_click);
    reset_button.addEventListener("click", reset_button_click);

    g_state.reset_button = reset_button;
    g_state.pause_button = pause_button;
    g_state.start_button = start_button;
}

function check_handle_board_collition() {
    let circles = g_state.circles;
    for (let circle of circles) {
        circle.move();
        if (is_border_collition(circle)) {
            circle.handle_board_collition();
        }
    }

}

function check_handle_balls_collition() {
    const circles = g_state.circles;
    const circles_collition = new Array(circles.length).fill(false);
    const circles_left = [];
    for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
            if (is_ball_collition(circles[i], circles[j])) {
                circles_collition[i] = true;
                make_ball_collition_sound();
            }
        }
    }

    for (let i = 0; i < circles.length; i++) {
        if (circles_collition[i]) {
            circles[i].remove();
        }
        else {
            circles_left.push(circles[i]);
        }
    }

    g_state.circles = circles_left;
}

function decrease_timer() {
    if (g_state.time_input.value.length == 0) { //timer is not set
        return;
    }
    g_state.time_passed += g_state.refresh_rate;
    if (g_state.time_passed >= 1000 && g_state.time_input.value.length != 0) {
        g_state.time_input.value--;
        g_state.time_passed = 0;
    }
}

function check_handle_game_over() {
    const time_value = g_state.time_input.value;
    const to_stop = g_state.circles.length == 1 || (time_value.length != 0 && time_value == 0);
    if (to_stop) {
        pause_button_click();
        g_state.start_button.disabled = true;
    }

    if (g_state.circles.length == 1) {
        g_state.game_message.innerHTML = "one ball left ===> stoping";
    }

    if ((time_value.length != 0 && time_value == 0)) {
        g_state.game_message.innerHTML = "time over ===> pausing";
    }
}

function animate_circles() {
    check_handle_board_collition();
    check_handle_balls_collition();
    decrease_timer();
    check_handle_game_over();
}

function start_button_click() {
    g_state.start_button.disabled = true;
    window.onbeforeunload = function (e) {
        return "are you sure you want to exit";
    };

    g_state.game_message.innerHTML = "";
    g_state.start_game();
}



function is_border_collition(circle) {
    return (circle.x + 50 > g_state.get_width())
        || (circle.x < 0)
        || (circle.y < 0)
        || (circle.y + 50 > g_state.get_height());
}

function is_ball_collition(circle1, circle2) {
    const size = g_state.ball_size - 5;
    return circle1.x <= circle2.x + size
        && circle1.x + size >= circle2.x
        && circle1.y <= circle2.y + size
        && circle1.y + size >= circle2.y;

}
function pause_button_click() {
    const time_value = g_state.time_input.value;
    const start_button_disable = (g_state.circles.length == 1 || (time_value.length != 0 && time_value == 0));
    g_state.start_button.disabled = start_button_disable;
    window.onbeforeunload = null;
    g_state.time_input.disabled = false;
    g_state.pause_game();
}

function reset_balls() {
    for (let circle in g_state.circle) {
        circle.remove();
    }
    const width = g_state.get_width();
    const height = g_state.get_height();
    const ball_size = g_state.ball_size;
    const top_ball = create_random_circle(Math.random() * (width - ball_size), 0);
    const down_ball = create_random_circle(Math.random() * (width - ball_size), height - ball_size);
    const left_ball = create_random_circle(0, Math.random() * (height - ball_size));
    const right_ball = create_random_circle(width - ball_size, Math.random() * (height - ball_size));
    g_state.board.innerHTML = "";
    g_state.circles = [];
    const circles = [top_ball, down_ball, left_ball, right_ball];
    for (const circle of circles) {
        g_state.add_circle(circle);

    }
}

function reset_button_click() {
    g_state.pause_game();
    g_state.time_passed = 0;
    g_state.start_button.disabled = false;
    if (g_state.time_tostop != null) {
        g_state.time_input.value = g_state.time_tostop;
    }
    g_state.game_message.innerHTML = "";
    g_state.time_input.disabled = false;

    reset_balls();
}
function initGame() {
    g_state.circles = [];
    g_state.time_tostop = null;
    g_state.time_passed = 0;
    g_state.board = document.querySelector("#GameBoard");
    g_state.control_panel = document.querySelector("#ControlPanel");
    g_state.game_message = document.querySelector("#game_message");
    g_state.time_input = document.querySelector("#time_input");
    g_state.time_input.addEventListener("input", time_input_value_change);
    g_state.refresh_rate = 20;
    g_state.game_loop = null;
    g_state.ball_size = 50;

    init_gstate_functions();
    reset_button_click();
}

function init_gstate_functions() {
    g_state.get_width = function () { return g_state.board.clientWidth; }
    g_state.get_height = function () { return g_state.board.clientHeight; }
    g_state.add_circle = function (circle) {
        g_state.circles.push(circle);
        g_state.board.append(circle);
    };
    g_state.pause_game = function () {
        clearInterval(g_state.game_loop);
        g_state.game_loop = null;
    }
    g_state.start_game = function () {
        g_state.time_input.disabled = true;
        if (g_state.game_loop == null) {
            g_state.game_loop = setInterval(animate_circles, g_state.refresh_rate);
        }
    }

}

function make_ball_collition_sound() {
    new Audio("music/ballCollition.mp3").play();
}

function create_random_circle(x, y) {
    const max_speed = 5;
    const x_speed = random_speed(max_speed * 3);
    const y_speed = random_speed(max_speed * 2);
    console.log("x speed = " + x_speed + " y speed = " + y_speed);
    return create_circle(x, y, x_speed, y_speed);
}

function time_input_value_change() {


    if (g_state.time_input.value.length == 0) {
        g_state.time_tostop = null;
        if (g_state.circles.length != 1) {
            g_state.start_button.disabled = false;
        }
        return;
    }
    const number = g_state.time_input.value;
    const numberAsInt = parseInt(number);
    console.log("number = " + number + ", numberAsInt = " + numberAsInt);
    if ((number != numberAsInt || number < 1)) {
        if (g_state.time_tostop) {
            time_input.value = g_state.time_tostop;
        }
        else {
            time_input.value = "";
        }
    }
    else { //valid_input
        g_state.time_tostop = time_input.value;
        if (g_state.circles.length != 1) {
            g_state.start_button.disabled = false;
        }
    }
}

function fix_circle_position(circle) {
    if (circle.x < 0) {
        circle.x = 0;
    }
    else if (circle.x + 50 > g_state.get_width()) {
        circle.x = g_state.get_width() - 50;
    }

    if (circle.y < 0) {
        circle.y = 0;
    }
    else if (circle.y + 50 > g_state.get_height()) {
        circle.y = g_state.get_height() - 50;
    }

    circle.style.top = circle.y + "px";
    circle.style.left = circle.x + "px";


}
function fix_circles_positions() {
    const circles = g_state.circles;
    for (let circle of circles) {
        fix_circle_position(circle);
    }
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
    new_circle.handle_board_collition = () => circle_board_collition(new_circle);
    return new_circle;
}


function circle_board_collition(new_circle) {
    const speed_y = new_circle.speed_y;
    const speed_x = new_circle.speed_x;

    if (new_circle.y < 0) {
        new_circle.speed_y = Math.abs(speed_y);
    }
    if (new_circle.y + 50 > g_state.get_height()) {
        new_circle.speed_y = Math.abs(speed_y) * -1;

    }

    if (new_circle.x < 0) {
        new_circle.speed_x = Math.abs(speed_x);

    }

    if (new_circle.x + 50 > g_state.get_width()) {
        new_circle.speed_x = Math.abs(speed_x) * -1;

    }

    fix_circle_position(new_circle);
}
