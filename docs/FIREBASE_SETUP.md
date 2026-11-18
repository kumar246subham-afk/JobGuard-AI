# Firebase Authentication & Firestore Setup Guide

JobGuard AI integrates Firebase Authentication (Email/Password & Google Sign-In) and Cloud Firestore for persistent user scan history.

> **Local & Offline Resilience:** If you do not configure Firebase immediately, JobGuard AI automatically functions in **Guest / Local Storage Mode**, allowing complete end-to-end testing without cloud dependencies.

---

## 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and name it `jobguard-ai` (or any custom name).
3. Disable or enable Google Analytics according to your preference and create the project.

---

## 2. Enable Authentication Providers
1. In the Firebase Console, go to **Build** -> **Authentication**.
2. Click **Get Started**.
3. Under **Sign-in method**, enable:
   - **Email/Password**
   - **Google** (optional)

---

## 3. Enable Cloud Firestore
1. Under **Build**, select **Firestore Database**.
2. Click **Create Database**.
3. Choose a geographic region close to your users.
4. Start in **Production mode** (we provide the exact security rules below).

---

## 4. Register Web Application & Copy Keys
1. In **Project Overview**, click the **Web icon (`</>`)** to add an app.
2. Name it `JobGuard Web`.
3. Copy the configuration object keys into your local `frontend/.env` file:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:...
```

---

## 5. Deploy Firestore Security Rules
In Firebase Console -> **Firestore Database** -> **Rules**, paste the rules below and click **Publish**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access and modify their own scan history
    match /users/{userId}/scans/{scanId} {
      allow read, write, delete: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

These rules guarantee that students can only read and delete their own job analysis scans.
