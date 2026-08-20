# 🚀 CampusPulse AI

> **AI-Powered Campus Complaint Management System**

CampusPulse AI is a smart campus complaint management platform that helps students report problems easily and enables administrators to manage, prioritize, and resolve complaints efficiently.

The platform uses **Artificial Intelligence** to automatically categorize complaints, detect their priority, and improve the overall complaint-resolution process.

---

## 🎯 Problem Statement

In colleges and universities, students often face problems related to:

* 🏫 Infrastructure
* 💡 Electricity
* 🚰 Water & sanitation
* 📚 Academics
* 🖥️ Technical issues
* 🛡️ Security
* 🧹 Cleanliness
* 🚌 Transportation

Traditional complaint systems can be slow, difficult to track, and inefficient for administrators.

### CampusPulse AI solves this problem by providing:

**Student → Complaint → AI Analysis → Priority → Admin → Resolution → Tracking**

---

## ✨ Key Features

### 🤖 AI-Powered Complaint Analysis

* Automatically categorizes complaints
* Detects complaint priority
* Helps administrators identify urgent issues
* Reduces manual complaint sorting

### 📝 Easy Complaint Submission

Students can quickly submit complaints with relevant details.

### 📊 Admin Dashboard

Administrators can:

* View complaints
* Filter complaints
* Check priority
* Track complaint status
* Manage resolutions

### 🔄 Real-Time Complaint Tracking

Students can track the progress of their complaints from submission to resolution.

### 📌 Smart Prioritization

Critical complaints can be identified and handled before low-priority issues.

### 📱 User-Friendly Interface

Simple and responsive interface designed for students and administrators.

---

## 🏗️ System Workflow

```text
Student
   ↓
Submit Complaint
   ↓
AI Analysis
   ↓
Category Detection
   ↓
Priority Detection
   ↓
Admin Dashboard
   ↓
Complaint Assignment
   ↓
Resolution
   ↓
Student Tracks Status
```

---

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* HTML
* CSS
* Vite

### Backend

* Node.js
* TypeScript
* REST APIs

### AI

* Google Gemini / AI API
* AI-based complaint categorization
* AI-based priority detection

### Development Tools

* Git
* GitHub
* VS Code
* Bun / npm

---

## 📂 Project Structure

```text
CampusPulse-AI/
│
├── assets/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── ...
│
├── server.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── metadata.json
├── bun.lock
├── .env.example
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/shashwatshukla1207/CampusPulse-AI.git
```

### 2. Navigate to the project

```bash
cd CampusPulse-AI
```

### 3. Install dependencies

Using npm:

```bash
npm install
```

Or using Bun:

```bash
bun install
```

### 4. Configure environment variables

Create a `.env` file using `.env.example`:

```bash
cp .env.example .env
```

Add the required API keys and environment variables.

### 5. Start the development server

```bash
npm run dev
```

Or:

```bash
bun run dev
```

---

## 🔐 Environment Variables

Create a `.env` file and add the required configuration:

```env
GEMINI_API_KEY=your_api_key_here
```

> Never commit your real API keys or `.env` file to GitHub.

---

## 🧠 How AI Is Used

CampusPulse AI uses AI to make the complaint-management process smarter.

### Example

**Student Complaint:**

> "The water cooler near the computer lab has not been working for two days."

### AI Analysis:

```text
Category: Water & Sanitation
Priority: High
Department: Maintenance
```

This allows administrators to process complaints more efficiently.

---

## 📊 Example Complaint Lifecycle

```text
Submitted
    ↓
AI Analyzed
    ↓
Categorized
    ↓
Priority Assigned
    ↓
Under Review
    ↓
Assigned to Department
    ↓
In Progress
    ↓
Resolved
```

---

## 🌟 Why CampusPulse AI?

| Traditional System           | CampusPulse AI          |
| ---------------------------- | ----------------------- |
| Manual categorization        | 🤖 AI categorization    |
| Difficult tracking           | 📊 Real-time tracking   |
| Same priority for complaints | 🚨 Smart prioritization |
| Slow administration          | ⚡ Faster management     |
| Limited visibility           | 📈 Admin dashboard      |
| Poor student feedback        | 🔄 Status tracking      |

---

## 🎯 Future Scope

CampusPulse AI can be extended with:

* 🔔 Push notifications
* 📧 Email notifications
* 📱 Mobile application
* 📍 Location-based complaint detection
* 📷 Image-based complaint analysis
* 📊 Advanced analytics
* 🗺️ Campus issue heatmaps
* 💬 AI chatbot for students
* 🔐 Role-based authentication
* 📈 Complaint resolution analytics

---

## 🏆 Hackathon Value

CampusPulse AI focuses on a real-world problem faced by educational institutions.

### Impact

* Improves student experience
* Reduces administrative workload
* Makes complaints transparent
* Helps prioritize critical problems
* Provides data-driven insights
* Creates a faster complaint-resolution system

---

## 👨‍💻 Team

**CampusPulse AI**

Built for a hackathon with the goal of creating a smarter, faster, and more transparent campus experience.

---

## 📜 License

This project is created for educational and hackathon purposes.
