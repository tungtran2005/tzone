# Frontend Pages

This folder contains static frontend pages built with HTML, Tailwind CSS (CDN), and vanilla JavaScript.

## Routes

- `/` - Home page
- `/brands` - List all brands
- `/brands/:id` - Brand detail page (shows devices filtered by brand)
- `/login` - Login page
- `/register` - Register page
- `/admin` - Admin dashboard
- `/admin/brands` - Admin CRUD brands
- `/admin/devices` - Admin CRUD devices

## Notes

- JS calls the existing backend APIs under `/api/v1/*` and `/auth/*`.
- Admin pages check for `accessToken` in `localStorage` and redirect to `/login` if missing.
- Token refresh uses `/auth/refresh` automatically when a protected call returns `401`.

