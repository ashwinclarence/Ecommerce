
# Cleat Craft

The Cleat Craft is a comprehensive ecommerce application built on Node.js and Express.js, leveraging MongoDB for database management and EJS as the view engine. Following the MVC architecture, it offers robust functionality for both administrators and users. Administrators can securely sign in, manage users (including blocking/unblocking), oversee categories, and handle products with features like image cropping and resizing. Meanwhile, users can enjoy a seamless experience, signing up or logging in with validation, OTP functionality, or single sign-on options like Google or Facebook. The user side boasts a user-friendly interface with product listings, detailed views complete with image zoom, essential product information including ratings, prices, discounts, and stock availability. Error handling ensures a smooth user experience, while related product recommendations enhance engagement.


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file:

```dotenv
PORT
MONGODB_CONNECTION_STRING
ADMIN_USERNAME
ADMIN_PASSWORD
SMTP_HOST
SMTP_PORT
SMTP_MAIL
SMTP_PASSWORD


## Run Locally

Clone the project

```bash
  git clone https://github.com/ashwinclarence/Ecommerce.git
```

Go to the project directory

```bash
  cd my-project
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm start
```


## Dependencies


- **bcrypt** : Bcrypt is a library used for hashing passwords securely. It's commonly used in Node.js applications for user authentication and password storage.

- **connect-flash**: Connect-flash is a middleware for storing and retrieving messages in the session. It's often used in web applications for displaying flash messages to users.

- **cookie-parser** : Cookie-parser is a middleware used for parsing cookies attached to the client request. It simplifies the process of working with cookies in Express.js applications.

- **dotenv** : Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env. It's commonly used to keep sensitive information like API keys or database credentials out of source code.

- **ejs** : EJS (Embedded JavaScript) is a simple templating language that lets you generate HTML markup with plain JavaScript. It's often used in Node.js web applications for server-side rendering.

- **express** : Express is a fast, unopinionated, minimalist web framework for Node.js. It provides a robust set of features for building web applications and APIs.

- **express-ejs-layouts** : Express-ejs-layouts is an extension for Express.js that allows you to easily use layouts (template files with common markup) with EJS templates.

- **express-session** : Express-session is a middleware for managing sessions in Express.js applications. It provides session-based authentication and allows you to store session data on the server.

- **mongoose** : Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. It provides a straightforward schema-based solution for modeling application data and interacting with MongoDB databases.

- **multer** : Multer is a middleware for handling multipart/form-data, which is primarily used for uploading files in Express.js applications.

- **nocache** : Nocache is a middleware for Express.js that prevents client-side caching of HTTP responses. It adds appropriate Cache-Control and Pragma headers to responses to instruct clients not to cache the content.

- **nodemailer** : Nodemailer is a module for sending email with Node.js. It supports multiple transport methods (SMTP, sendmail, etc.) and provides a simple API for sending emails asynchronously.

- **otp-generator** : OTP-generator is a library for generating one-time passwords (OTPs) in Node.js applications. It supports multiple algorithms (TOTP, HOTP) and is commonly used for two-factor authentication (2FA) implementations.

- **uuid** : UUID (Universally Unique Identifier) is a library for generating unique identifiers. It provides functions for creating UUIDs in various formats (v1, v4) and is often used for generating unique identifiers in distributed systems.

