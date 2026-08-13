# Theme Integration Specifications

Details the dark/light mode switching architecture for the application.

## 1. Theme Configuration
* Use Tailwind CSS's class strategy: `dark:bg-slate-900 bg-white`.
* Theme state stored inside a React Context Provider (`ThemeProvider`) and stored in local storage to keep preference saved across reloads.

## 2. Core Color Schemes

| Token | Light Mode Value | Dark Mode Value | Usage |
| --- | --- | --- | --- |
| **bg-primary** | `#F8FAFC` (Slate-50) | `#0F172A` (Slate-900) | Core body backdrop background |
| **bg-surface** | `#FFFFFF` | `#1E293B` (Slate-800) | Cards, Modals, Panels |
| **text-primary**| `#0F172A` (Slate-900) | `#F8FAFC` (Slate-50) | Headings, Title texts |
| **text-secondary**| `#475569` (Slate-600) | `#94A3B8` (Slate-400) | Subheadings, Body descriptions |
| **border-accent**| `#E2E8F0` (Slate-200) | `#334155` (Slate-700) | Card grids, borders |

## 3. Dynamic Charts Color Adjustments
* Grid lines: Slate-200 (light) vs Slate-700 (dark).
* Tooltip overlays: White background (light) vs Slate-800 background (dark).
