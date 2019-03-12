class ds4_controller_adapter{
    controller_tolerance = 0.05; //Define how much a float value should change before sending an event
    constructor(options = {}){
        let reference = this;
        if(options.controller_tolerance){
            this.controller_tolerance = options.controller_tolerance;
        }
        if(options.button_conversion){
            this.button_conversion = options.button_conversion;
        }
        if(options.axes_conversion){
            this.axes_conversion = options.axes_conversion
        }
        requestAnimationFrame(function(){reference.getInput(reference)});
    }
    //Reference to the class has to be passed or we cannot access class references, since when it is called in request
    //AnimationFrame this reference to that caller.
    getInput (reference){
        //get all gamepads
        let gamepad = navigator.getGamepads();
        //iterate through them
        for(let x =0;x<gamepad.length;x++){
            //if its null then skip
            if(gamepad[x] == null || gamepad[x] == undefined){
                continue;
            }
            //If its not ps4 skip
            let vender = gamepad[x].id.substring(gamepad[x].id.length-5,gamepad[x].id.length-1);
            if(vender != '05c4'){ 
                continue;
            }
            //Checking for button changes
            for(let key in gamepad[x].buttons){
                //Key 6 and 7 for ps4 is the leftstick x and y
                if(key == 6 || key == 7){
                    var changedBy = Math.abs(reference.floats[key][x] - gamepad[x].buttons[key].value);
                    //If the the change from the original is greater than than the set tolerance
                    if(changedBy > reference.controller_tolerance){
                        //Trigger a gamepadAxesChange event
                        var gamepadAxesChange = new CustomEvent('gamepadAxesChange',{'detail':{'controller':x,'which':key,'value':gamepad[x].buttons[key].value,'gamepad':gamepad[x]}});
                        //Set our local values to the gamepad api value
                        reference.floats[key][x] = gamepad[x].buttons[key].value;
                        document.body.dispatchEvent(gamepadAxesChange);
                    }
                    continue;
                }
                //If the gamepad api key is pressed, and the local state is not
                if(gamepad[x].buttons[key].pressed == true){
                    if(reference.keydown[key][x] == false){
                        //Trigger a gamepadButtonPress event
                        var gamepadButtonPressed = new CustomEvent('gamepadButtonPress',{'detail':{'controller':x,'which': key,'gamepad':gamepad[x]}});
                        //Set the local value for the key to that of the gamepad API
                        reference.keydown[key][x] = true;
                        document.body.dispatchEvent(gamepadButtonPressed);
                        continue;
                    }
                //If the gamepad api is not pressed, and the local state is
                }else{
                    if(reference.keydown[key][x] == true){
                        //Trigger a gamepadButtonUp event
                        var gamepadButtonUp = new CustomEvent('gamepadButtonUp',{'detail':{'controller':x,'which': key,'gamepad':gamepad[x]}});
                        //Set the local value for the key to that of the gamepad API
                        reference.keydown[key][x] = false;
                        document.body.dispatchEvent(gamepadButtonUp);
                        continue;
                    }
                }
                
            }
            //TODO: add handling for when the axes is at an extreme (resting/full down) so when it is not a 0.05 difference it can still get to resting
            for(let key in gamepad[x].axes){
                var changedBy = Math.abs(reference.floats[key][x] - gamepad[x].axes[key]);
                //If the change from the local is greater than the set tolerance
                if(changedBy > reference.controller_tolerance){
                    //Trigger a gamepadAxesChange event
                    var gamepadAxesChange = new CustomEvent('gamepadAxesChange',{'detail':{'controller':x,'which':key,'value':gamepad[x].axes[key],'gamepad':gamepad[x]}});
                    //Set the local values to the gamepad api value
                    reference.floats[key][x] = gamepad[x].axes[key];
                    document.body.dispatchEvent(gamepadAxesChange);
                }
            }
        }
        //This was what was recommended to get changes within gamepad api, it recursively checks for changes via polling
        requestAnimationFrame(function(){reference.getInput(reference)});
    }
    //rumble sent controller in options, configurable with strong: value, weak: value, and duration: value.  If not supplied they default to 1.0,1.0, and 1000
    rumble(options = {}){ 
        let strong = function(){
            if(options.strong){
                return options.strong;
            }else{
                return 1.0;
            }
        };
        let weak = function(){
            if(options.weak){
                return options.weak;
            }else{
                return 1.0;
            }
        };
        let duration = function(){
            if(options.weak){
                return options.duration;
            }else{
                return 1000;
            }
        };
        if(options.controller !== undefined){
            let gamepad = navigator.getGamepads();
            gamepad[options.controller].vibrationActuator.playEffect("dual-rumble", {
                duration: duration(),
                strongMagnitude: strong(),
                weakMagnitude: weak()
            });
        }else{
            console.warn("A Controller was not inputted, for rumble please pass {controller: yourControllerNumber}");
        }
    };
    //Float tracking with variable buttons/sticks, 0,1,2,3 keys are for controller tracking.
    floats = {
        0: {
            0:0.0,
            1:0.0,
            2:0.0,
            3:0.0,
        },
        1: {
            0:0.0,
            1:0.0,
            2:0.0,
            3:0.0,
        },
        2: {
            0:-1,
            1:-1,
            2:-1,
            3:-1,
        },
        3: {
            0:-1,
            1:-1,
            2:-1,
            3:-1,
        },
        6: {
            0:0.0,
            1:0.0,
            2:0.0,
            3:0.0,
        },
        7: {
            0:0.0,
            1:0.0,
            2:-0.0,
            3:0.0
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
        1:{
            0: false,
            1: false,
            2: false,
            3: false,
        },
        2:{
            0: false,
            1: false,
            2: false,
            3: false,
        },
        3:{
            0: false,
            1: false,
            2: false,
            3: false,
        },
        4:{
            0: false,
            1: false,
            2: false,
            3: false,
        },
        5:{
            0: false,
            1: false,
            2: false,
            3: false,
        },
        6:{
            0: false,
            1: false,
            2: false,
            3: false,
        },
        7:{
            0: false,
            1: false,
            2: false,
            3: false,
        },
        8:{
            0: false,
            1: false,
            2: false,
            3: false,
        },
        9:{
            0: false,
            1: false,
            2: false,
            3: false,
        },
        10:{
            0: false,
            1: false,
            2: false,
            3: false,
        },
        11:{
            0: false,
            1: false,
            2: false,
            3: false,
        },
        12:{
            0: false,
            1: false,
            2: false,
            3: false,
        },
        13:{
            0: false,
            1: false,
            2: false,
            3: false,
        },
        14:{
            0: false,
            1: false,
            2: false,
            3: false,
        },
        15:{
            0: false,
            1: false,
            2: false,
            3: false,
        },
        16:{
            0: false,
            1: false,
            2: false,
            3: false,
        },
        17:{
            0: false,
            1: false,
            2: false,
            3: false,
        }
    }
    //Quick conversion for what button relates to what number
    button_conversion = {
        0:"circle",
        1:"triangle",
        2:"x",
        3:"square",
        4:"leftbumper",
        5:"rightbumper",
        8:"share",
        9:"options",
        10:"psbutton",
        11:"leftstickclick",
        12:"dpadup",
        13:"dpaddown",
        14:"dpadleft",
        15:"dpadright",
        16:"rightstickclick",    
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

