Alrighty so here we are

/control/movement
    POST:
        Payload:
            {
                ?left_wheel: Integer
                ?right_wheel: Integer
            }
        Payload Example:
            {
                left_wheel: 255 //255 is highest pwm
                right_wheel: 0  //0 is the lowest pwm
            }
        Response
            [200] Car accepted movement
                {
                    status: String
                }
            [400] Did not understand request syntax
                {
                    status: String
                    reason: String 
                }
            [500] Internal microcontroller error
                {
                    status: String
                    reason: String
                }
    GET:
        Payload:
            {
                ?
            }
        Response:
            {
                left_wheel: Integer
                right_wheel: Integer
            }

/control/accessory
    POST:
        Payload:
            {
                ?screen_preset: Integer
                ?song: String
                ?song_name: String
            }
        Example:
            {
                screen_preset: 1,                      //Presets are numbered
                song: "1:1000,3:2000,4:3000,5:1000,-1",//1:1000, note 1 played for 1 second.
                                                       //3:2000, note 3 played for 2 seconds. 
                                                       //-1, how many times to replay, must be at end
                song_name: "doop doop"
            }
        Response:
            [200] Request successful
                {
                    status: String
                }
            [400] Did not understand request
                {
                    status: String
                    reason: String
                }
            [500] Internal microcontroller error
                {
                    status: String
                    reason: String
                }
    GET:
        Payload:
            {
                ?
            }
        Response:
            {
                screen_preset: 3                        //returns the current screen preset
                song: 1:1000,3:2000,4:3000,5:1000,-1    //returns current song being played
                song_name: "doop doop"                  //returns the current song name
            }
    
        

    
