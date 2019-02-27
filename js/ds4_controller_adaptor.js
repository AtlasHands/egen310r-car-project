
class ds4_controller_adaptor{
    controller_tollerance = 0.05; //Define how much a float value should change before sending an event
    constructor(){
        let reference = this;
        window.addEventListener("gamepadconnected", function( event ) {
            console.log("Controller connected");
            requestAnimationFrame(function(){reference.getInput(reference)});
        });
    }
    getInput (reference){
        let gamepad = navigator.getGamepads();
        for(let key in gamepad[0].buttons){
            //Key 6 and 7 for ps4 is the leftstick x and y
            if(key == 6 || key == 7){
                var changedBy = Math.abs(reference.floats[reference.buttonConversion[key]] - gamepad[0].buttons[key].value);
                //If the the change from the original is greater than than the set tollerance
                if(changedBy > reference.controller_tollerance){
                    reference.floats[reference.buttonConversion[key]] = gamepad[0].buttons[key].value;
                    var gamepadAxesChange = new CustomEvent('gamepadAxesChange',{'detail':{'which':key,'value':gamepad[0].buttons[key].value}});
                    document.body.dispatchEvent(gamepadAxesChange);
                }
                continue;
            }
            if(gamepad[0].buttons[key].pressed == true){
                if(reference.keydown[reference.buttonConversion[key]] == false){
                    var gamepadButtonPressed = new CustomEvent('gamepadButtonPress',{'detail':{'which': key}});
                    reference.keydown[reference.buttonConversion[key]] = true;
                    document.body.dispatchEvent(gamepadButtonPressed);
                }
            }else{
                if(reference.keydown[reference.buttonConversion[key]] == true){
                    var gamepadButtonUp = new CustomEvent('gamepadButtonUp',{'detail':{"which":key}});
                    reference.keydown[reference.buttonConversion[key]] = false;
                    document.body.dispatchEvent(gamepadButtonUp);
                }
            }
        }
        for(let key in gamepad[0].axes){
            var changedBy = Math.abs(reference.floats[reference.axesConversion[key]] - gamepad[0].axes[key]);
            if(changedBy > reference.controller_tollerance){
                reference.floats[reference.axesConversion[key]] = gamepad[0].axes[key];
                var gamepadAxesChange = new CustomEvent('gamepadAxesChange',{'detail':{'which':key,'value':gamepad[0].axes[key]}});
                document.body.dispatchEvent(gamepadAxesChange);
            }
        }
        requestAnimationFrame(function(){reference.getInput(reference)});
    }
    floats = {
        righttrigger: 0.0,
        lefttrigger: 0.0,
        leftsticky: 0.0,
        leftstickx: 0.0,
        rightstickx: 0.0,
        rightsticky: 0.0,
    }
    buttonConversion = {
        0:"circle",
        1:"triangle",
        2:"x",
        3:"square",
        4:"leftbumper",
        5:"rightbumper",
        6:"rightstickx",
        7:"rightsticky",
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
    axesConversion = {
        0: 'leftstickx',
        1: 'leftsticky',
        2: 'lefttrigger',
        3: 'righttrigger',
        6: "rightstickx",
        7: "rightsticky",
    }
}

