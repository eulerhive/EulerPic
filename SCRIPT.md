🎯 Phased Prompt for Cursor AI: Cloud Photo and Video Storage Application
This project is a cloud-based photo and video storage application inspired by Google Photos, built using JavaScript (not TypeScript). The development is split into five phases to ensure a structured, step-by-step approach. Each phase includes specific requirements, expected outputs, and a clear project structure. Follow the instructions for each phase sequentially, building upon the previous phase’s work.

🟢 Tech Stack (Applies to All Phases)

Frontend Framework: Next.js 14 (use the /src directory structure).
Backend: Node.js (for custom API routes and server-side logic).
Database: Prisma ORM with SQLite (file-based database for prototyping).
Object Storage: Amazon S3 for storing media files and thumbnails.
UI Component Library: shadcn/ui for consistent and modern UI components.
File Upload Library: Uppy with @uppy/thumbnail-generator for image thumbnail generation (no thumbnails for videos).
Language: JavaScript (ES modules, no TypeScript).

Use the latest stable versions of all dependencies. Assume AWS credentials are provided via environment variables (e.g., .env.local).

🟢 Phase 1: Project Setup and Authentication
Objective
Set up the Next.js project, configure Prisma with SQLite, and implement user authentication.
Steps

Initialize Next.js Project:

Create a Next.js 14 project with the /src directory structure.
Configure it to use JavaScript (no TypeScript).
Set up shadcn/ui for UI components (e.g., buttons, forms).
Install Tailwind CSS for styling.


Set Up Prisma with SQLite:

Install Prisma and configure it to use SQLite as the database.
Create a schema.prisma file with a User model:model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
}




Implement Authentication:

Use NextAuth.js (or a similar library) for email/password-based authentication.
Create API routes under /src/app/api/auth:
/signup/route.js: Handle user registration (store email and hashed password in Prisma).
/login/route.js: Handle user login and session creation.


Create a simple UI with shadcn/ui components for signup and login forms.
Ensure secure session management (e.g., store session data securely).


Environment Variables:

Set up a .env.local file for AWS credentials and database URL.
Example:DATABASE_URL="file:./dev.db"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="your-region"
AWS_S3_BUCKET="your-bucket-name"





Expected Output

A fully configured Next.js project with JavaScript.
Prisma setup with SQLite and initial User model.
API routes for signup (/api/auth/signup) and login (/api/auth/login).
Basic UI with shadcn/ui for signup and login pages.
A README.md with setup instructions, including how to install dependencies, set up environment variables, and run the app locally.

Project Structure
/src
  /app
    /api
      /auth
        signup/route.js
        login/route.js
    /components
      LoginForm.js
      SignupForm.js
    /styles
      globals.css
/prisma
  schema.prisma
  migrations/
.env.local
README.md


🟢 Phase 2: Media Upload and S3 Integration
Objective
Implement file uploads using Uppy, store files in S3, and save metadata in Prisma.
Steps

Set Up Uppy for Uploads:

Install Uppy and @uppy/thumbnail-generator.
Create an upload component (UploadButton.js) with drag-and-drop or file input.
Configure Uppy to handle multiple file uploads in parallel.
Display individual progress bars for each file, updating in real-time using Uppy’s progress events.


Configure S3 Integration:

Create a utility file (/src/lib/s3.js) to handle S3 operations using the AWS SDK.
Generate presigned URLs for secure uploads to S3.
Store files in S3 under s3://bucket/user-<userId>/originals/<filename>รม



System: It looks like the artifact content was cut off. I’ll complete the prompt for Phase 2 and continue with the remaining phases, ensuring all requirements are met, including the use of Uppy for uploads with individual progress indicators, S3 integration, and the Prisma schema. I’ll maintain the same artifact ID as requested, use JavaScript, and follow the phased approach.


🎯 Phased Prompt for Cursor AI: Cloud Photo and Video Storage Application
This project is a cloud-based photo and video storage application inspired by Google Photos, built using JavaScript (not TypeScript). The development is split into five phases to ensure a structured, step-by-step approach. Each phase includes specific requirements, expected outputs, and a clear project structure. Follow the instructions for each phase sequentially, building upon the previous phase’s work.

🟢 Tech Stack (Applies to All Phases)

Frontend Framework: Next.js 14 (use the /src directory structure).
Backend: Node.js (for custom API routes and server-side logic).
Database: Prisma ORM with SQLite (file-based database for prototyping).
Object Storage: Amazon S3 for storing media files and thumbnails.
UI Component Library: shadcn/ui for consistent and modern UI components.
File Upload Library: Uppy with @uppy/thumbnail-generator for image thumbnail generation (no thumbnails for videos).
Language: JavaScript (ES modules, no TypeScript).

Use the latest stable versions of all dependencies. Assume AWS credentials are provided via environment variables (e.g., .env.local).

🟢 Phase 1: Project Setup and Authentication
Objective
Set up the Next.js project, configure Prisma with SQLite, and implement user authentication.
Steps

