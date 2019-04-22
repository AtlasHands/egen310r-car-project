/**
 * Open Source MIT License
 *
 * Provides functionality to the front end interface as well as
 * being the final stop for the controller handling for sending messages
 * to the microcontroller over http
 *
 * @summary manages user interface, sends messages to microcontroller
 * @author Keefer Sands <me@keefersands.com>
 *
 * Created at     : 2019-04-21
 * 
 */

//Notify when a browser doesn't support the gamepadAPI
if (navigator.getGamepads() == undefined) {
	console.log("Browser not supported");
}

var connection_status = $("#test_connection_status");
var battery_percentage = $("#battery_percentage_value");
var battery_max = 8.2;
var battery_min = 6;
let controller = new ds4_controller_adapter();


//========================User Interface and Page Setup=========================
//Default IP is just localhost
var defaultIP = "127.0.0.1";
var ip;
//If localstorage has the IP, use it
if (window.localStorage.getItem("IP") != null) {
	ip = window.localStorage.getItem("IP");
} else {
	//If it doesn't, set it to the default
	ip = defaultIP;
}
//Set initial value of the ip in the settings page
$("#car_ip").val(ip);
$("#car_ip").on("change", function () { //When it changed
	ip = $(this).val();
	window.localStorage.setItem("IP", ip); //Set it in localstorage
});

//Get Initial status of the car
get_status()
//Grab the status of the car on an interval
setInterval(get_status, 5000);
function get_status() {
	var getStatusRequest = {
		timeout: 3000, //Should respond within 3s, helps to not pool requests
		method: "GET",
		url: "http://" + ip + "/status"
	}
	$.ajax(getStatusRequest).always(function (data, status, xhr) {
		if (xhr.status == 200) {
			//Handle the display to show connection
			if (connection_status.text() != "Connected") {
				connection_status.text("Connected");
				connection_status.removeClass("not_connected");
				connection_status.addClass("connected");
			}
			battery_percentage.removeClass("not_connected");
			//Get percent based on the minimum and maximum voltages
			var percentage;
			if (data.voltage > battery_max) {
				//if its greater than our max, say its 100
				percentage = 100;
			} else if (data.voltage <= battery_min) {
				//if its lower than our min, say its 0
				percentage = 0;
			} else {
				//Since our range is 100% over 2.2V we can get a ballpark 
				//estimateO f how much percent we have through multiplying how 
				//much voltage Is lost minus the max multiplied by the amount of
				//battery 1v equates to, minusing that from 100 gives us %
				percentage = parseInt(100 - ((battery_max - data.voltage) 
								* 45.45));
			}
			//Set the text of the battery percentage field
			battery_percentage.text(percentage + "%");
		} else if (status == "error" || status == "timeout") {
			//Setting the text if there is an error/timout to disconnected
			if (connection_status.text() != "Disconnected") {
				connection_status.text("Not Connected");
				connection_status.addClass("not_connected");
				connection_status.removeClass("connected");
			}
			if (battery_percentage.text() != "Disconnected") {
				battery_percentage.text("Disconnected");
				battery_percentage.addClass("not_connected");
			}
		}
	});
}
//Set the slider input to 0 just in case
$("#slider_input").val(0);
//Handle the color change when moving the power button
//It works through having two sliders set to the same value
//One changing triggers the other to change and also change
//The top slider then changes its opacity to give the effect
//of a smooth gradient of change based on what value you are at
$("#slider_input").on("change", function () {
	$("#slider_power").text($(this).val());
	$("#slider_inbetween").val($(this).val());
	$(this).css("opacity", 1 - $(this).val() / 100);
});
//Initialize the page manager
var page_manager = new PageManager(500, $("#pages"));
//When the settings icon is clicked, goes to the settings page
$("#settings_icon").on("click", function () {
	page_manager.goToPage("settings")
});
//When we enter page 1 (Main page)
page_manager.addPageHandler(1, function () {
	//grab the back arrow clone
	let backarrow = $("#templates .back_arrow").clone();
	//Append it to the body (absolute)
	$(document.body).append(backarrow);
	//On click, go back to the main page
	backarrow.on('click', function () {
		page_manager.goToPage("main");
	});
}, function () { //On exit, remove the back arrow
	$(".back_arrow").last().remove();
});
//====================End of: User Interface and Page Setup=====================

