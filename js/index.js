if(navigator.getGamepads() == undefined){
    console.log("Browser not supported");
}
var defaultIP = "127.0.0.1";
var ip;
var log = console.log
var page_manager = new PageManager(500,$("#pages"))
let controller = new ds4_controller_adapter();
if(window.localStorage.getItem("IP") != null){
    ip = window.localStorage.getItem("IP");
}else{
    ip = defaultIP;
}
//Setting up for dynamic ip selection
$("#car_ip").val(ip);
$("#car_ip").on("change",function(){
    ip = $(this).val();
    window.localStorage.setItem("IP",ip);
});
page_manager.addPageHandler(1,function(){
    let backarrow = $("#templates .back_arrow").clone();
    $(document.body).append(backarrow);
    backarrow.on('click',function(){
        page_manager.goToPage("main");
    });
},function(){
    $(".back_arrow").last().remove();
});
$(window).on("gamepadconnected",function(){
    $("#bluetooth_status").text("Connected")
    $("#bluetooth_status").removeClass("not_connected");
    $("#bluetooth_status").addClass("connected");
});
$(window).on("gamepaddisconnected",function(){
    $("#bluetooth_status").addClass("not_connected");
    $("#bluetooth_status").removeClass("connected");
    $("#bluetooth_status").text("Disconnected");
});
$("#settings_icon").on("click",function(){
    page_manager.goToPage("settings")
});
$(document.body).on('gamepadButtonPress',function(e){
    //controller.rumble({controller: e.detail.controller});
    console.log("Controller " + e.detail.controller + ": " +  controller.button_conversion[e.detail.which] + " pressed");
});
$(document.body).on('gamepadButtonUp',function(e){
    console.log("Controller " + e.detail.controller + ": " + controller.button_conversion[e.detail.which] + " up");
});
$(document.body).on('gamepadAxesChange',function(e){
    handleAxesChange(e.detail.gamepad);
});
function handleAxesChange(gamepad){
    let rightTrigger = gamepad.axes[2];
    let leftTrigger = gamepad.axes[3];
    let leftStickX = gamepad.axes[0];
    let offset = ((leftTrigger+1)/2  + -1*(rightTrigger+1)/2);//Get the total forward/backward
    if(leftStickX>0){//Moved right
        set_wheel_speed({
            left_wheel: Math.floor(offset*255),
            right_wheel: Math.floor(-1*leftStickX*offset*255)//Right wheel moves backward, left wheel forward
        });
    }else if(leftStickX<0){//Moved left
        set_wheel_speed({
            left_wheel: Math.floor(leftStickX*offset*255),//Left wheel moves backward, right wheel forward
            right_wheel: Math.floor(offset*255)
        });
    }else{
        set_wheel_speed({
            left_wheel: Math.floor(offset*255),//Left wheel moves backward, right wheel forward
            right_wheel: Math.floor(offset*255)
        });
    }
}
window.pm = page_manager;
$(document).keydown(function (e) {
    if(e.which == 83 || e.which == 40){
        //S pressed or Down arrow pressed
        handleClick($("#back"));
    }
    if(e.which == 68 || e.which == 39){
        //D press or Right arrow pressed
        handleClick($("#right"))
    }
    if(e.which == 87 || e.which == 38){
        //W pressed or up arrow pressed
        handleClick($("#forward"));
    }
    if(e.which == 65 || e.which == 37){
        //A press or left arrow pressed
        handleClick($("#left"));
    }
});

$(document).keyup(function (e) {
    if(e.which == 87 || e.which == 38){
        //W pressed or up arrow pressed
        removeClick($("#forward"));
    }if(e.which == 65 || e.which == 37){
        //A press or left arrow pressed
        removeClick($("#left"));
    }if(e.which ==  83 || e.which == 40){
        //S pressed or Down arrow pressed
        removeClick($("#back"));
    }if(e.which == 68 || e.which == 39){
        //D press or Right arrow pressed
        removeClick($("#right"))
    }
});
function handleClick(div){
    div.addClass("clicked");
}
function removeClick(div){
    div.removeClass("clicked");
}
function get_wheel_speed(){
    var path = "http://" + defaultIP + "/control/movement"
    var wheel_get_settings = {
        url: path,
        method: "GET",
    }
    return $.ajax(wheel_get_settings);
}
function set_wheel_speed(json){
    var path = "http://" + ip + "/control/movement"
    var wheel_set_settings = {
        url: path,
        method: "POST",
        data: JSON.stringify(json)
    }
    var wheel_set_request = $.ajax(wheel_set_settings);
    wheel_set_request.always(function(data,status,xhr){
        if(xhr.status === 200){
            console.log("Request was sent successfully");
        }else if(xhr.status ===  400){
            console.log("Syntax was unrecognized for command");
        }else if(xhr.status === 500){
            console.log("Server having issues")
        }
    });
}
function get_accessory(){
    var path = "http://" + ip + "/control/accessory";
    var accessory_get_settings = {
        url: path,
        method: "GET",
    }
    return $.ajax(accessory_get_settings);
}
function set_accessory(json){
    var path = "http://" + ip + "/control/accessory"
    var accessory_set_settings = {
        url: path,
        method: "POST",
        data: JSON.stringify(json),
    }
    var accessory_set_request = $.ajax(accessory_set_settings);
    accessory_set_request.always(function(data,status,xhr){
        if(xhr.status === 200){
            console.log("Request was sent successfully");
        }else if(xhr.status ===  400){
            console.log("Syntax was unrecognized for command");
        }else if(xhr.status === 500){
            console.log("Server having issues")
        }
    });
}
function setCookie(cname, cvalue) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
        c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
        }
    }
    return "";
}