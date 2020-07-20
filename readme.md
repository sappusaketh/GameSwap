## Application overview

As every gamer desires to play almost all different kinds and latest games but, it is expensive to buy all the games. So Gameswap is here to fulfill desires of all the gamers who wish to play all the games which they don’t possess. This was the main idea behind the application.

- Application goal is to build an application which creates a platform for the users who are looking to swap/exchange their items with the others who are willing to do the same.
- This application is games based swap application.
  Following are the application functionalities:
- Create a new account/Register with the application
- Sign in
- Catalog category view based on item category
- View items according to user profile
- Perform a swap
- Give feedback to the items and users
- Delete the items in the user profile

### How to run application

- Make sure you have [node.js](https://nodejs.org/en/) and mongo db (Ignore this if you are using cloud based mongoDB) installed
- update db url in `models/DBscript.js` and `models/initDB.js`
- `npm install`
- If running for first time and would like to populate DB with mock/sample data then `cd models` && `node initDB.js`
- `cd controls` from root directory
- `node app.js` (or) `nodemon app.js`

Check UserManual.pdf for more info on how to use the application

### Login credentials for mock/sample data:

<details>
<summary>user1</summary>

> **_emailID_**- user1@anyemail.com </br> **_password_**- user1

</details>

<details>
<summary>user2</summary>

> **_emailID_**- user2@anyemail.com </br> **_password_**- user2

</details>

<details>
<summary>user3</summary>

> **_emailID_**- user3@anyemail.com </br> **_password_**- user3

</details>

<details>
<summary>user4</summary>

> **_emailID_**- user4@anyemail.com </br> **_password_**- user4

</details>
