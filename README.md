# EulerPic – Google Photos Clone

A modern, full-stack Google Photos clone built with Next.js, Tailwind CSS, Prisma (SQLite), NextAuth.js, and AWS S3.

## Features
- User authentication (username/password, stored in SQLite)
- Media upload (photos/videos) directly to S3 via presigned URLs
- User-specific S3 folders: `users/{userId}/filename.jpg`
- Gallery grid with lazy loading, custom video player
- Clean, responsive UI (Google Photos style)

## Tech Stack
- **Frontend:** Next.js, Tailwind CSS
- **Auth:** NextAuth.js (credentials provider)
- **Database:** SQLite (via Prisma)
- **Storage:** AWS S3 (SDK v3)

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Copy `.env.local` and fill in your AWS and NextAuth secrets:
```
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET=your_s3_bucket_name
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL="file:./dev.db"
```

### 3. Set up the database
```bash
npx prisma migrate dev --name init
```

### 4. Create your first user
You can use the Prisma Studio to add a user (password must be bcrypt-hashed):
```bash
npx prisma studio
```
Or use a script to hash and insert a user.

### 5. Run the app
```bash
npm run dev
```

Visit [http://localhost:3000/login](http://localhost:3000/login) to sign in.

## File Structure
```
/app
  /api/auth/[...nextauth]/route.js  # NextAuth config
  /api/upload-url/route.js          # Presigned S3 upload URL
  /gallery/page.js                  # Main gallery view
  /login/page.js                    # Login page
  /layout.js                        # Root layout
/components
  UploadButton.js                   # File upload component
  VideoPlayer.js                    # Custom video player
/lib
  db.js                             # SQLite connection
  s3.js                             # S3 client helpers
/prisma
  schema.prisma                     # Prisma schema
```

## Notes
- Only S3 is used for storage (no CloudFront/Lambda)
- All async operations use async/await and proper error handling
- UI is fully responsive and modern 