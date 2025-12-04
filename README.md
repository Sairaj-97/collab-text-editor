# 📝 Real-Time Collaborative Text Editor

A full-stack **real-time collaborative text editor** that allows multiple users to create accounts, manage documents, and edit them simultaneously in real time. Think of it as a simplified, student-friendly version of Google Docs built with **Java Spring Boot**, **MongoDB**, and **React**.

![Java](https://img.shields.io/badge/Java-17+-orange?style=flat-square&logo=java)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen?style=flat-square&logo=spring)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-5.x-green?style=flat-square&logo=mongodb)

---

## 🚀 Features

### 🔐 User Authentication
- User registration with username, email, and password
- Secure login with BCrypt password hashing
- Session management with localStorage

### 📄 Document Management
- Create new documents with auto-generated short IDs (e.g., `7K7JX2`)
- Join existing documents using the document ID
- Store document metadata including title, content, owner, and collaborators
- Automatic timestamps for creation and last modification

### ⚡ Real-Time Collaborative Editing
- Multiple users can edit the same document simultaneously
- Changes synced in near real-time using **WebSockets (SockJS + STOMP)**
- Automatic content persistence to MongoDB (auto-save every ~1 second)
- Last-write-wins conflict resolution strategy

### ✍️ Rich Editing Experience
- **Markdown editor** powered by `@uiw/react-md-editor`
- Support for headings, bold, italics, lists, code blocks, and more
- Live preview of formatted content

### 👥 Active Users Indicator
- Real-time display of users currently active in the document
- See who's collaborating with you: `Active now: user1, user2`

---

## 🧱 Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Java 17+** | Programming language |
| **Spring Boot** | Application framework |
| **Spring Web** | REST API endpoints |
| **Spring Security** | Authentication and authorization |
| **Spring Data MongoDB** | Database integration |
| **Spring WebSocket** | Real-time communication |
| **SockJS + STOMP** | WebSocket fallback and messaging protocol |
| **Maven** | Build and dependency management |
| **MongoDB** | NoSQL database for document storage |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **Vite** | Build tool and dev server |
| **React Router** | Client-side routing |
| **Axios** | HTTP client for API calls |
| **@uiw/react-md-editor** | Markdown editor component |

---

## 🗂️ Project Structure

```
collab_text_editor/
│
├── backend/                    # Spring Boot application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/example/collabtexteditor/
│   │   │   │       ├── config/          # Configuration classes
│   │   │   │       ├── controller/      # REST & WebSocket controllers
│   │   │   │       ├── model/           # Entity classes
│   │   │   │       ├── repository/      # MongoDB repositories
│   │   │   │       ├── service/         # Business logic
│   │   │   │       └── CollabTextEditorApplication.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   └── pom.xml
│
└── frontend/                   # React + Vite application
    ├── src/
    │   ├── components/         # React components
    │   ├── pages/              # Page components
    │   ├── services/           # API service layer
    │   ├── App.jsx             # Main app component
    │   └── main.jsx            # Entry point
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## ⚙️ Prerequisites

Before running this project, ensure you have the following installed:

- ☕ **Java 17+** ([Download](https://adoptium.net/))
- 📦 **Maven 3.6+** ([Download](https://maven.apache.org/download.cgi))
- 🟢 **Node.js 18+** and **npm** ([Download](https://nodejs.org/))
- 🍃 **MongoDB 5.x+** ([Download](https://www.mongodb.com/try/download/community))

---

## 🛠️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Sairaj-97/collab-text-editor.git
cd collab-text-editor
```

### 2️⃣ Start MongoDB

Ensure MongoDB is running locally on the default port `27017`.

**On macOS/Linux:**
```bash
mongod
```

**On Windows:**
```bash
"C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe"
```

Or use **MongoDB Compass** to start your local MongoDB instance.

The application will automatically create a database named `collab_text_editor`.

### 3️⃣ Configure Backend (Optional)

The default configuration should work out of the box. If you need to customize, edit `backend/src/main/resources/application.properties`:

```properties
spring.data.mongodb.uri=mongodb://localhost:27017/collab_text_editor
spring.data.mongodb.database=collab_text_editor
server.port=8080

# CORS Configuration
spring.web.cors.allowed-origins=http://localhost:5173
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true
```

### 4️⃣ Run the Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The backend server will start on: **http://localhost:8080**

You should see output indicating:
```
Started CollabTextEditorApplication in X.XXX seconds
```

### 5️⃣ Install Frontend Dependencies

Open a new terminal window:

```bash
cd frontend
npm install
```

### 6️⃣ Run the Frontend

```bash
npm run dev
```

The frontend dev server will start on: **http://localhost:5173**

---

## 🎯 Usage Guide

### Getting Started

1. **Open the application** in your browser: `http://localhost:5173`

2. **Register a new account**
   - Click "Register" and provide username, email, and password
   - Click "Sign Up"

3. **Login**
   - Enter your credentials and click "Login"

4. **Create a document**
   - Click "Create New Document"
   - Give it a title
   - Note the generated **Document ID** (e.g., `7K7JX2`)

5. **Start editing**
   - Type in the Markdown editor
   - See the live preview
   - Changes are auto-saved every second

### Collaborating in Real-Time

1. **Share the Document ID** with another user

2. **Open in multiple windows/accounts**
   - Open the same document ID in a different browser or incognito window
   - Or share the ID with a friend

3. **Edit simultaneously**
   - Type in one window
   - Watch changes appear instantly in the other window
   - See active users in the "Active now" section

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login with credentials |

### Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/documents` | Create a new document |
| `GET` | `/api/documents/{docId}` | Get document by ID |
| `PUT` | `/api/documents/{docId}` | Update document content/title |
| `GET` | `/api/documents/user/{userId}` | Get all documents for a user |

### WebSocket

| Endpoint | Description |
|----------|-------------|
| `/ws` | WebSocket connection endpoint |
| `/topic/documents/{docId}` | Subscribe to document updates |
| `/app/documents/{docId}/edit` | Publish document edits |

---

## 🏗️ Architecture Overview

### Backend Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ HTTP/WebSocket
       │
┌──────▼──────────────────────────┐
│     Spring Boot Backend         │
│  ┌──────────────────────────┐   │
│  │   REST Controllers       │   │
│  │  - AuthController        │   │
│  │  - DocumentController    │   │
│  └───────────┬──────────────┘   │
│              │                   │
│  ┌───────────▼──────────────┐   │
│  │   Service Layer          │   │
│  │  - UserService           │   │
│  │  - DocumentService       │   │
│  └───────────┬──────────────┘   │
│              │                   │
│  ┌───────────▼──────────────┐   │
│  │   Repository Layer       │   │
│  │  - MongoDB Repositories  │   │
│  └───────────┬──────────────┘   │
└──────────────┼──────────────────┘
               │
        ┌──────▼──────┐
        │   MongoDB   │
        └─────────────┘
```

### Real-Time Sync Flow

```
User A types          User B receives
    │                      ▲
    │                      │
    ▼                      │
┌────────┐            ┌────────┐
│Browser │──WebSocket─│Backend │
└────────┘            └───┬────┘
                          │
                          │ Save to DB
                          ▼
                    ┌──────────┐
                    │ MongoDB  │
                    └──────────┘
```

---

## 🧪 Testing the Application

### Manual Testing Checklist

- [ ] User registration works
- [ ] User login works with correct credentials
- [ ] Cannot login with incorrect password
- [ ] Can create a new document
- [ ] Document ID is generated and displayed
- [ ] Can open existing document by ID
- [ ] Auto-save works (changes persist after refresh)
- [ ] Real-time sync works across multiple windows
- [ ] Active users list updates correctly
- [ ] Markdown rendering works (headings, bold, lists, etc.)

### Testing Real-Time Collaboration

1. Open two browser windows side-by-side
2. Login with two different accounts
3. Open the same document ID in both windows
4. Type in one window and verify changes appear in the other
5. Check that both usernames appear in "Active now"

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** MongoDB connection failed
```
Solution: Ensure MongoDB is running on localhost:27017
```

**Problem:** Port 8080 already in use
```
Solution: Change the port in application.properties:
server.port=8081
```

**Problem:** CORS errors in browser console
```
Solution: Verify CORS configuration in WebSocketConfig and SecurityConfig
```

### Frontend Issues

**Problem:** Cannot connect to backend
```
Solution: Verify backend is running on http://localhost:8080
Update API_BASE_URL in frontend if needed
```

**Problem:** WebSocket connection failed
```
Solution: Check that /ws endpoint is accessible
Verify SockJS and STOMP configuration
```

**Problem:** Changes not syncing
```
Solution: Check browser console for WebSocket errors
Verify both users are connected to the same document ID
```

---

## 🚀 Deployment

### Backend Deployment

**Option 1: JAR File**
```bash
cd backend
mvn clean package
java -jar target/collab-text-editor-0.0.1-SNAPSHOT.jar
```

**Option 2: Docker**
```dockerfile
FROM openjdk:17-jdk-slim
COPY target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

### Frontend Deployment

```bash
cd frontend
npm run build
# Deploy the 'dist' folder to your hosting service
```

### Recommended Hosting Options

- **Backend:** Railway, Render, Heroku, AWS EC2
- **Frontend:** Vercel, Netlify, GitHub Pages
- **Database:** MongoDB Atlas (cloud MongoDB)

---

## 🔮 Future Enhancements

- [ ] **JWT Authentication** for secure token-based auth
- [ ] **Role-based Access Control** (owner, editor, viewer)
- [ ] **Document Permissions** (public, private, shared with specific users)
- [ ] **Version History** with ability to restore previous versions
- [ ] **Conflict Resolution** using Operational Transformation (OT) or CRDTs
- [ ] **Colored Cursors** showing where each user is typing
- [ ] **Comments & Annotations** on specific text sections
- [ ] **Export to PDF/DOCX**
- [ ] **Rich Text Editor** (alternative to Markdown)
- [ ] **File Attachments** and image uploads
- [ ] **Real-time Notifications**
- [ ] **Mobile App** (React Native)

---

## 📚 Learning Resources

### Spring Boot
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring WebSocket Guide](https://spring.io/guides/gs/messaging-stomp-websocket/)

### React
- [React Documentation](https://react.dev/)
- [React Router](https://reactrouter.com/)

### MongoDB
- [MongoDB Manual](https://www.mongodb.com/docs/manual/)
- [Spring Data MongoDB](https://spring.io/projects/spring-data-mongodb)

### WebSockets
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [STOMP Protocol](https://stomp.github.io/)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- Spring Boot team for the excellent framework
- React team for the powerful UI library
- MongoDB for the flexible NoSQL database
- All open-source contributors

---

## 📞 Support

If you have any questions or run into issues:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Open an issue on GitHub
3. Contact the maintainer

---

**Happy Coding! 🎉**