//==============================Keyboard Handling===============================
//Handle keys that are down, just in case there was a mess up with a keyup event
let keysDown = {}
//When a key is pressed
$(document.body).on('keydown', function (e) {
	var power = parseInt($("#slider_input").val()) * .01;
	if (keysDown[e.which]) {
		return;
	}
	//Add key that is pressed to our keys that are down
	keysDown[e.which] = "true";
	//w is pressed
	if (e.which == 87) {
		//Show on the user interface that its pressed
		$("#w_key").addClass("pressed");
		//Set wheel speed to forward * power, which is defined by the slider in
		//the User interface
		set_wheel_speed({
			left_wheel: Math.floor(power * 90),
			right_wheel: Math.floor(power * 90)
		});
		//a is pressed
	} else if (e.which == 65) {
		$("#a_key").addClass("pressed");
		//Turn left
		set_wheel_speed({
			left_wheel: Math.floor(-1 * power * 90),
			right_wheel: Math.floor(1 * power * 90)
		});
		//s is pressed
	} else if (e.which == 83) {
		$("#s_key").addClass("pressed");
		//go backward
		set_wheel_speed({
			left_wheel: Math.floor(-1 * power * 90),
			right_wheel: Math.floor(-1 * power * 90)
		});
		//d is pressed
	} else if (e.which == 68) {
		$("#d_key").addClass("pressed");
		//Turn right
		set_wheel_speed({
			left_wheel: Math.floor(power * 90),
			right_wheel: Math.floor(-1 * power * 90)
		});
		//up arrow is pressed
	} else if (e.which == 38) {
		var slider = $("#slider_input");
		//Increment the power by 10
		slider.val(parseInt(slider.val()) + 10);
		slider.trigger("change");
		//down arrow is pressed
	} else if (e.which == 40) {
		var slider = $("#slider_input")
		//Decrement the power by 10
		slider.val(parseInt(slider.val()) - 10);
		slider.trigger("change");
	}
});
//Handle keys going up, checks against our current keys that are down
$(document.body).on('keyup', function (e) {
	//Keys are designed to be pressed one at a time, so if any of the
	//Keys are brought up in an event, we remove that they are pressed
	//And set speed to 0
	if (keysDown[e.which]) {
		delete keysDown[e.which];
		if (e.which == 87) { //w pressed
			$("#w_key").removeClass("pressed");
			set_wheel_speed({
				left_wheel: 0,
				right_wheel: 0
			});
		} else if (e.which == 65) {
			$("#a_key").removeClass("pressed");
			set_wheel_speed({
				left_wheel: 0,
				right_wheel: 0
			});
		} else if (e.which == 83) {
			$("#s_key").removeClass("pressed");
			set_wheel_speed({
				left_wheel: 0,
				right_wheel: 0
			});
		} else if (e.which == 68) {
			$("#d_key").removeClass("pressed");
			set_wheel_speed({
				left_wheel: 0,
				right_wheel: 0
			});
		}
	}
});
//==========================End of: Keyboard Handling===========================

//===============================Gamepad Handling===============================
//If the gamepad is connected, change the user interface to indicate it
$(window).on("gamepadconnected", function () {
	$("#bluetooth_status").text("Connected")
	$("#bluetooth_status").removeClass("not_connected");
	$("#bluetooth_status").addClass("connected");
});
//If the gamepad is disconnected, change the user interface to indicate it
$(window).on("gamepaddisconnected", function () {
	$("#bluetooth_status").addClass("not_connected");
	$("#bluetooth_status").removeClass("connected");
	$("#bluetooth_status").text("Disconnected");
});
//When a gamepad button is pressed
$(document.body).on('gamepadButtonPress', function (e) {
	//If the gamepad button is the left dpad
	if (controller.button_conversion[e.detail.which] == "dpadleft") {
		//Turn left
		set_wheel_speed({
			left_wheel: -90,
			right_wheel: 90
		});
		//If the gamepad button is the right dpad
	} else if (controller.button_conversion[e.detail.which] == "dpadright") {
		//Turn right
		set_wheel_speed({
			left_wheel: 90,
			right_wheel: -90
		});
	}
});
//When a gamepad button comes up
$(document.body).on('gamepadButtonUp', function (e) {
	if (controller.button_conversion[e.detail.which] == "dpadleft") {
		//
		set_wheel_speed({
			left_wheel: 0,
			right_wheel: 0
		});
	} else if (controller.button_conversion[e.detail.which] == "dpadright") {
		set_wheel_speed({
			left_wheel: 0,
			right_wheel: 0
		});
	}
});
$(document.body).on('gamepadAxesChange', function (e) {
	handleAxesChange(e.detail.gamepad);
});

function handleAxesChange(gamepad) {
	let rightTrigger = gamepad.axes[2];
	let leftTrigger = gamepad.axes[3];
	let leftStickX = gamepad.axes[0];
	//Get the total forward/backward
	let offset = ((leftTrigger + 1) / 2 + -1 * (rightTrigger + 1) / 2); 
	if (leftStickX > 0) { //Moved right
		//Right wheel moves backward, left wheel forward
		set_wheel_speed({
			left_wheel: Math.floor(offset * 90),
			right_wheel: Math.floor(-1 * leftStickX * offset * 90) 
		});
	
	} else if (leftStickX < 0) { 
		//left wheel moves backward, right wheel forward
		set_wheel_speed({
			left_wheel: Math.floor(leftStickX * offset * 90),
			right_wheel: Math.floor(offset * 90)
		});
	} else {
		set_wheel_speed({
			left_wheel: Math.floor(offset * 90),
			right_wheel: Math.floor(offset * 90)
		});
	}
}
//===========================End of: Gamepad Handling===========================

//Helper function to set the wheel speed given json
function set_wheel_speed(json) {
	var path = "http://" + ip + "/control/movement"
	var wheel_set_settings = {
		url: path,
		method: "POST",
		data: JSON.stringify(json)
	}
	var wheel_set_request = $.ajax(wheel_set_settings);
	wheel_set_request.always(function (data, status, xhr) {
		if (xhr.status === 200) {
			console.log("Request was sent successfully");
		} else if (xhr.status === 400) {
			console.log("Syntax was unrecognized for command");
		} else if (xhr.status === 500) {
			console.log("Server having issues")
		}
	});
}