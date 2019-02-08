import * as $ from '../dependencies/jquery.js';
import {PageManager} from '../dependencies/kPage/main'
var log = console.log
var page_manager = new PageManager(300,$("#pages"))
window.pm = page_manager;
$(document).on('keydown',function(event){
    if(event.which == 87 || event.which == 38){
        //W pressed or up arrow pressed
        handleClick($("#forward"));
    }else if(event.which == 65 || event.which == 37){
        //A press or left arrow pressed
        handleClick($("#left"));
    }else if(event.which ==  83 || event.which == 40){
        //S pressed or Down arrow pressed
        handleClick($("#back"));
    }else if(event.which == 68 || event.which == 39){
        //D press or Right arrow pressed
        handleClick($("#right"))
    }
});
makeClickHandler($("#left"))
makeClickHandler($("#forward"));
makeClickHandler($("#back"));
makeClickHandler($("#right"));
function makeClickHandler(div){
    div.on('click',function(){
        handleClick(div)
    });
}
function handleClick(div){
    div.addClass("clicked");
        setTimeout(function(){
            div.removeClass("clicked");
        },200)
}
console.log("Here we are")
$(window).on("gamepadconnected", function() {
    $("#gamepadPrompt").html("Gamepad connected!");
    console.log("connection event");
});
$("#connect_to_bluetooth").on("click",function(){
    onButtonClick();
    //page_manager.nextPage();
});
$("#test_connection").on('click',function(){
    page_manager.nextPage();
});
function onButtonClick() {
    let options = {
        acceptAllDevices: true
    };
    navigator.bluetooth.requestDevice(options).then(device => {
        log('> Name:             ' + device.name);
        log('> Id:               ' + device.id);
        log('> Connected:        ' + device.gatt.connected);
      })
      .catch(error => {
        log('Argh! ' + error);
      });
}