

/*
    The original source was created:
        13 July 2010 by dlf (Metodo2 srl)
        -> Modified 31 May 2012 by Tom Igoe

    4 March 2019
        -> added REST functionality
            -> Path resolution
            -> Method resolution
            -> JSON Body resolution
        -> WINC1500 Support
            -> Changed pins to work with WINC1500
        -> Motor Support
            -> Motor support for PWMing and switching direction
                of brushed motors
	-> Battery Voltage reading from A0

 */
#include <SPI.h>
#include <WiFi101.h>
#include <String.h>
#include <ArduinoJson.h>
#include <Servo.h>

Servo front_drive_right;  // create servo object to control a servo
Servo front_drive_left;
Servo ghost_fix;

#include "arduino_secrets.h" 
///////please enter your sensitive data in the Secret tab/arduino_secrets.h
char ssid[] = SECRET_SSID;        // your network SSID (name)
char pass[] = SECRET_PASS;    // your network password (use for WPA, or use as key for WEP)
int keyIndex = 0;                 // your network key Index number (needed only for WEP)
int status = WL_IDLE_STATUS;
WiFiServer server(80);
void setup() {
  //---------Default setup-------------
    Serial.begin(9600);
    WiFi.setPins(8,7,4,2);
    front_drive_right.attach(11);  // create servo object to control a servo
    front_drive_left.attach(5);
    ghost_fix.attach(9);
    delay(1000);
    ghost_fix.write(90);
    //---------WiFi Setup-------------
    Serial.print("Creating access point named: ");
    Serial.println(ssid);
    status = WiFi.beginAP(ssid,pass);
    if (status != WL_AP_LISTENING) {
        Serial.println("Creating access point failed");
        // don't continue
        while (true);
    }
    // wait 10 seconds for connection:
    delay(10000);
    // start the web server on port 80
    server.begin();
    // you're connected now, so print out the status
    printWiFiStatus();
}

void loop() {
    WiFiClient client = server.available(); //Listening
    if (client) { //New request                          
        String* header = getHeader(client); //Get Header of request
        if(header[0].length() == 0){//Ensure it isn't blank
            return;
        }
        //Get path and method from the first line of the header
        String* pathAndMethod = getPathAndMethod(header[0]); 
        String method = pathAndMethod[0];//Assign accordingly
        String path = pathAndMethod[1];
        //Logic for determining action
        if(path == "/status"){
            if(method == "GET"){
                client.println("HTTP/1.1 200 OK");
                client.println("Content-Type: application/json\n");
                float voltage = analogRead(A1) * (3.3 / 1023.0) * 3.39;
                client.print("{\"voltage\": ");
                client.print(voltage);
                client.println("}");
            }else{
                response400(client);
            }
        }else if(path == "/control/movement"){
            String requestBody;
            //Get body
            while (client.available()) {
                requestBody += (char)client.read();
            }
            if (requestBody.length()) {
                DynamicJsonDocument root = requestToJSON(requestBody);
                determineMove(root);
            }
            response200(client);
        }else{
            response404(client);
        }
        client.stop();
        Serial.println("client disonnected");
    }
}
void printWiFiStatus() {
    IPAddress ip = WiFi.localIP();
    Serial.print("IP Address: ");
    Serial.println(ip);
}
DynamicJsonDocument requestToJSON(String requestBody){
  DynamicJsonDocument doc(1024);
  deserializeJson(doc, requestBody);
  return doc;
}
void determineMove(DynamicJsonDocument root){
     int left_wheel = root["left_wheel"];
     int right_wheel = root["right_wheel"];
     front_drive_left.write(90-right_wheel);
     front_drive_right.write(90+left_wheel);

}
String* getHeader(WiFiClient client){
	int lineCount = 0;
	String header[128];
	String currentLine;                // make a String to hold incoming data from the client
	while (client.connected()) {            // loop while the client's connected
    if (client.available()) {             // if there's bytes to read from the client,
        char c = client.read();             // read a byte, then
            if (c == '\n') {
                if (currentLine.length() == 0) {
                    return header; //End of request Header
                }else {      // if you got a newline, then clear currentLine:
                    header[lineCount] = currentLine;
                    lineCount++;
                    currentLine = "";
                }
            }else if (c != '\r') {    // if you got anything else but a carriage return character,
                currentLine += c;
            }
        }
	}
	return header;
}
String* getPathAndMethod(String topHeader){
    String result[2];
    char topHeaderAsChar[1024];
    String splits[20];
    int splitCount = 0;
    topHeader.toCharArray(topHeaderAsChar,1024);
    for(int x = 0;x<1024;x++){
        if(topHeaderAsChar[x] == '\0'){
            break;
        }else{
            if(topHeaderAsChar[x] == ' '){
                splitCount++;
            }else{
                splits[splitCount] += topHeaderAsChar[x];
            }
        }
    }
    result[0] = splits[0];
    result[1] = splits[1];
    return result;
}
void response200(WiFiClient client){
    client.println("HTTP/1.1 200 OK");
    client.println("Content-type:text/html");
    client.println();
}
void response400(WiFiClient client){
    client.println("HTTP/1.1 400 Bad Request");
    client.println("Content-type:text/html");
    client.println();
}
void response404(WiFiClient client){
    client.println("HTTP/1.1 404 Not Found");
    client.println("Content-type:text/html");
    client.println();
}
