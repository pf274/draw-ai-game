# startup
## Github Assignment
CS 260 Start Up Project
This is where I'll keep notes.
I have successfully uploaded this to replit and it looks like version control works here too. How cool! It syncs with my github repository just fine.
I am already really familiar with github. I am a web developer for the BYU Law school and we use it for all our major projects. As for what I learned in the github assignment for this course, it really was just realizing that I can connect an online IDE to github.

**[Startup Repository](https://github.com/pf274/startup.git)**

## Elevator Pitch
Have you ever wanted to pit your drawing abilities against your friends and have an impartial judge? With Draw AI, you can do just that! Draw AI allows you to enter into a fun, fast-paced drawing challenge judged by Artificial Intelligence. To play the game, the website first gives you and your friends the same prompt. Each person playing then draws the prompt to the best of their ability under the time constraint, then the AI looks at each drawing and gives each one a score based on how recognizable it is. These scores are converted to points in the game, and the game continues on until several rounds have passed. This game is quick and quirky, and will leave you and your friends laughing.

### Concept Art
<img src="./Images/Concept_Art/sketch_1.jpg"  width=33%>
<img src="./Images/Concept_Art/sketch_2.jpg"  width=33%>
<img src="./Images/Concept_Art/sketch_3.jpg"  width=33%>
<img src="./Images/Concept_Art/sketch_4.jpg"  width=33%>
<img src="./Images/Concept_Art/sketch_5.jpg"  width=33%>
<img src="./Images/Concept_Art/sketch_6.jpg"  width=33%>
<img src="./Images/Concept_Art/sketch_7.jpg"  width=33%>
<img src="./Images/Concept_Art/sketch_8.jpg"  width=33%>
<img src="./Images/Concept_Art/sketch_9.jpg"  width=33%>
<img src="./Images/Concept_Art/sketch_10.jpg"  width=33%>

### Key Features:
* Secure sign up / log in
* Multiplayer support
* AI picture recognition
* Real-time updates
* Player data stored in a database
* Game lobby creation
* Game synchronization
* Responsive drawing board
* Touch / Stylus support

### What I have learned from the Simon CSS assignment:
* When a header or footer is always at the top/bottom of a page, it's called 'sticky'
* You need to include the bootstrap javascript file at the bottom of your body element so that dropdown menus and other items work as expected.
* Bootstrap class names are often predictable, and are necessary.
* Bootstrap makes web development very fast!

### What I have learned from the Simon JS assignment:
* setInterval and setTimeout are very useful for making animations. You can also use clearInterval to end an interval!
* you can use querySelector to get one item of a specific class.
* Sounds are created by loading them into an Audio object, so it's nice to initialize all your sounds and save the audio objects in another objects for quick reference.
* creating elements dynamically isn't too hard, as long as you keep track of the elements and know how to manipulate them. You can use element.appendChild to add a child element.

### Other notes on html and CSS:
* Use media queries like this: @media screen and (max-width: 100px) {}
* Flex is the easiest way that I have found to structure content the way I want.
Just use display: flex; and flex-direction: row/column; to initialize it.
* justify-content aligns things horizontally, while align-items aligns things vertically.
* In order to use a function from a module in a html file, you need to do the following:
    * create a script in html
    * import the functions from the module
    * create functions that call the imported functions (they cannot be accessed directly)
    * bind them to the window object, like so: window.setColorFromButton = setColorFromButton;

### Notes for the midterm:
* Console commands:
    * echo - Output the parameters of the command
    * cd - Change directory
    * mkdir - Make directory
    * rmdir - Remove directory
    * rm - Remove file(s)
    * mv - Move file(s)
    * cp - Copy files
    * ls - List files
    * curl - Command line client URL browser
    * grep - Regular expression search
    * find - Find files
    * top - View running processes with CPU and memory usage
    * df - View disk statistics
    * cat - Output the contents of a file
    * less - Interactively output the contents of a file
    * wc - Count the words in a file
    * ps - View the currently running processes
    * kill - Kill a currently running process
    * sudo - Execute a command as a super user (admin)
    * ssh - Create a secure shell on a remote computer
    * scp - Securely copy files to a remote computer
    * history - Show the history of commands
    * ping - Check if a website is up
    * tracert - Trace the connections to a website
    * dig - Show the DNS information for a domain
    * man - Look up a command in the manual
* Chaining:
    * | - Take the output from the command on the left and pipe, or pass, it to the command on the right
    * > - Redirect output to a file. Overwrites the file if it exists
    * >> - Redirect output to a file. Appends if the file exists