# Responsive Design Specifications

Ensures smooth visual layout rendering across different screens (Mobile, Tablet, Laptop, and Wide Desktop monitors).

## 1. Breakpoint Grid Configurations
* **Mobile (up to 640px):** Single-column layouts, hidden sidebars (accessed via mobile hamburger menus or slides), full-width action buttons.
* **Tablet (641px to 1024px):** Dual-column grids for forms, persistent slim sidebars, compact tables.
* **Desktop (1025px and up):** Full dashboard grid views, multi-column setups, open sidebars.

## 2. Specific Module Adaptability

### A. Candidate Dashboard & Job Search
* Mobile viewport prioritizes search inputs. Filters slide up from the bottom as a drawer sheet.
* Job cards use flex layouts to scale gracefully.

### B. Kanban Board
* Desktop renders horizontally with columns side-by-side.
* Mobile displays a single active column at a time, with tab selectors or horizontal swipe indicators to toggle columns.

### C. Monaco Code Editor
* On mobile, displays warnings suggesting landscape mode or external keyboard. Scales to 100% of viewport heights.
