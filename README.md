# Enterprise Ticketing System (Barcode Gulf Branding)

A fully functional, full-stack ticketing system built with Next.js 14, Prisma, SQLite, and NextAuth. The UI is custom-designed based on the corporate aesthetic of Barcode Gulf Solutions.

## Features

- **Authentication:** Role-based access (User & Admin).
- **User Portal:** Create tickets, view history, and reply to discussions.
- **Admin Portal:** Manage all tickets, update statuses, and system analytics.
- **Email Notifications:** Automatic alerts for ticket creation, replies, and status changes.
- **Responsive Design:** Optimized for mobile, tablet, and desktop using Tailwind CSS.
- **Enterprise UI:** Professional Barcode Gulf theme with Eastern Blue and Navy accents.

## Tech Stack

- **Frontend:** Next.js (App Router), Tailwind CSS, Lucide Icons, Framer Motion.
- **Backend:** Next.js API Routes, NextAuth.js.
- **Database:** Prisma ORM with SQLite (can be easily swapped to PostgreSQL/MySQL).
- **Email:** Nodemailer.

## Installation & Setup

1. **Clone/Download** the repository.
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment:**
   - Copy `.env.example` to `.env`.
   - Update `NEXTAUTH_SECRET` (generate a secure string).
   - Configure SMTP settings for email notifications if needed.
4. **Initialize Database:**
   ```bash
   npx prisma db push
   ```
5. **Seed Admin User:**
   ```bash
   npx prisma db seed
   ```
6. **Start Development Server:**
   ```bash
   npm run dev
   ```

## Troubleshooting (Windows)

If you get a security error saying `npm.ps1 cannot be loaded because running scripts is disabled`, you can either:
1. Use `npm.cmd run dev` instead.
2. OR, fix it permanently by running: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` in your PowerShell.

## Admin Credentials (Initial)

- **Username:** `shafeek@barcodegulf.net`
- **Password:** `AdminTempPassword2026!`

*Note: It is highly recommended to change this password after your first login.*

## Design Specifications

- **Teal (Primary):** `#1AA1C5`
- **Navy (Secondary):** `#1B365D`
- **Font:** Montserrat
