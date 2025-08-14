# WhatsApp Web Simulator

**Demo:** [Live Application](https://vercel.com/nihhhs-projects/whatsapp-web-simulator-frontend)

---

## What's This All About?

I've developed a WhatsApp Web simulator from the ground up. This is a complete webhook-powered messaging interface that replicates the WhatsApp Web experience with pixel-perfect accuracy. Think of it as WhatsApp Web's twin that processes real webhook data and manages conversations just like the original.

```
┌─────────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│   Webhook Payload   │───▶│  Node.js Backend     │───▶│  React Frontend     │
│   (JSON Messages)   │    │  (MongoDB + APIs)    │    │  (WhatsApp UI)      │
└─────────────────────┘    └──────────────────────┘    └─────────────────────┘
```

## The Stack That Makes It Tick

**Backend :**
- Node.js + Express (because JavaScript everywhere)
- MongoDB (where messages go to live forever)
- Webhook processing (turning JSON into conversations)

**Frontend :**
- React (hooks, state, and all that jazz)
- CSS that actually looks good (shocking, I know)
- Responsive design (works on your phone, trust me)

---

## Getting Your Hands Dirty

#### Step 1: Clone This Beauty
```bash
git clone <your-repo-url>
cd whatsapp-web-clone
# Now you're in the danger zone
```

#### Step 2: Backend Setup (The Serious Stuff)
```bash
cd whatsapp-web-backend
npm install
# Time to grab a coffee ☕
```

Create your `.env` file (don't skip this, seriously):
```env
MONGODB_URI=mongodb+srv://your-username:password@cluster.mongodb.net/whatsapp
PORT=5000
NODE_ENV=development
# Add your secrets here, but not to GitHub 😉
```

#### Step 3: Frontend Setup (The Pretty Stuff)
```bash
cd ../whatsapp-web-frontend
npm install
# Another coffee break opportunity
```

#### Step 4: Feed It Some Data
```bash
cd ../whatsapp-web-backend
node process-webhooks.js
# This processes all the sample webhook data
# Magic happens here ✨
```

#### Step 5: Launch Sequence
**Terminal 1 (Backend):**
```bash
cd whatsapp-web-backend && npm start
# Backend running on http://localhost:5000
```

**Terminal 2 (Frontend):**
```bash
cd whatsapp-web-frontend && npm run dev
# Frontend running on http://localhost:5173
```

---

## What You're Looking At

#### The Sidebar (`ChatSidebar.jsx`)
That familiar left panel where all your conversations live. Click on any chat and boom – you're in business.

#### The Chat Window (`ChatWindow.jsx`)
The main event. Messages, timestamps, those satisfying blue checkmarks when messages are read. It's all here.

#### The Welcome Screen (`WelcomeScreen.jsx`)
Because even WhatsApp needs a landing page.

---

## API Endpoints (The Technical Bits)

| What It Does | How To Call It | What You Get |
|--------------|----------------|--------------|
| Get all conversations | `GET /api/conversations` | Your entire social life |
| Get specific conversation | `GET /api/conversations/:waId/messages` | Just one conversation thread |
| Send a message | `POST /api/conversations/:waId/messages` | Instant gratification |
| Health check | `GET /api/health` | System status |



---

## Database Schema (MongoDB Magic)

Every message gets stored with this comprehensive structure:
```javascript
{
  messageId: "unique_identifier_123",           // Unique message ID
  wa_id: "1234567890",                         // WhatsApp ID for grouping
  text: "The actual message content",          // Message text
  messageType: "text",                         // text | image | audio | video | document
  fromNumber: "1234567890",                    // Sender's phone number
  toNumber: "0987654321",                      // Recipient's phone number
  contactName: "Person's name",                // Display name
  timestamp: 1625097600,                       // Unix timestamp
  isOutgoing: false,                           // true if sent by business
  status: "delivered",                         // sent | delivered | read | failed | received
  createdAt: "2024-01-01T00:00:00Z",          // Auto-generated
  updatedAt: "2024-01-01T00:00:00Z"           // Auto-generated
}
```

**Performance Optimizations:**
- Compound indexes on `wa_id + timestamp` for fast conversation loading
- Indexes on `fromNumber`, `toNumber`, and `isOutgoing` for efficient queries
- Messages stored in `processed_messages` collection for webhook compatibility

---

## The Webhook Processor

This little script in `process-webhooks.js` is where the magic happens:

1. **Reads webhook JSON files** (sample data included)
2. **Processes incoming messages** (stores them in MongoDB)
3. **Handles status updates** (those checkmarks you love)
4. **Groups conversations** (because nobody wants chaos)

---

## Project Structure (For The Organized Minds)

```
whatsapp-web-frontend/
├── src/components/     # React components that make it pretty
├── src/assets/        # Images, icons, etc.
└── src/App.jsx        # Where it all comes together

whatsapp-web-backend/
├── controllers/       # Business logic lives here
├── models/           # MongoDB schemas
├── routes/           # API endpoint definitions
├── config/           # Database connections
└── webhook-data/     # Sample webhook payloads
```

---

## Deployment (Making It Live)

### Vercel (Recommended)
1. Push to GitHub
2. Connect Vercel to your repo
3. Add environment variables
4. Deploy
5. Share with friends

### Environment Variables for Production
```env
MONGODB_URI=your-production-mongodb-uri
NODE_ENV=production
```

---

## Mobile Responsiveness

Yes, it works on mobile. Yes, I tested it. No, I didn't just shrink the browser window and call it a day.

- **Desktop**: Classic sidebar + chat layout
- **Mobile**: Full-screen chat with proper navigation
- **Tablet**: Adapts like a chameleon

---

## Things That Actually Work

- ✅ Real-time message display
- ✅ Message status indicators
- ✅ Contact grouping
- ✅ Responsive design
- ✅ Message sending (stored locally)
- ✅ Webhook processing
- ✅ MongoDB integration

---


## The Fine Print

This is a demo project. No real WhatsApp messages were harmed in the making of this application. All webhook data is simulated. Please don't try to text your ex through this app – it won't work.

---

## Credits Where Credits Are Due

Built with determination, caffeine, and a healthy dose of "how hard could it be?"

**Tech Stack:** React, Node.js, MongoDB, Express, and lots of patience

---

*If this README made you smile even once, consider starring the repo. It's free and makes developers happy.* ⭐
