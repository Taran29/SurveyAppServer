<h1> Survey App Server </h1>

<a href="https://survey-app-taran29.netlify.app">Deployed website link</a>
<p>This is the back-end part of my Survey App project, written using NodeJS, Express and using MongoDB as my database. It's my first major MERN stack application. It uses my existing User Auth App and builds a survey functionality on top of it. Know more about my user auth app here: <a href="https://github.com/Taran29/UserAuthServer">User Auth Server</a> </p>

<a href="https://github.com/Taran29/SurveyApp">Frontend repository for this project</a>

This webserver has the following data models: 

<ol>
  <li>The User model consists of: 
    <ul>
      <li>User's name, email and hashed password.</li>
      <li>Security question and hashed answer.</li>
      <li>Created survey ID array with count.</li>
      <li>Filled survey ID array with count (computed model; Used for pagination).</li>
    </ul>
  </li> <br>
  <li>The Survey model consists of: 
    <ul>
      <li>Survey's title and category.</li>
      <li>Visibility (private/public).</li>
      <li>Creator's ID and created date and time.</li>
      <li>Questions and options array.</li>
      <li>Number of times a survey has been filled.</li>
    </ul>
  </li> <br>
  <li>The Category model consists of:
    <ul>
      <li>Category name.</li>
      <li>Number of public surveys for that category (used for sorting categories by relevance).</li>
    </ul>
  </li> <br>
</ol>

This web server has the following route handlers: 
<ol>
  <li>Login route handler:
    <ul>
      <li>Has a single POST API to check incoming request body and log the user in, if the credentials provided are valid.</li>
    </ul>
   </li> <br>
   <li>Register route handler:
     <ul>
       <li>Has a single POST API that hashes certain attributes (password, security question's answer) of the incoming request body and stores the user in the DB.</li>
     </ul>
   </li> <br>
   <li>Forgot Password route handler:
     <ul>
      <li>The GET API fetches the user's security question based on the email they have provided.</li>
      <li>The first POST API takes in the security question's answer, hashes it and verifies it against the existing answer. If it's a match, then a JWT token is generated and sent back to the client.</li>
      <li>The second POST API takes in the new password and the token provided by the previous API, and then changes the password on the DB.</li>
     </ul>
   </li> <br>
   <li>Survey route handler:
     <ul>
      <li>Has a GET API to fetch surveys list for the home page based on page number.</li>
      <li>Has another GET API to fetch information about a single survey, to fill or to see its stats (if you're the creator of the survey).</li>
      <li>Has a POST API to create your own survey.</li>      
      <li>Has a POST API to fill someone else's survey.</li>
     </ul>
   </li> <br>
   <li>User route handler:
     <ul>
      <li>Has GET APIs to fetch created/filled surveys list based on page number.</li>
      <li>Has a GET API to fetch filled survey information for the current user.</li>
      <li>Has a GET API to fetch stats for a survey created by the current user.</li>
     </ul>
   </li> <br>
   <li>Category route handler:
    <ul>
      <li>Has a single GET route to fetch list of categories for the dropdowns.</li>
    </ul>
   </li> <br>
   <li>Change Name route handler:
    <ul>
      <li>Has a PUT API to change name for existing user.</li>
    </ul>
   </li> <br>
</ol>


