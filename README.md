# Golf Charity Platform 🏌️⛳

A production-ready, subscription-based golf charity platform built with NestJS and React.

## Features
- **Authentication**: JWT-based login/register with Admin roles.
- **Charity Integration**: Support your favorite golf charities with 10% of your membership fee.
- **Monthly Draw**: Automated prize pool distribution and rolling score submission.
- **Interactive UI**: High-fidelity golf animations and modern typography.

---

## Deployment Instructions

### 1. Frontend (Vercel)
1. In the Vercel Dashboard, click **New Project** and import this repository.
2. In **Project Settings**, set the **Root Directory** to `frontend`.
3. Add the following **Environment Variables**:
   - `VITE_API_BASE_URL`: The URL of your deployed backend (e.g., `https://my-golf-backend.vercel.app`).
4. Click **Deploy**.

### 2. Backend (Render / Heroku / Railway)
*While NestJS can run on Vercel, a dedicated Node.js host is recommended for stability.*
1. Create a new Web Service and link this repository.
2. Set the **Root Directory** to `backend`.
3. Set the **Build Command** to `npm install && npm run build`.
4. Set the **Start Command** to `npm run start:prod`.
5. Add the following **Environment Variables**:
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random string for authentication.
   - `PORT`: Usually 3000 or provided by the host.

---

## Local Development
1. Clone the repository.
2. Run `npm install` in both `frontend` and `backend`.
3. Create a `.env` in the `backend` folder with `MONGO_URI` and `JWT_SECRET`.
4. Run `npm run dev` in `frontend` and `npm run start:dev` in `backend`.