Initialize Next.js Project:
Create a Next.js 14 project with the /src directory structure.
Configure it to use JavaScript (no TypeScript).
Install Tailwind CSS and shadcn/ui for UI components (e.g., buttons, forms).


Set Up Prisma with SQLite:
Install Prisma and configure it to use SQLite.
Create a schema.prisma file with a User model:model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
}




Implement Authentication:
Use NextAuth.js for email/password-based authentication.
Create API routes under /src/app/api/auth:
/signup/route.js: Handle user registration (store email and hashed password in Prisma).
/login/route.js: Handle user login and session creation.


Create UI components (LoginForm.js, SignupForm.js) using shadcn/ui for signup and login forms.
Ensure secure session management.


Environment Variables:
Set up .env.local for AWS credentials and database URL:DATABASE_URL="file:./dev.db"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="your-region"
AWS_S3_BUCKET="your-bucket-name"





Expected Output

A Next.js project configured with JavaScript.
Prisma setup with SQLite and User model.
API routes for signup (/api/auth/signup) and login (/api/auth/login).
UI with shadcn/ui for signup and login pages.
README.md with setup instructions (install dependencies, set up environment variables, run locally).

Project Structure
/src
  /app
    /api
      /auth
        signup/route.js
        login/route.js
    /components
      LoginForm.js
      SignupForm.js
    /styles
      globals.css
/prisma
  schema.prisma
  migrations/
.env.local
README.md


🟢 Phase 2: Media Upload and S3 Integration
Objective
Implement file uploads using Uppy, store files in S3, and save metadata in Prisma.
Steps

Update Prisma Schema:

Add a Media model to schema.prisma:model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
}

model Media {
  id           String   @id @default(cuid())
  userId       String
  filename     String
  s3Key        String
  mimeType     String
  size         Int
  width        Int?
  height       Int?
  createdAt    DateTime @default(now())
  takenAt      DateTime?
  isDeleted    Boolean  @default(false)
  isFavorite   Boolean  @default(false)
  thumbnailKey String?
}


Run Prisma migrations to update the database.


Set Up Uppy for Uploads:

Install Uppy and @uppy/thumbnail-generator.
Create an upload component (UploadButton.js) with drag-and-drop or file input.
Configure Uppy to handle multiple file uploads in parallel.
Display individual progress bars for each file, updating in real-time using Uppy’s progress events (e.g., on('upload-progress', ...)).


Configure S3 Integration:

Create /src/lib/s3.js to handle S3 operations using the AWS SDK.
Generate presigned URLs for secure uploads to S3.
Store files in S3 at s3://bucket/user-<userId>/originals/<filename>.
For images, generate thumbnails using @uppy/thumbnail-generator and store at s3://bucket/user-<userId>/thumbnails/<filename>.
For videos, do not generate thumbnails; use the original video for preview.
Extract and store metadata (e.g., EXIF data for images using a library like exif-js, MIME type, file size, dimensions for images, and takenAt timestamp) in Prisma.


Create Upload API Route:

Add /src/app/api/upload/route.js to:
Validate user authentication.
Handle file uploads to S3 using presigned URLs.
Save metadata to Prisma after successful upload.
Implement retry logic (3 attempts with exponential backoff) for failed uploads.





Expected Output

Updated Prisma schema with Media model and migrations.
Uppy-based upload component (UploadButton.js) with individual progress bars.
S3 utility (s3.js) for upload and presigned URL generation.
API route (/api/upload) for handling uploads and metadata.
Updated README.md with instructions for configuring Uppy and S3.

Project Structure
/src
  /app
    /api
      /auth
        signup/route.js
        login/route.js
      /upload
        route.js
    /components
      LoginForm.js
      SignupForm.js
      UploadButton.js
    /lib
      s3.js
      prisma.js
      uppy.js
    /styles
      globals.css
/prisma
  schema.prisma
  migrations/
.env.local
README.md


🟢 Phase 3: Media Browsing and UI
Objective
Implement a responsive media grid for browsing, with date grouping and lazy-loading.
Steps

Create API Route for Media Listing:

Add /src/app/api/media/route.js to:
List media for the authenticated user (filter by userId, exclude isDeleted: true).
Return media metadata (id, filename, s3Key, thumbnailKey, mimeType, takenAt, createdAt).
Support sorting by takenAt or createdAt.




Build Media Grid UI:

Create MediaGrid.js and MediaCard.js using shadcn/ui components.
Display media in a 4-column responsive grid (adjust for mobile).
Group media by date (takenAt if available, else createdAt) with sticky headers (e.g., “January 2025”).
Implement lazy-loading for thumbnails (images) and video previews using an Intersection Observer or a library like react-lazy-load.
Use presigned URLs to load media securely from S3.


Add Preview Modal:

Create PreviewModal.js using shadcn/ui for full-resolution image display or video playback.
Include buttons for download (via presigned URL) and delete (mark isDeleted: true in Prisma).


Implement Infinite Scroll:

Add infinite scroll to MediaGrid.js for efficient media loading (fetch more items as the user scrolls).
Use query parameters in /api/media to handle pagination (e.g., offset and limit).



