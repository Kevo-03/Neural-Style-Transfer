# Neural Style Transfer (NST) Web Application

A full-stack, AI-powered web application that allows users to apply neural style transfer to their images. It consists of a robust Next.js frontend and a scalable FastAPI backend that delegates heavy machine learning processing to Celery workers. 

**Live Application:** [https://www.neuralart.app/](https://www.neuralart.app/)

## Tech Stack

### Frontend
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Language:** TypeScript
- **Package Manager:** pnpm

### Backend
- **API Framework:** [FastAPI](https://fastapi.tiangolo.com/)
- **Machine Learning:** TensorFlow & TensorFlow Hub
- **Task Queue:** Celery with Redis broker
- **Database:** PostgreSQL (with SQLModel for ORM)
- **Authentication:** PyJWT, Argon2 (Password Hashing)

### Infrastructure
- **Containerization:** Docker & Docker Compose

## Features
- **Neural Style Transfer:** Process content images with style images using pre-trained deep learning models.
- **Asynchronous Processing:** Heavy ML tasks run in the background using Celery workers, ensuring the API stays fast and responsive.
- **Authentication System:** Secure JWT-based user authentication and authorization.
- **Database Persistence:** Stores user details and job statuses securely in PostgreSQL.

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js (v20+)
- pnpm

### Running the Application

#### 1. Start the Backend (API, Database, Redis, Celery Worker)
The backend is fully dockerized for easy setup. First, navigate to the backend directory:
```bash
cd backend
```
Create a `.env` file from any example templates provided, or ensure you have valid POSTGRES and API configuration variables. Then, build and start the containers:
```bash
docker-compose up --build
```
This will start:
- FastAPI Web Server on `http://localhost:8000`
- PostgreSQL Database (`nst_db`)
- Redis Broker (`nst_redis`)
- Celery Task Worker (`nst_worker`)

*You can check the API documentation by visiting `http://localhost:8000/docs` once running.*

#### 2. Start the Frontend
In a new terminal, navigate to the frontend directory:
```bash
cd frontend
```
Install the dependencies:
```bash
pnpm install
```
Start the Next.js development server:
```bash
pnpm dev
```
The frontend will become available at `http://localhost:3000`.

## Project Structure

```
NST/
├── backend/
│   ├── app/                # FastAPI application (routers, auth, db models)
│   ├── ml_engine/          # Neural Style Transfer scripts & model logic
│   ├── celery_worker.py    # Celery worker configuration
│   ├── docker-compose.yml  # Container orchestration
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile          # Backend build instructions
└── frontend/
    ├── src/                # Next.js Source (components, app layout)
    ├── public/             # Static assets
    ├── package.json        # Node dependencies and scripts
    └── tailwind.config.ts  # Tailwind specifications
```
