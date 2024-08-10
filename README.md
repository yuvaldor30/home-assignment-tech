# Presentation Management Platform

This project is a server-side service for managing presentations and their associated slides. The service is built using Node.js with Express and MongoDB. It allows users to create, update, delete, and view presentations and slides via a RESTful API.

## Features

- **Create Presentations:** Add new presentations with a unique title and a list of authors.
- **Update Presentations:** Update the list of authors for a given presentation.
- **Delete Presentations:** Remove a presentation by its title.
- **View Presentations:** Retrieve details of a single presentation or a list of all presentations.
- **Manage Slides:** Add, update, and delete slides within a presentation.

## Prerequisites

- **Node.js**: Ensure you have Node.js installed on your machine. You can download it from [nodejs.org](https://nodejs.org/).
- **MongoDB**: You need to have a MongoDB server running. You can download MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community).

## Getting Started

### 1. Clone the Repository

```sh
git clone https://github.com/your-username/presentation-management-platform.git
cd presentation-management-platform
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Set Up MongoDB

Make sure your MongoDB server is running. By default, the project is configured to connect to a MongoDB server running locally at `mongodb://localhost:27017/test`.

To start a local MongoDB server, follow these steps:

1. **Download and Install MongoDB**:
   - Follow the installation instructions for your operating system from the [official MongoDB documentation](https://docs.mongodb.com/manual/installation/).

2. **Start the MongoDB Server**:
   - On Windows, run `mongod` in the command prompt.
   - On macOS, you can start MongoDB using Homebrew with `brew services start mongodb-community`.
   - On Linux, run `mongod` in the terminal.

### 4. Run the Application

```sh
npm start
```

The server will start on port 3000. You can access the API at `http://localhost:3000`.

You can copy and paste this into your `README.md` file to include just the instructions for running the app

### 5. API Endpoints

#### Presentations

- **GET /**: Home route with a welcome message.
- **POST /api/presentations**: Create a new presentation.
- **PUT /api/presentations/:title**: Update authors of a presentation.
- **DELETE /api/presentations/:title**: Delete a presentation by its title.
- **GET /api/presentations/:title**: View a single presentation by its title.
- **GET /api/presentations**: View all presentations.

#### Slides

- **POST /api/presentations/:title/slides**: Add a new slide to a presentation.
- **PUT /api/presentations/:title/slides/:index**: Update a slide in a presentation by index.
- **DELETE /api/presentations/:title/slides/:index**: Delete a slide from a presentation by index.

- ### Example API Requests

#### Create a Presentation

```sh
curl -X POST http://localhost:3000/api/presentations -H 'Content-Type: application/json' -d '{"title": "My Presentation", "authors": ["Author One", "Author Two"]}'
```
#### Add a Slide to a Presentation

```sh
curl -X POST http://localhost:3000/api/presentations/My%20Presentation/slides -H 'Content-Type: application/json' -d '{"topic": "Slide Topic", "body": "Slide Body"}'
```

### Dependencies

- **express**: Fast, unopinionated, minimalist web framework for Node.js.  
  ```sh
  npm install express
  ```
  
- **mongoose**: Elegant MongoDB object modeling for Node.js.
  ```sh
  npm install mongoose
  ```
  
- **joi**: Object schema validation. 
  ```sh
  npm install joi
  ```
  


