# MERN Stack Template

A complete full-stack web application template built with the MERN stack (MongoDB, Express, React, Node.js) with user authentication, ready for rapid development.

## Features

- 🚀 **Modern Stack**: MongoDB, Express.js, React, Node.js
- 🔐 **Authentication**: JWT-based authentication with password hashing
- 📱 **Responsive Design**: Mobile-first responsive UI
- ⚡ **Hot Reload**: Development servers with hot module replacement
- 🛡️ **Security**: CORS enabled, password hashing with bcrypt
- 🎨 **Clean UI**: Modern, clean interface with custom CSS
- 📊 **Dashboard**: User dashboard with profile and statistics
- 🔄 **State Management**: React Context for authentication state

## Project Structure

```
mern-template/
├── backend/
│   ├── config/
│   │   └── db.js           # MongoDB connection configuration
│   ├── controllers/
│   │   └── authController.js # Authentication logic
│   ├── middleware/
│   │   └── auth.js         # JWT authentication middleware
│   ├── models/
│   │   └── User.js         # User mongoose model
│   ├── routes/
│   │   └── auth.js         # Authentication routes
│   ├── server.js           # Express server setup
│   ├── .env.example        # Environment variables template
│   └── package.json        # Backend dependencies
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   └── Navbar.css
│   │   ├── context/
│   │   │   └── AuthContext.js # React context for auth
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Auth.css
│   │   │   ├── Home.css
│   │   │   └── Dashboard.css
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── package.json        # Frontend dependencies
└── package.json            # Root package.json for convenience scripts
```

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB (local installation or MongoDB Atlas)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mern-template
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   cd backend
   cp .env.example .env
   ```

4. **Configure your environment variables**

   Edit `backend/.env` with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/mern-template
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

   - For production, use a secure, randomly generated JWT secret
   - You can use MongoDB Atlas for cloud database hosting

## Running the Application

### Development Mode

Start both frontend and backend servers concurrently:

```bash
npm run dev
```

This will start:
- Backend server at `http://localhost:5000`
- Frontend server at `http://localhost:3000`

### Individual Servers

- **Backend only**: `npm run server`
- **Frontend only**: `npm run client`

### Production Build

```bash
npm run build
```

This creates an optimized production build of the React app in the `frontend/build` directory.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Example Request

**Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Login User:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## Available Scripts

- `npm run dev` - Start both servers in development mode
- `npm run server` - Start backend server only
- `npm run client` - Start frontend server only
- `npm run build` - Build frontend for production
- `npm run install-all` - Install dependencies for root, backend, and frontend

## Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **cors** - Cross-Origin Resource Sharing
- **dotenv** - Environment variable management

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests
- **CSS3** - Styling with modern CSS features

## Development

### Adding New Features

1. **Backend**:
   - Add new models in `backend/models/`
   - Create controllers in `backend/controllers/`
   - Define routes in `backend/routes/`
   - Import and use routes in `backend/server.js`

2. **Frontend**:
   - Create components in `frontend/src/components/`
   - Add pages in `frontend/src/pages/`
   - Update routing in `frontend/src/App.js`

### Environment Variables

The backend uses the following environment variables:

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token signing

## Security Considerations

- Always use strong, randomly generated JWT secrets in production
- Use HTTPS in production
- Validate and sanitize all user inputs
- Implement rate limiting for authentication endpoints
- Keep dependencies updated

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you have any questions or issues, please open an issue on the GitHub repository.