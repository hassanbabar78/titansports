# Titan Sports

A modern and responsive e-commerce web application built for sports and fitness products. The project is developed using React, TypeScript, Vite, Tailwind CSS, and Supabase, providing a fast, scalable, and production-ready shopping experience.

---

##  Features

*  Complete e-commerce workflow
*  Authentication system with protected admin access
*  Product management dashboard
*  Shopping cart and checkout flow
*  Fully responsive UI for mobile and desktop
*  Fast performance using Vite
*  Modern UI using Tailwind CSS and shadcn/ui
*  Product sorting and filtering
*  State management using React Context API
*  Backend integration with Supabase
*  Toast notifications and smooth UX interactions
*  Testing setup using Vitest

---

##  Tech Stack

### Frontend

* React 18
* TypeScript
* Vite
* React Router DOM
* Tailwind CSS
* shadcn/ui
* Lucide React Icons

### Backend & Database

* Supabase

### State & Data Management

* React Context API
* TanStack React Query

### Testing

* Vitest
* Testing Library

---

##  Project Structure

```bash
src/
├── components/        # Reusable UI components
├── contexts/          # Authentication & cart contexts
├── hooks/             # Custom React hooks
├── integrations/      # Supabase integration
├── lib/               # Utility and validation functions
├── pages/             # Application pages/routes
├── test/              # Test setup and test files
└── App.tsx            # Main application entry
```

---

##  Main Pages

* Home Page
* Shop Page
* Product Details
* Cart Drawer
* Checkout Page
* Login / Authentication
* Admin Dashboard
* Contact Page
* About Page
* Order Confirmation

---

##  Installation & Setup

### 1 Clone the Repository

```bash
git clone https://github.com/hassanbabar78/titansports.git
```

### 2 Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment Variables

Create a `.env` file in the root directory and add the following:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

###  Start Development Server

```bash
npm run dev
```

The application will run at:

```bash
http://localhost:5173
```

---

## Running Tests

```bash
npm run test
```

Watch mode:

```bash
npm run test:watch
```

---

## Build for Production

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

## Authentication & Authorization

The project includes:

* User authentication
* Protected admin routes
* Role-based access handling
* Password reset functionality

---

## Admin Dashboard Features

Admins can:

* Add new products
* Edit product details
* Delete products
* Manage orders
* Track product inventory
* View sales-related information

---

## UI & UX Highlights

* Clean modern interface
* Responsive design
* Smooth navigation
* Toast notifications
* Skeleton loading states
* Accessible UI components

---

## Deployment

You can deploy this project on:

* Vercel
* Netlify
* Render
* Firebase Hosting

---

## License

This project is licensed under the MIT License.

---

##  Author

**Muhammad Hassan Babar**

Bachelor's in Computer Science, ITU

---

## Support

If you like this project, consider giving it a star on GitHub.
