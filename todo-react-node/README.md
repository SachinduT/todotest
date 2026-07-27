# React + Node.js To-Do App

A simple full-stack To-Do web application built with:

- React and Vite for the frontend
- Node.js and Express for the backend
- A local JSON file for persistent task storage

## Features

- Add a task
- Mark a task as completed
- Edit a task
- Delete a task
- Filter by All, Active, or Completed
- Clear all completed tasks
- Responsive modern design
- Data remains after the server restarts

## Requirements

- Node.js 20.19 or newer
- npm

## Run the project

Open a terminal inside the project folder and run:

```bash
npm run install-all
npm run dev
```

Then open:

```text
http://localhost:5173
```

The backend API runs at:

```text
http://localhost:5000/api/todos
```

## Production build

```bash
npm run build
npm start
```

Then open:

```text
http://localhost:5000
```

## Main API routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/todos` | Get all tasks |
| POST | `/api/todos` | Add a task |
| PATCH | `/api/todos/:id` | Update a task |
| DELETE | `/api/todos/:id` | Delete a task |
| DELETE | `/api/todos/completed/all` | Delete completed tasks |
