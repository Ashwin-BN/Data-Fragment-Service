# Fragments Microservice

## Overview

The **Fragments Microservice** is designed for a fictional Canadian manufacturing company to manage and work with small fragments of text or images. These fragments are smaller than traditional documents and come in a variety of formats (text, images, etc.). This microservice is built to be scalable, providing CRUD operations on fragments and enabling format conversions. The service integrates with AWS and other internal systems for efficient handling of data and ensures robust authentication and authorization.

---

## Key Features

- **HTTP REST API**: Exposes endpoints to interact with the fragments (text and image data).
- **Fragment CRUD Operations**: Enables the creation, retrieval, updating, and deletion of fragments.
- **Format Conversion**: Allows conversion of fragments between different formats, such as converting Markdown to HTML or JPEG to PNG, without increasing storage costs.
- **Authorization**: Ensures proper authorization for all operations, isolating data between different users.
- **Scalability**: Designed to scale massively to handle large amounts of data.
- **Deployment**: Deployed to AWS, with automatic build, testing, and deployment using GitHub.

---

## Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the API Locally](#running-the-api-locally)
- [API Documentation](#api-documentation)
- [Health Check](#health-check)
- [Fragments API](#fragments-api)
- [Contributing](#contributing)
- [License](#license)

---

## Installation

To get started with the project, follow the steps below.

### Clone the Repository

```bash
git clone <repository-url>
cd <repository-folder>
```

### Install Dependencies

Run the following command to install all required dependencies:

```bash
npm install
```

---

## Environment Variables

Before running the application, ensure you configure the following environment variables using the `.env` file:

- **`NODE_ENV`**: Specifies the environment mode. In development, logging is set to debug mode. In production, standard logs are used.
  - Example: `development`, `production`

- **`AWS_COGNITO_POOL_ID`**: The Amazon Cognito User Pool ID for user authentication. Required if `USE_AWS_AUTH` is set to true.
  - Example: `us-east-1_C0rmjoZwe`

- **`AWS_COGNITO_CLIENT_ID`**: The Amazon Cognito Client ID for the application. Required if `USE_AWS_AUTH` is set to true.
  - Example: `7lksepmgjsq3aspmf7uqa3hucu`

- **`HTPASSWD_FILE`**: The path to the file containing acceptable usernames and passwords for the application. Required if `USE_AWS_AUTH` is set to false.
  - Example: `tests/.htpasswd`

- **`PORT`**: Specifies the port on which the microservice runs.
  - Example: `8080`

---

## Running the API Locally

Follow the steps below to run the API on your local environment.

### Checking for Errors

To check for errors in the code using ESLint, run the following command:

```bash
npm run lint
```

### Debug Mode

To run the code in debug mode or to integrate with the VSCode debugger, use the following command:

```bash
npm debug
```

### Running the Development Server

To run the Express server in Development mode with hot-reloading (nodemon), use the following command:

```bash
npm run dev
```

This starts the server using `nodemon`, which automatically restarts the server when changes are detected in the source code.

### Starting the Server

To start the server for production-like environments, use:

```bash
npm start
```

---

## API Documentation

The **Fragments Microservice** exposes the following API endpoints:

### 1. Health Check

Check the health of the service by accessing the root route (`/`). This route does not require authentication.

#### Example Response:

```json
{
  "status": "ok",
  "author": "David Humphrey <david.humphrey@senecapolytechnic.ca>",
  "githubUrl": "https://github.com/humphd/fragments",
  "version": "0.5.3"
}
```

#### Example Usage (using curl):

```bash
curl -i https://fragments-api.com/
```

### 2. Fragments

Fragments represent pieces of data (text or images). Each fragment has two parts: metadata and data (binary content).

#### Fragment Metadata:

- **id**: Unique identifier (UUID) for the fragment.
- **ownerId**: Hashed email address of the fragment owner.
- **created**: Timestamp of when the fragment was created (ISO 8601 format).
- **updated**: Timestamp of when the fragment was last updated.
- **type**: The MIME type of the fragment (e.g., `text/plain`, `image/png`).
- **size**: Size of the fragment data in bytes.

#### 3. POST /fragments

Creates a new fragment by posting raw binary data (text or image). The request body should contain the fragment data, and the `Content-Type` header should be set accordingly.

##### Example Request:

```bash
curl -i \
  -X POST \
  -u user1@email.com:password1 \
  -H "Content-Type: text/plain" \
  -d "This is a fragment" \
  https://fragments-api.com/v1/fragments
```

##### Example Response:

```json
{
  "status": "ok",
  "fragment": {
    "id": "30a84843-0cd4-4975-95ba-b96112aea189",
    "ownerId": "11d4c22e42c8f61feaba154683dea407b101cfd90987dda9e342843263ca420a",
    "created": "2021-11-02T15:09:50.403Z",
    "updated": "2021-11-02T15:09:50.403Z",
    "type": "text/plain",
    "size": 256
  }
}
```

---
[Ashwin BN](https://github.com/Ashwin-BN/)
