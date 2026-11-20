# VolunteerBit Backend

## Setup
1. Install Node.js and MongoDB (or use a free MongoDB Atlas URI)
2. `npm install`
3. Copy `.env.example` to `.env` and fill in values
4. `npm run seed`  (adds demo users and tasks)
5. `npm run dev`   (API on http://localhost:5000)

Demo logins (password `password123`): volunteer@demo.com, ngo@demo.com, ngo2@demo.com

## API
POST /api/auth/register | /login, GET /api/auth/me
GET /api/tasks (filters: category, mode, maxDuration, search)
GET /api/tasks/recommended (volunteer), GET /api/tasks/mine (ngo), GET /api/tasks/:id
POST /api/tasks (ngo), POST /api/tasks/:id/apply (volunteer)
GET /api/applications/mine (volunteer), GET /api/applications/ngo (ngo)
PATCH /api/applications/:id  { status: accepted|rejected }
PATCH /api/applications/:id/complete
GET /api/certificate/:applicationId  (PDF)
GET /api/users/me/stats
Send the token as: Authorization: Bearer <token>