Expected Output

API route (/api/media) for listing user media.
UI components (MediaGrid.js, MediaCard.js, PreviewModal.js) for browsing and previewing media.
Infinite scroll with lazy-loaded media and date grouping.
Updated README.md with instructions for testing the media grid.

Project Structure
/src
  /app
    /api
      /auth
        signup/route.js
        login/route.js
      /upload
        route.js
      /media
        route.js
    /components
      LoginForm.js
      SignupForm.js
      UploadButton.js
      MediaGrid.js
      MediaCard.js
      PreviewModal.js
    /lib
      s3.js
      prisma.js
      uppy.js
    /styles
      globals.css
/prisma
  schema.prisma
  migrations/
.env.local
README.md


🟢 Phase 4: Bulk Actions and Deletion
Objective
Add multi-select mode for bulk deletion and download, and implement soft deletion.
Steps

Implement Multi-Select Mode:

Add a multi-select toggle to MediaGrid.js (e.g., a checkbox per MediaCard.js).
Track selected media IDs in state.
Add buttons for bulk delete and bulk download using shadcn/ui.


Create Bulk Action API Routes:

Add /src/app/api/media/[id]/route.js for single media deletion (set isDeleted: true in Prisma).
Add /src/app/api/media/bulk/route.js for:
Bulk deletion: Update isDeleted: true for selected media IDs.
Bulk download: Generate a ZIP file of selected media using presigned URLs (e.g., with archiver library).




Implement Soft Delete:

Ensure deletion marks isDeleted: true instead of removing records.
Modify /api/media to exclude isDeleted: true by default.



Expected Output

Multi-select mode in MediaGrid.js with checkboxes and action buttons.
API routes for single and bulk media deletion (/api/media/[id], /api/media/bulk).
Bulk download functionality generating a ZIP file.
Updated README.md with instructions for testing bulk actions.

Project Structure
/src
  /app
    /api
      /auth
        signup/route.js
        login/route.js
      /upload
        route.js
      /media
        route.js
        [id]/route.js
        bulk/route.js
    /components
      LoginForm.js
      SignupForm.js
      UploadButton.js
      MediaGrid.js
      MediaCard.js
      PreviewModal.js
    /lib
      s3.js
      prisma.js
      uppy.js
    /styles
      globals.css
/prisma
  schema.prisma
  migrations/
.env.local
README.md


🟢 Phase 5: Bonus Features
Objective
Add optional features: favorites, trash recovery, search/filter, dark mode, and video mute toggle.
Steps

Favorites Toggle:

Add a favorite button to MediaCard.js and PreviewModal.js.
Update /api/media/[id]/route.js to toggle isFavorite in Prisma.


Soft Delete and Trash Recovery:

Add a “Trash” page to list media with isDeleted: true.
Add an API route (/api/media/restore) to restore selected media (isDeleted: false).
Add a UI component (TrashPage.js) for the trash view.


Search and Filter:

Add a search bar and filters to MediaGrid.js (filter by filename, date, or MIME type).
Update /api/media to support query parameters (e.g., ?search=filename, ?mimeType=image/jpeg).


Dark Mode:

Implement dark mode using shadcn/ui and Tailwind CSS (e.g., toggle via a button).


Video Mute Toggle:

Add a mute/unmute button to PreviewModal.js for video playback.



Expected Output

Favorites toggle in MediaCard.js and PreviewModal.js.
Trash page (TrashPage.js) and restore API route (/api/media/restore).
Search and filter functionality in MediaGrid.js.
Dark mode support with Tailwind CSS.
Video mute toggle in PreviewModal.js.
Updated README.md with instructions for testing bonus features.

Project Structure
/src
  /app
    /api
      /auth
        signup/route.js
        login/route.js
      /upload
        route.js
      /media
        route.js
        [id]/route.js
        bulk/route.js
        restore/route.js
    /components
      LoginForm.js
      SignupForm.js
      UploadButton.js
      MediaGrid.js
      MediaCard.js
      PreviewModal.js
      TrashPage.js
    /lib
      s3.js
      prisma.js
      uppy.js
    /styles
      globals.css
/prisma
  schema.prisma
  migrations/
.env.local
README.md


🟢 Additional Notes (All Phases)

Use JavaScript (ES modules, no TypeScript).
Prioritize efficiency, maintainability, and scalability.
Ensure all dependencies are the latest stable versions.
Provide clear error messages for user-facing issues (e.g., upload failures, invalid credentials).
Secure all API routes with user authentication checks.
Use presigned URLs for all S3 interactions.

🟢 Clarifications for Cursor AI

Progress Indicators: Ensure Uppy shows individual progress bars for each file during parallel uploads, updating in real-time.
Thumbnail Generation: Use @uppy/thumbnail-generator for images only; no thumbnails for videos.
Error Handling: Implement robust error handling for uploads, API requests, and S3 interactions.
UI Consistency: Use shadcn/ui components exclusively for a cohesive look.
Security: Validate user permissions for all API routes and S3 access.
Scalability: Design to handle large numbers of files and users efficiently.
