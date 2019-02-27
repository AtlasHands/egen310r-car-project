var log = console.log
var page_manager = new PageManager(500,$("#pages"))
let controller = new ds4_controller_adaptor();
$(document.body).on('gamepadButtonPress',function(e){
    console.log(controller.buttonConversion[e.detail.which] + " pressed");
});
$(document.body).on('gamepadButtonUp',function(e){
    console.log(controller.buttonConversion[e.detail.which] + " up");
});
$(document.body).on('gamepadAxesChange',function(e){
    console.log(controller.axesConversion[e.detail.which] + " changed by " + e.detail.value);
});
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