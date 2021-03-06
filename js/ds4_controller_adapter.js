/**
 * Open Source MIT License
 *
 * Using request animation frame this file polls the gamepad api via the 
 * navigator.getGamepads() method.  After polling it turns the poll into an
 * event - based on what type of change happened. Rumbling the controller is
 * also available with this library. It also provides some helper variables
 * to allow for quick conversion of the location of the code to what it would
 * be on a PS4 controller.
 *   
 * @summary polls gamepad api, turns into events
 * @author Keefer Sands <me@keefersands.com>
 *
 * Created at     : 2019-04-21
 * 
 */
class ds4_controller_adapter {
	//Define how much a float value should change before sending an event
	controller_tolerance = 0.2;
	constructor(options = {}) {
		let reference = this;
		if (options.controller_tolerance) {
			this.controller_tolerance = options.controller_tolerance;
		}
		if (options.button_conversion) {
			this.button_conversion = options.button_conversion;
		}
		if (options.axes_conversion) {
			this.axes_conversion = options.axes_conversion
		}
		requestAnimationFrame(function () {
			reference.getInput(reference)
		});
	}
	//Reference to the class has to be passed or we cannot access class
	//references, since when it is called in requestAnimationFrame this 
	//is in reference to that caller.
	getInput(reference) {
		//get all gamepads
		let gamepad = navigator.getGamepads();
		//iterate through them
		for (let x = 0; x < gamepad.length; x++) {
			//if its null then skip
			if (gamepad[x] == null || gamepad[x] == undefined) {
				continue;
			} else {
				//I found that sometimes the gamepadconnected event was kind of buggy, a fire was forced here to
				//ensure the user interface would recognize a controller is connected 
				var controller_found = new Event('gamepadconnected');
				window.dispatchEvent(controller_found);
			}
			//If its not ps4 skip
			let vender = gamepad[x].id.substring(gamepad[x].id.length - 5, gamepad[x].id.length - 1);
			if (vender != '05c4') {
				continue;
			}
			//Checking for button changes
			for (let key in gamepad[x].buttons) {
				var sendAxesEvent = false;
				//Key 6 and 7 for ps4 is the leftstick x and y
				if (key == 6 || key == 7) {
					var changedBy = Math.abs(reference.floats[key][x] - gamepad[x].buttons[key].value);
					//Long logic to decide whether or not to do an update (if its at an extreme)
					if ((gamepad[x].buttons[key].value == -1 && reference.floats[key][x] != -1) ||
						(gamepad[x].buttons[key].value == 0 && reference.floats[key][x] != 0) ||
						(gamepad[x].buttons[key].value == 1 && reference.floats[key][x] != 1)) {
						sendAxesEvent = true
					}
					//If the the change from the original is greater than than the set tolerance
					if (changedBy > reference.controller_tolerance) {
						sendAxesEvent = true;
					}
					//If the gamepad api key is pressed, and the local state is not
				} else if (gamepad[x].buttons[key].pressed == true) {
					if (reference.keydown[key][x] == false) {
						//Trigger a gamepadButtonPress event
						var gamepadButtonPressed = new CustomEvent('gamepadButtonPress', {
							'detail': {
								'controller': x,
								'which': key,
								'gamepad': gamepad[x]
							}
						});
						//Set the local value for the key to that of the gamepad API
						reference.keydown[key][x] = true;
						document.body.dispatchEvent(gamepadButtonPressed);
						continue;
					}
				} else { //If the gamepad api is not pressed, and the local state is
					if (reference.keydown[key][x] == true) {
						//Trigger a gamepadButtonUp event
						var gamepadButtonUp = new CustomEvent('gamepadButtonUp', {
							'detail': {
								'controller': x,
								'which': key,
								'gamepad': gamepad[x]
							}
						});
						//Set the local value for the key to that of the gamepad API
						reference.keydown[key][x] = false;
						document.body.dispatchEvent(gamepadButtonUp);
						continue;
					}
				}
				if (sendAxesEvent) {
					//Trigger a gamepadAxesChange event
					var gamepadAxesChange = new CustomEvent('gamepadAxesChange', {
						'detail': {
							'controller': x,
							'which': key,
							'value': gamepad[x].buttons[key].value,
							'gamepad': gamepad[x]
						}
					});
					//Set our local values to the gamerovides functionality to the front end interface as well as
					reference.floats[key][x] = gamepad[x].buttons[key].value;
					document.body.dispatchEvent(gamepadAxesChange);
				}
			}
			for (let key in gamepad[x].axes) {
				var sendEvent = false;
				var changedBy = Math.abs(reference.floats[key][x] - gamepad[x].axes[key]);
				//Long logic to decide whether or not to do an update (if its at an extreme)
				if ((gamepad[x].axes[key] == -1 && reference.floats[key][x] != -1) ||
					(gamepad[x].axes[key] == 0 && reference.floats[key][x] != 0) ||
					(gamepad[x].axes[key] == 1 && reference.floats[key][x] != 1)) {
					sendEvent = true
				}
				//If the change from the local is greater than the set tolerance
				else if (changedBy > reference.controller_tolerance) {
					sendEvent = true;
				}
				if (sendEvent) {
					var gamepadAxesChange = new CustomEvent('gamepadAxesChange', {
						'detail': {
							'controller': x,
							'which': key,
							'value': gamepad[x].axes[key],
							'gamepad': gamepad[x]
						}
					});
					//Set the local values to the gamepad api value
					reference.floats[key][x] = gamepad[x].axes[key];
					document.body.dispatchEvent(gamepadAxesChange);
				}
			}
		}
		//This was what was recommended to get changes within gamepad api, it recursively checks for changes via polling
		requestAnimationFrame(function () {
			reference.getInput(reference)
		});
	}
	//rumble sent controller in options, configurable with strong: value, weak: value, and duration: value.  
	//If not supplied they default to 1.0,1.0, and 1000
	rumble(options = {}) {
		let strong = function () {
			if (options.strong) {
				return options.strong;
			} else {
				return 1.0;
			}
		};
		let weak = function () {
			if (options.weak) {
				return options.weak;
			} else {
				return 1.0;
			}
		};
		let duration = function () {
			if (options.weak) {
				return options.duration;
			} else {
				return 1000;
			}
		};
		if (options.controller !== undefined) {
			let gamepad = navigator.getGamepads();
			gamepad[options.controller].vibrationActuator.playEffect("dual-rumble", {
				duration: duration(),
				strongMagnitude: strong(),
				weakMagnitude: weak()
			});
		} else {
			console.warn("A Controller was not inputted, for rumble please pass {controller: yourControllerNumber}");
		}
	};
	//Float tracking with variable buttons/sticks, 0,1,2,3 keys are for controller tracking.
	floats = {
		0: {
			0: 0.0,
			1: 0.0,
			2: 0.0,
			3: 0.0,
		},
		1: {
			0: 0.0,
			1: 0.0,
			2: 0.0,
			3: 0.0,
		},
		2: {
			0: -1,
			1: -1,
			2: -1,
			3: -1,
		},
		3: {
			0: -1,
			1: -1,
			2: -1,
			3: -1,
		},
		6: {
			0: 0.0,
			1: 0.0,
			2: 0.0,
			3: 0.0,
		},
		7: {
			0: 0.0,
			1: 0.0,
			2: -0.0,
			3: 0.0
		},
	}
	//Keydown tracking for buttons 0,1,2,3 keys are for controller tracking.
	keydown = {
		0: {
			0: false,
			1: false,
			2: false,
			3: false,
		},
		1: {
			0: false,
			1: false,
			2: false,
			3: false,
		},
		2: {
			0: false,
			1: false,
			2: false,
			3: false,
		},
		3: {
			0: false,
			1: false,
			2: false,
			3: false,
		},
		4: {
			0: false,
			1: false,
			2: false,
			3: false,
		},
		5: {
			0: false,
			1: false,
			2: false,
			3: false,
		},
		6: {
			0: false,
			1: false,
			2: false,
			3: false,
		},
		7: {
			0: false,
			1: false,
			2: false,
			3: false,
		},
		8: {
			0: false,
			1: false,
			2: false,
			3: false,
		},
		9: {
			0: false,
			1: false,
			2: false,
			3: false,
		},
		10: {
			0: false,
			1: false,
			2: false,
			3: false,
		},
		11: {
			0: false,
			1: false,
			2: false,
			3: false,
		},
		12: {
			0: false,
			1: false,
			2: false,
			3: false,
		},
		13: {
			0: false,
			1: false,
			2: false,
			3: false,
		},
		14: {
			0: false,
			1: false,
			2: false,
			3: false,
		},
		15: {
			0: false,
			1: false,
			2: false,
			3: false,
		},
		16: {
			0: false,
			1: false,
			2: false,
			3: false,
		},
		17: {
			0: false,
			1: false,
			2: false,
			3: false,
		}
	}
	//Quick conversion for what button relates to what number
	button_conversion = {
		0: "circle",
		1: "triangle",
		2: "x",
		3: "square",
		4: "leftbumper",
		5: "rightbumper",
		8: "share",
		9: "options",
		10: "psbutton",
		11: "leftstickclick",
		12: "dpadup",
		13: "dpaddown",
		14: "dpadleft",
		15: "dpadright",
		16: "rightstickclick",
	}
	//Quick conversion between what axes/float value relates to what number
	axes_conversion = {
		0: 'leftstickx',
		1: 'leftsticky',
		2: 'lefttrigger',
		3: 'righttrigger',
		6: "rightstickx",
		7: "rightsticky",
	}
}