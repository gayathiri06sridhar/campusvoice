# Campus Blog Platform

A modern, full-featured blog application with admin dashboard, contact system, and email integration.

## Features

✨ **Core Features:**
- 📝 Rich text editor with image uploads
- 👤 Admin dashboard for article management
- 💬 Contact form with direct email delivery
- 🎨 Beautiful responsive UI with shadcn/ui components
- 🔐 Authentication with Supabase
- 📧 EmailJS integration for direct email sending

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Database**: Supabase PostgreSQL
- **UI Components**: shadcn/ui
- **Email Service**: EmailJS
- **Styling**: Tailwind CSS
- **Build Tool**: Vite

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Supabase account (for database)
- EmailJS account (for email delivery)

### Installation

```sh
# Clone the repository
git clone <YOUR_REPOSITORY_URL>

# Navigate to the project
cd campus

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8083`

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

## Configuration

### EmailJS Setup

1. Sign up at [emailjs.com](https://www.emailjs.com)
2. Create an email service (Gmail recommended)
3. Create an email template
4. Update `src/lib/emailjs.ts` with your credentials:
   - Public Key
   - Service ID
   - Template ID

See [EMAILJS_SETUP.md](EMAILJS_SETUP.md) for detailed instructions.

## Project Structure

```
campus/
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── ContactForm.tsx
│   │   ├── AdminHeader.tsx
│   │   ├── Header.tsx
│   │   └── ...
│   ├── pages/            # Page components
│   │   ├── AdminDashboard.tsx
│   │   ├── Contact.tsx
│   │   ├── PostEditor.tsx
│   │   └── ...
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   │   ├── emailjs.ts    # Email service
│   │   └── storage.ts    # File upload utility
│   └── integrations/     # Third-party integrations
│       └── supabase/
├── supabase/             # Database migrations
├── public/               # Static assets
└── package.json
```

## Available Routes

- `/` - Home page with articles
- `/contact` - Contact form page
- `/admin` - Admin dashboard (protected)
- `/admin/new` - Create new article
- `/admin/edit/:id` - Edit article
- `/post/:id` - View article

## Features in Detail

### 📝 Article Management
- Create, edit, and delete articles
- Rich text editor with image uploads
- Publish/unpublish articles
- Cover image support
- Fallback to base64 data URLs for offline support

### 💬 Contact System
- User-friendly contact form
- Direct email delivery via EmailJS
- Database storage for all messages
- Admin dashboard to view messages
- Mark messages as read/unread
- Delete messages

### 🔐 Admin Features
- Secure authentication with Supabase
- Protected admin routes
- Dashboard with articles and messages tabs
- Message management interface

## Development

### Build for Production

```sh
npm run build
```

### Preview Production Build

```sh
npm run preview
```

### Linting

```sh
npm run lint
```

## Database

The project uses Supabase PostgreSQL with the following tables:

- `posts` - Blog articles
- `contact_messages` - Contact form submissions

All tables include Row Level Security (RLS) policies for data protection.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import repository on Vercel
3. Add environment variables
4. Deploy!

### Deploy to Other Platforms

The app can be deployed to any platform that supports Node.js (Netlify, Railway, etc.)

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please open an issue on GitHub or contact the admin.

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
