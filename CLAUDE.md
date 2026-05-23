---
name: university-ims-master-governor
description: Unyielding academic constraints and design system tokens for University-IMS.
---

# University IMS Master Engineering Protocol

## 🚨 Core Academic Logic Guardrails
1. **The Academic Calendar Cycle:** All student study plans and timetables must anchor strictly to the three fixed annual calendar windows: Semester 1 (Nov–Apr Long, max 20 cr), Semester 2 (Apr–Jul Long, max 20 cr), and Semester 3 (Jul–Nov Short, max 10 cr). 
2. **Non-Standard Exclusions:** Flag MBBS and Pharmacy programmes as `Non-Standard Calendar` and bypass standard credit hour/extension cascades for them; they are governed by independent faculty modules.
3. **No Code Placeholders:** Do not generate empty handlers, mock JSON objects, or `// TODO` stubs. All multi-programme relations, graph lookups, and financial billing engines must be fully articulated.

## 🎨 UI/UX & Component Styling Standards
- **Web Interface Stack:** React 18 (Vite), Tailwind CSS, and layout components from shadcn/ui.
- **Mobile Interface Stack:** React Native (Expo) with NativeWind for design token consistency.
- **Interactive Views:** Use FullCalendar for interactive timetable grids, Recharts for cohort performance analytics, and React-Konva/Leaflet for rendering interactive campus floor plans.
- **Mandatory UI States:** Every screen must implement responsive dashboard layout views, explicit skeleton loading states for asynchronous data fetching, validation error handling utilizing Zod schemas, and a functional dark-mode configuration.

## 📉 Token Optimization Protocol
- **Terse Output:** Do not speak conversationally. Omit friendly intros, summaries, or explanations of code changes. Move directly between file edits and tool execution.
- **Log Suppression:** Pass explicit silence flags to all terminal tasks (e.g., `npm run build -- --silent`) to prevent build outputs from filling up session memory logs.