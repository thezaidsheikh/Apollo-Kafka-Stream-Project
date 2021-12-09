# Command to run the program :-  
node src/index.js

# Basic details of folder and there working :- 
1. In src/models folder there are all the models created.
2. In src/controller folder there are all the controllers created.
3. In src/helper folder there are helper file that is used commonly.
4. In src/helper/producer.js file kafka program is written that is used to stream the data on kafka server.

5. In src/helper/producer.js file there are two methods "getRandomNumber", "creatingSourceLogData". The first methods is used to generate a random numbers between any two numbers.
   and the second one is used to create a document in source_log table.


# Controllers working :- 
1. All the controllers have same working the only difference is with there methods name and for different logs like (depth,time,second).
2. There are three controllers in src/controller "depth.controller.js", "sec.controller.js", "time.controller.js".
3. depth controller is used for the depth sheet.
4. sec controller is used for the depth sheet.
5. time controller is used for the depth sheet.