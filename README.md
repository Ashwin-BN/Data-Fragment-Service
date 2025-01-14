# Fragments Back-End API

## Table of Contents

- [Project Setup](#project-setup)
- [Scripts](#scripts)
  - [Start](#start)
  - [Dev](#dev)
  - [Debug](#debug)
  - [Lint](#lint)
- [Running the Server](#running-the-server)
- [Debugging](#debugging)
- [Notes](#notes)

## Project Setup

### 1. Software Installation

Ensure the following software is installed before setting up the project:

- **[Node.js](https://nodejs.org/en/)**: LTS (Long Term Support) version is recommended. Node.js is the runtime for the backend server.
- **[Visual Studio Code](https://code.visualstudio.com/)**: Recommended IDE for development.
  - Install the following extensions:
    - **ESLint**: For linting JavaScript.
    - **Prettier**: For auto-formatting code.
    - **Code Spell Checker**: Helps catch spelling mistakes.
- **[Git](https://git-scm.com/)**: For version control.
- **[Curl](https://curl.haxx.se/)**: Used for making HTTP requests (required on some platforms like Windows PowerShell).

### 2. Clone the Repository

Clone the repository to your local machine:

```bash
git clone https://github.com/Ashwin-BN/fragments.git
cd fragments
```

### 3. Install Dependencies

Install the required Node.js dependencies:

```bash
npm install
```

### 4. Environment Variables

Ensure you have the necessary environment variables configured. For example, in a `.env` file:

```bash
LOG_LEVEL=debug
```

Make sure to replace or add any other environment variables specific to your project.

## Scripts

### Start

Run the server in production mode without live-reloading or debugging:

```bash
npm start
```

This will execute:

```bash
node src/server.js
```

By default, the server will be accessible at:

```
http://localhost:8080
```

### Dev

Run the server in **development mode** using `nodemon`, which automatically restarts the server when files are changed:

```bash
npm run dev
```

This will execute:

```bash
nodemon src/server.js --watch src
```

### Debug

Start the server with debugging enabled using the **Node.js Inspector** on port `9229`:

```bash
npm run debug
```

This will execute:

```bash
nodemon --inspect=0.0.0.0:9229 src/server.js --watch src
```

You can connect a debugger (e.g., in **VSCode** or **Chrome DevTools**) to this port for debugging.

### Lint

Run **ESLint** to check for code issues and maintain code quality:

```bash
npm run lint
```

This will execute:

```bash
eslint ./src/**/*.js
```

To automatically fix linting issues (if possible):

```bash
npm run lint -- --fix
```

## Running the Server

- **For Production**: Run `npm start` to start the server in production mode.
- **For Development**: Run `npm run dev` to start the server with live-reloading for easier development.
- **For Debugging**: Use `npm run debug` to start the server with debugging enabled, allowing you to inspect and step through the code.

## Debugging

### Using VSCode

1. Open **Run and Debug** in VSCode (`Ctrl + Shift + D`).
2. Select **Debug via npm run debug**.
3. Press **F5** or click **Start Debugging** to begin.

Ensure you have the necessary `launch.json` configuration in the `.vscode` folder.

## Notes

- **Ports**:

  - The server runs by default on **port 8080**.
  - The Node.js Inspector listens on **port 9229** during debugging.

- **Environment Variables**:

  - Make sure any necessary environment variables (like `LOG_LEVEL`) are set before running the server or starting debugging.

- **Error Handling**: Ensure your environment and error handling is configured correctly for smooth operation.

- **Using curl**:
  We use _curl.exe_ in Windows because Windows requires executables to have the .exe extension, ensuring proper recognition and avoiding conflicts with other files. In UNIX-based systems, no such extension is needed.
