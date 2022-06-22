<div id="top"></div>


<!-- ABOUT THE PROJECT -->
# Jobly - Find your dream company!
## Frontend: JavaScript - React
## Backend: JavaScript - Node.js - Express - Postgres

<p align="right">(<a href="#top">back to top</a>)</p>

### Built With
* [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
* [React](https://reactjs.org/docs/getting-started.html)
* [Node.js](https://nodejs.org/en/docs/)
* [Express](https://expressjs.com/en/5x/api.html)
* [Postgres](https://www.postgresql.org/docs/current/app-psql.html)


<p align="right">(<a href="#top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

Jobly is a full stack application that allows users to find their dream company and their job openings.


### Installation

After downloading the code from GitHub:

    $ npm install

To start the React component of the application:

    $ npm start

To start the backend server:

    $ node server 3001

## Usage

Create database:

    $ psql
        CREATE DATABASE jobly
        (Control-D to exit)

Add sample data into database:

    $ psql jobly -f jobly.sql

To run tests:

    $ jest -i



<p align="right">(<a href="#top">back to top</a>)</p>

<!-- Routes -->
## Routes
- /auth/token
- /auth/register
- /companies
- /companies/:handle
- /jobs
- /jobs/:id
- /users
- /users/:username
- /users/jobs/:id

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- Features -->
## Features
### JSON Web Tokens
- Checked for authorization and authentication
### JSON Schema
- Validated forms on submission before reaching the database

<br>

<!-- ROADMAP -->
## Roadmap

Ideas for improving the current setup
- Allowing users to send job applications

<br>

# Made by Austin Chao
*Pair programmed with [Anita Lee](https://github.com/anita-lee)*

<p align="right">(<a href="#top">back to top</a>)</p>


