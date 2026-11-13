# HandoverMind AI 🏥

### AI-Powered Nurse Handoff Assistant

HandoverMind AI is a web-based application designed to make the nursing shift handoff process easier, more organized, and more reliable.

During a shift change, nurses need to communicate important patient information to the incoming nursing staff. Sometimes, important details can be missed or communicated inconsistently. The goal of this project is to provide a centralized platform where nurses can manage patient information, create handoff records, and access previous handoff history.

I built this project with a focus on simplifying the handoff workflow and exploring how AI can assist healthcare professionals in managing patient information.

---

## 🚀 Project Overview

HandoverMind AI provides separate access for nurses and administrators.

The application includes authentication, role-based access, patient management, and handoff record management. It uses a React frontend, Django REST Framework backend, and a PostgreSQL database hosted on Neon.

The application is also deployed on Microsoft Azure.

## ✨ Features

- **User Authentication:** Secure login and registration using JWT authentication.
- **Role-Based Access:** Separate Nurse and Admin roles.
- **Patient Management:** Manage and access patient records.
- **Nurse Dashboard:** A centralized place for nurses to access their work.
- **Handoff Management:** Create and manage patient handoff records.
- **Handoff History:** Access previously created handoff records.
- **Handoff Details:** View individual handoff information.
- **REST API:** Backend APIs built using Django REST Framework.
- **Cloud Deployment:** Frontend and backend deployed using Azure services.

## 🛠️ Technology Stack

### Frontend
- React.js
- Vite
- JavaScript
- CSS
- React Router

### Backend
- Python
- Django
- Django REST Framework
- Simple JWT
- Gunicorn

### Database
- PostgreSQL
- Neon Database
- SQLite (local development)

### AI Integration
- Groq API

### Cloud & Deployment
- Microsoft Azure Container Apps
- Azure Container Registry (ACR)
- Azure Storage Static Website
- Docker
- Git and GitHub

## 🏗️ Project Structure

```text
HandoverMind/
│
├── backend/
│   ├── config/
│   ├── core/
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── context/
│   │   ├── hooks/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
│
├── ml/
├── infrastructure/
├── docs/
└── README.md
```

## ⚙️ Local Installation & Setup

Follow these steps to run the project locally.

### 1. Clone the Repository

```bash
git clone https://github.com/bhavyagautam-dev/HandoverMind.git

cd HandoverMind
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the environment on Windows:

```powershell
venv\Scripts\activate
```

Install the required packages:

```bash
pip install -r requirements.txt
```

Run database migrations:

```bash
python manage.py migrate
```

Start the Django development server:

```bash
python manage.py runserver
```

Backend will run at:

`http://127.0.0.1:8000/`

### 3. Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Frontend will run at:

`http://localhost:5173/`

## 🔐 Environment Variables

Create the required environment configuration files locally. Never upload actual API keys, passwords, or secret keys to GitHub.

### Backend

Configure the required environment variables:

```env
DJANGO_SECRET_KEY=your_django_secret_key
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

DATABASE_URL=your_database_url
GROQ_API_KEY=your_groq_api_key

FRONTEND_URL=http://localhost:5173
```

### Frontend

Configure the backend base URL:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

The frontend uses this URL to communicate with the Django REST API.

## ☁️ Azure Deployment

One of the important parts of this project was deploying the application to the cloud.

I used different Azure services for the frontend and backend instead of hosting everything on a single server.

### Deployment Architecture

| Component | Service |
|---|---|
| Frontend | Azure Storage Static Website |
| Backend | Azure Container Apps |
| Docker Image | Azure Container Registry |
| Database | Neon PostgreSQL |
| Container Environment | Azure Container Apps Environment |

### Deployment Process

**1. Backend Deployment**

- Created a Docker image for the Django backend.
- Built and pushed the image to Azure Container Registry.
- Configured Azure Container Apps to run the backend container.
- Configured application secrets and environment variables.
- Connected the backend to Neon PostgreSQL.
- Ran database migrations in the deployed environment.

**2. Frontend Deployment**

- Created a production build using Vite.
- Configured the backend API URL for production.
- Enabled static website hosting in Azure Storage.
- Uploaded the production build to the `$web` container.
- Connected the frontend with the deployed backend.

**3. Database Configuration**

- Created a PostgreSQL database using Neon.
- Configured the database connection through environment variables.
- Connected the Django backend to the cloud database.
- Successfully executed database migrations.

**4. API and CORS Configuration**

- Configured CORS to allow requests from the deployed frontend.
- Verified backend connectivity and CORS preflight requests.
- Tested the registration and login functionality on the deployed application.

## 🧪 Testing & Current Progress

During development and deployment, I tested the following:

- Backend API connectivity.
- Database connection and migrations.
- JWT-based user authentication.
- User registration.
- User login.
- Frontend and backend communication.
- CORS configuration.
- Azure deployment and frontend accessibility.

The application has been successfully deployed to Azure, and registration and login have been tested on the deployed application.

## 🔮 Future Improvements

There are several features I plan to improve and add as development continues:

- AI-powered nurse handoff summaries.
- Voice-based patient handoff input.
- Patient risk identification and summarization.
- Improved dashboard analytics.
- Better handoff report generation.
- More comprehensive role-based permissions.
- Additional testing and security improvements.
- Improved user interface and experience.

## 🎯 What I Learned

While building HandoverMind AI, I got practical experience with:

- Building a full-stack application using React and Django.
- Developing REST APIs with Django REST Framework.
- Implementing JWT authentication.
- Working with PostgreSQL and Neon.
- Containerizing applications using Docker.
- Deploying backend services using Azure Container Apps.
- Working with Azure Container Registry.
- Hosting frontend applications using Azure Storage Static Websites.
- Configuring environment variables, CORS, and cloud database connections.

## 👥 Team Contributions

HandoverMind AI was developed as a collaborative project, with each team member contributing to different parts of the application.

| Team Member | Responsibilities |
|---|---|
| **Dhruv Kaushik** | AI development and Backend development |
| **Bhavya Gautam** | Frontend development and user interface |
| **Kushagra** | API handling, deployment, and testing |

### Our Contributions

- **AI & Backend (Dhruv Kaushik):** Worked on the AI-related functionality and backend development using Python and Django.
- **Frontend (Bhavya Gautam):** Worked on the React frontend, application pages, and user interface.
- **API, Deployment & Testing (Kushagra):** Worked on API handling, application deployment, and testing to ensure the frontend and backend work together.

## 👨‍💻 Project Team

**Dhruv Kaushik | Bhavya Gautam | Kushagra**

HandoverMind AI is a collaborative project, and we are continuously working to improve its functionality, usability, and AI capabilities.
---

*HandoverMind AI is an ongoing project. I am continuously working on improving its functionality, usability, and AI capabilities.*
