---
name: qiu-ims-master-governor
description: Unyielding academic constraints and design system tokens for QIU-IMS.
---

# QIU-IMS Master Engineering Protocol

## 🚨 Core Academic Logic Guardrails
1. [cite_start]**The Academic Calendar Cycle:** All student study plans and timetables must anchor strictly to the three fixed annual calendar windows: Semester 1 (Nov–Apr Long, max 20 cr), Semester 2 (Apr–Jul Long, max 20 cr), and Semester 3 (Jul–Nov Short, max 10 cr)[cite: 53]. 
2. [cite_start]**Non-Standard Exclusions:** Flag MBBS and Pharmacy programmes as `Non-Standard Calendar` and bypass standard credit hour/extension cascades for them; they are governed by independent faculty modules [cite: 58-61].
3. **No Code Placeholders:** Do not generate empty handlers, mock JSON objects, or `// TODO` stubs. [cite_start]All multi-programme relations, graph lookups, and financial billing engines must be fully articulated[cite: 48].

## 🎨 UI/UX & Component Styling Standards
- [cite_start]**Web Interface Stack:** React 18 (Vite), Tailwind CSS, and layout components from shadcn/ui[cite: 203].
- [cite_start]**Mobile Interface Stack:** React Native (Expo) with NativeWind for design token consistency[cite: 205].
- [cite_start]**Interactive- **Diff Management:** Use specific file-patching tools instead of overwriting massive entire source files repeatedly.

- [cite_start]**Interactive Views:** Use FullCalendar for interactive timetable grids, Recharts for cohort performance analytics, and React-Konva/Leaflet for rendering interactive campus floor plans[cite: 203].
- [cite_start]**Mandatory UI States:** Every screen must implement responsive dashboard layout views, explicit skeleton loading states for asynchronous data fetching, validation error handling utilizing Zod schemas, and a functional dark-mode configuration[cite: 203].

## 📉 Token Optimization Protocol
- **Terse Output:** Do not speak conversationally. Omit friendly intros, summaries, or explanations of code changes. Move directly between file edits and tool execution.
- **Log Suppression:** Pass explicit silence flags to all terminal tasks (e.g., `npm run build -- --silent`) to prevent build outputs from filling up session memory logs.