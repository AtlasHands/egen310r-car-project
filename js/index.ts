import * as $ from '../dependencies/jquery.js';
import {PageManager} from '../dependencies/kPage/main'
var log = console.log
var page_manager = new PageManager(300,$("#pages"))
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