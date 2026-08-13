# Design System Specifications

Provides a UI palette, typography rules, and reusable component definitions.

## 1. Typography & Hierarchy
* **Font Family:** Inter or Roboto (Google Fonts link).
* **Headings:**
  * `h1`: `text-3xl font-extrabold tracking-tight`
  * `h2`: `text-2xl font-bold`
  * `h3`: `text-xl font-semibold`
* **Body:** `text-sm font-normal text-slate-600 dark:text-slate-300`

## 2. Shared Component Library

### UI Elements List
* **Button:** Variants (`primary`, `secondary`, `danger`, `outline`), Sizes (`sm`, `md`, `lg`), Loading state spinner override.
* **Input / Textarea:** Floating labels, placeholder validation styling, helper description text.
* **Select / Dropdown:** Auto-adjusting position lists, custom multi-select badges.
* **Modal / Drawer:** Backdrop blur blur-effect layer (`backdrop-blur-sm`), keyboard escape event listener, smooth scale-in transition animation.
* **Badge / Tag:** Color variants based on utility status (Success: Green, Warning: Yellow, Danger: Red, Neutral: Gray).
* **Table:** Column sorting arrow heads, responsive horizontal overflow scroll, skeleton cell states.
* **Tabs:** Slide underline indicator, active/inactive styling.
* **Tooltip / Toast:** Auto-timeout notification alert blocks.
