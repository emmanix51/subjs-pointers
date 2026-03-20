# Pointers Website - Conversation Tracker

## Project Overview
- **Purpose**: Website for students to check their subject pointers/grades
- **Framework**: Next.js 16 with shadcn/ui, Tailwind CSS, TypeScript
- **Status**: Phase 1 Complete - Radar menu with 5 subjects

## Subjects (5)
1. CC102
2. CC106
3. CS Prof EL 2
4. CS Prof EL 3
5. EDM 101

## Project Structure
```
src/
├── app/
│   ├── page.tsx          # Main radar menu page
│   ├── layout.tsx
│   └── globals.css
├── components/
│   └── ui/
│       ├── radar-effect.tsx  # Radar menu components
│       └── button.tsx        # shadcn button
└── lib/
    └── utils.ts              # shadcn utilities
```

## Dependencies Installed
- framer-motion (animations)
- tailwind-merge (class merging)
- react-icons (HiCode, HiChip, HiAcademicCap, HiLightBulb, HiCalculator)
- lucide-react (icons)
- react-pdf (PDF viewing)
- @radix-ui/react-slot

## Components Created
- `Radar` - Animated radar effect background
- `Circle` - Concentric circles for radar
- `IconContainer` - Subject icon buttons (with onClick)
- `CategoryList` - Category cards with hover effects
- `PdfViewer` - Full PDF viewer with thumbnails, zoom, search
- `PictureGallery` - Image grid with lightbox viewer
- `Sidebar` - Collapsible sidebar for PDF thumbnails

## Routes
- `/` - Main radar menu
- `/subjects/[subject]` - Subject detail page with exam categories
- `/subjects/[subject]/[term]` - Term page with Pictures & PDFs tabs
- `/admin` - Admin login page
- `/admin/dashboard` - Admin upload dashboard
- `/api/upload` - File upload API
- `/api/files` - List uploaded files API
- `/api/admin/*` - Admin authentication APIs

## Admin System
- Password-protected admin panel (default: `admin123`)
- **Subject Management**: Add, edit, delete subjects with title & description
- **File Upload**: Upload pictures/PDFs per subject and term
- Drag & drop file upload
- Delete uploaded files
- Subjects stored in `/data/subjects.json`
- Files stored in `/public/uploads/[subject]/[term]/[type]`

## Environment Variables
```
ADMIN_PASSWORD=admin123
```

## Data Files
- `/data/subjects.json` - Subject definitions (slug, title, description)
- `/public/uploads/[subject]/[term]/pictures/` - Uploaded images
- `/public/uploads/[subject]/[term]/pdfs/` - Uploaded PDFs

## Next Steps
- [ ] Change default admin password
- [ ] Add student authentication
- [ ] Add pointer/grade display per term
- [ ] Add file preview before upload

## Run Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
