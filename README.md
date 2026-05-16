# Fix My Ward – Civic Issue Reporting Platform 🏙️

**Fix My Ward** is a full-stack MERN application designed to empower citizens to report and track local civic issues (potholes, water leaks, garbage, etc.) in real-time. By bridging the gap between citizens and municipal authorities, it helps build cleaner and safer neighborhoods.

---

## 🚀 Features

### **Citizen Module**
- **Smart Reporting**: Report issues with titles, descriptions, and categories.
- **Location-Aware**: Automatic GPS detection and interactive map picker with reverse geocoding (auto-fills addresses).
- **Visual Evidence**: Support for multiple image uploads (Base64) to provide clear proof.
- **Duplicate Prevention**: Client-side Haversine logic detects similar issues nearby (within 300m) to avoid redundant reports.
- **Interactive Map**: View issues on a marker map or a dynamic heatmap to identify problem hotspots.
- **Seamless Auth**: Persistent session handling allows returning users to skip login/registration screens.

---

## 🛠️ Tech Stack

### **Frontend**
- **React (Vite)**: Fast and modern UI development.
- **Tailwind CSS**: Premium, responsive dark-themed design.
- **Leaflet.js**: Interactive maps and geolocation.
- **Axios**: API communication with global error interceptors.

### **Backend**
- **Node.js & Express.js**: Robust server-side logic.
- **MongoDB & Mongoose**: Scalable NoSQL database with geospatial indexing.
- **JWT (JSON Web Tokens)**: Secure user authentication and session management.

---

## 🛠️ Installation & Setup

### **1. Clone the repository**
```bash
git clone https://github.com/your-username/fix-my-ward.git
cd fix-my-ward
```

### **2. Backend Setup**
```bash
cd backend
npm install
# Create a .env file and add your MONGO_URI and JWT_SECRET
npm run dev
```

### **3. Frontend Setup**
```bash
cd ../frontend
npm install
npm run dev
```

---

## 📸 Screen Previews
*(Add screenshots here after pushing to GitHub)*

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the MIT License.
