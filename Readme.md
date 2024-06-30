
# Cleat Craft

The Cleat Craft is a comprehensive ecommerce application built on Node.js and Express.js, leveraging MongoDB for database management and EJS as the view engine. Following the MVC architecture, it offers robust functionality for both administrators and users. Administrators can securely sign in, manage users (including blocking/unblocking), oversee categories, and handle products with features like image cropping and resizing. Meanwhile, users can enjoy a seamless experience, signing up or logging in with validation, OTP functionality, or single sign-on options like Google or Facebook. The user side boasts a user-friendly interface with product listings, detailed views complete with image zoom, essential product information including ratings, prices, discounts, and stock availability. Error handling ensures a smooth user experience, while related product recommendations enhance engagement.
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file


`PORT`
`MONGODB_CONNECTION_STRING`

`ADMIN_USERNAME`
`ADMIN_PASSWORD`

`SMTP_HOST`
`SMTP_PORT`
`SMTP_MAIL`
`SMTP_PASSWORD`

`GOOGLE_CLIENT_ID`
`GOOGLE_CLIENT_SECRET`
`GOOGLE_CALLBACK_URL`

`RAZORPAY_KEY_ID`
`RAZORPAY_KEY_SECRET`



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

- **bcrypt**: Bcrypt is a library used for hashing passwords securely. It's commonly used in Node.js applications for user authentication and password storage.
  - Version: ^5.1.1

- **chart.js**: Chart.js is a JavaScript library for creating charts and graphs. It's widely used for data visualization in web applications.
  - Version: ^4.4.3

- **connect-flash**: Connect-flash is a middleware for storing and retrieving messages in the session. It's often used in web applications for displaying flash messages to users.
  - Version: ^0.1.1

- **cookie-parser**: Cookie-parser is a middleware used for parsing cookies attached to the client request. It simplifies the process of working with cookies in Express.js applications.
  - Version: ^1.4.6

- **cropperjs**: Cropper.js is a JavaScript image cropping library. It allows users to crop images directly in the browser.
  - Version: ^1.6.2

- **dotenv**: Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env. It's commonly used to keep sensitive information like API keys or database credentials out of source code.
  - Version: ^16.4.5

- **ejs**: EJS (Embedded JavaScript) is a simple templating language that lets you generate HTML markup with plain JavaScript. It's often used in Node.js web applications for server-side rendering.
  - Version: ^3.1.10

- **exceljs**: ExcelJS is a library for reading, manipulating, and writing Excel spreadsheets in JavaScript.
  - Version: ^4.4.0

- **express**: Express is a fast, unopinionated, minimalist web framework for Node.js. It provides a robust set of features for building web applications and APIs.
  - Version: ^4.19.2

- **express-ejs-layouts**: Express-ejs-layouts is an extension for Express.js that allows you to easily use layouts (template files with common markup) with EJS templates.
  - Version: ^2.5.1

- **express-session**: Express-session is a middleware for managing sessions in Express.js applications. It provides session-based authentication and allows you to store session data on the server.
  - Version: ^1.18.0

- **moment**: Moment.js is a library for parsing, validating, manipulating, and formatting dates in JavaScript.
  - Version: ^2.30.1

- **mongoose**: Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. It provides a straightforward schema-based solution for modeling application data and interacting with MongoDB databases.
  - Version: ^8.3.2

- **multer**: Multer is a middleware for handling multipart/form-data, which is primarily used for uploading files in Express.js applications.
  - Version: ^1.4.5-lts.1

- **nocache**: Nocache is a middleware for Express.js that prevents client-side caching of HTTP responses. It adds appropriate Cache-Control and Pragma headers to responses to instruct clients not to cache the content.
  - Version: ^4.0.0

- **nodemailer**: Nodemailer is a module for sending email with Node.js. It supports multiple transport methods (SMTP, sendmail, etc.) and provides a simple API for sending emails asynchronously.
  - Version: ^6.9.13

- **notyf**: Notyf is a minimalistic JavaScript library for toast notifications.
  - Version: ^3.10.0

- **otp-generator**: OTP-generator is a library for generating one-time passwords (OTPs) in Node.js applications. It supports multiple algorithms (TOTP, HOTP) and is commonly used for two-factor authentication (2FA) implementations.
  - Version: ^4.0.1

- **passport**: Passport is an authentication middleware for Node.js. It provides a flexible framework for authenticating users via username and password, OAuth, and other strategies.
  - Version: ^0.7.0

- **passport-google-oauth2**: Passport-Google-OAuth2 is a Google OAuth 2.0 authentication strategy for Passport.
  - Version: ^0.2.0

- **pdfkit**: PDFKit is a PDF generation library for Node.js.
  - Version: ^0.15.0

- **pdfkit-table**: PDFKit-Table is an extension for PDFKit that allows you to easily create tables in PDF documents.
  - Version: ^0.1.99

- **razorpay**: Razorpay is a payment gateway for India. It allows businesses to accept, process, and disburse payments with its developer-friendly APIs.
  - Version: ^2.9.4

- **uuid**: UUID (Universally Unique Identifier) is a library for generating unique identifiers. It provides functions for creating UUIDs in various formats (v1, v4) and is often used for generating unique identifiers in distributed systems.
  - Version: ^9.0.1

- **voucher-code-generator**: Voucher-Code-Generator is a library for generating and validating voucher codes in Node.js applications.
  - Version: ^1.3.0

## DevDependencies

- **nodemon**: Nodemon is a utility that monitors changes in your Node.js application and automatically restarts the server. It's commonly used in development to improve workflow efficiency.
  - Version: ^3.1.0

