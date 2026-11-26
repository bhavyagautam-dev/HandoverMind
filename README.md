
# 🏥 HandoverMind AI
### AI-Powered Nurse Handoff & Patient Management Platform

**HandoverMind AI** is an intelligent, multi-hospital healthcare platform designed to simplify nursing shift handoffs and improve patient information management.

The platform combines voice-based handoff, AI-powered assistance, patient management, hospital administration, and role-based access control to make healthcare communication more organized and efficient.

> 🎙️ **Voice Handoff Available!**  
> Nurses can use the Voice Handoff feature to communicate patient updates through voice, making shift transitions more convenient and reducing dependency on manual typing.

---

## ✨ Key Features

### 🎙️ 1. Voice Handoff
- Voice-based patient handoff functionality.
- Voice-first workflow for nursing shift transitions.
- Capture important patient updates through voice.
- Reduce repetitive manual typing.
- Make patient information transfer more convenient.

### 🤖 2. AI-Powered Handoff Assistance
- AI-assisted patient handoff workflow.
- Structured handoff information.
- SBAR-based handoff organization.
- AI-generated patient summaries where enabled.
- Patient risk highlights where enabled.
- Organize important observations and pending tasks.

**SBAR Framework:**
- **S – Situation:** Current patient condition.
- **B – Background:** Relevant patient history.
- **A – Assessment:** Current assessment and observations.
- **R – Recommendation:** Follow-up actions and recommendations.

### 🏥 3. Multi-Hospital Management
- Support multiple hospitals on one platform.
- Hospital registration and approval workflow.
- Hospital-specific patient and staff management.
- Independent hospital data management.
- Hospital-level data isolation.
- Centralized platform administration.

### 👨‍💼 4. Super Admin Dashboard
- View platform-wide statistics.
- View registered hospitals.
- Approve hospital registrations.
- Reject hospital registrations with reasons.
- Suspend and reactivate hospitals.
- Archive hospitals.
- View archived hospitals.
- Monitor hospital registration statuses.

### 🏨 5. Hospital Manager Dashboard
- Manage hospital operations.
- Register and manage patients.
- Add and manage nurses.
- Manage hospital staff.
- Assign patients to nurses.
- Monitor handoff activities.
- Access hospital-specific records.

### 👩‍⚕️ 6. Nurse Dashboard
- View assigned patients.
- Access patient information.
- Create new patient handoffs.
- Use Voice Handoff.
- View handoff history.
- Review previous shift handoffs.
- Access individual handoff details.
- Track patient observations and pending tasks.

### 🧑‍⚕️ 7. Medical Staff & Non-Staff Medical
- Role-specific user access.
- Hospital-based account association.
- Permission-based access to relevant information.
- Restricted access according to assigned permissions.

### 👥 8. Patient Management
- Register new patients.
- View patient records.
- Search patient information.
- Update patient details.
- Assign patients to nurses.
- Manage patient status.
- Access patient information during handoffs.

### 📋 9. Handoff Management
- Create structured handoff records.
- View handoff history.
- Access detailed handoff information.
- Record important observations.
- Maintain shift-related patient updates.
- Organize pending tasks and recommendations.

### 🔐 10. Authentication & Security
- JWT-based authentication.
- Access and refresh tokens.
- Role-Based Access Control (RBAC).
- Hospital-level data isolation.
- Super Admin access restrictions.
- Hospital suspension and archive restrictions.
- Individual account activation and deactivation.

---

## 👤 User Roles

| Role | Responsibilities |
|---|---|
| Super Admin | Platform-wide hospital management |
| Hospital Manager | Hospital operations, staff and patient management |
| Nurse | Patient information and shift handoffs |
| Medical Staff | Access to permitted medical functions |
| Non-Staff Medical | Restricted access based on assigned permissions |

---

## 🛠️ Technology Stack

### Frontend
- React.js
- Vite
- JavaScript
- HTML5
- CSS3
- React Router

### Backend
- Python
- Django
- Django REST Framework
- Simple JWT

### Database
- PostgreSQL (Neon)
- SQLite (Local Development)

### AI Integration
- Groq API
- AI-powered handoff assistance
- SBAR-based structured information

### DevOps & Deployment
- Docker
- Microsoft Azure
- Azure Container Registry (ACR)
- Azure Container Apps
- Azure Storage Static Website
- Git & GitHub

---

## 🏗️ System Architecture

```text
                    USERS
                      |
       +--------------+--------------+
       |              |              |
   Super Admin   Hospital Manager   Nurse
       |              |              |
       +--------------+--------------+
                      |
                React Frontend
                      |
                 REST APIs
                      |
                Django Backend
                      |
        +-------------+-------------+
        |             |             |
    PostgreSQL     JWT Auth       Groq AI
        |                           |
   Patient Data                AI Handoff
   Hospital Data                Assistance
   Handoff Data
```

---

## ☁️ Deployment Architecture

| Component | Technology |
|---|---|
| Frontend Hosting | Azure Storage Static Website |
| Backend Hosting | Azure Container Apps |
| Container Registry | Azure Container Registry |
| Database | Neon PostgreSQL |
| AI Services | Groq API |
| Containerization | Docker |

---

## 🎯 Project Objectives

- Simplify nursing shift handoffs.
- Make voice-based patient handoffs available.
- Improve patient information organization.
- Reduce repetitive manual documentation.
- Support AI-assisted clinical handoff summaries.
- Provide centralized multi-hospital management.
- Maintain secure, role-based access.
- Improve communication between outgoing and incoming nursing shifts.

---

## 🔮 Future Enhancements

- Real-time handoff notifications.
- Advanced patient risk monitoring.
- Improved multilingual voice support.
- AI-based missing-information detection.
- Clinical trend visualization.
- PDF handoff report generation.
- Advanced hospital analytics.
- Handoff audit and activity logs.

---

## ⚠️ Medical Disclaimer

HandoverMind AI is designed as a healthcare workflow and clinical communication support platform. AI-generated information is intended to assist healthcare professionals and must be reviewed by qualified medical personnel. The platform does not replace professional medical judgment or clinical decision-making.

---

## 👨‍💻 Project Information

| Detail | Description |
|---|---|
| Project Name | HandoverMind AI |
| Category | Healthcare Technology / Artificial Intelligence |
| Project Type | Multi-Hospital Healthcare Platform |
| Core Focus | Voice-First Nurse Handoff |
| Backend | Django REST Framework |
| Frontend | React.js |
| Database | PostgreSQL |

---

## 💡 Our Vision

To make healthcare communication smarter, more accessible, and more efficient by combining voice technology, artificial intelligence, and structured patient handoff management.

### **HandoverMind AI — Smarter Handoffs, Better Healthcare.**
