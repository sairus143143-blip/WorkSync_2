# WorkSync

React + TypeScript + Vite frontend.

## Getting Started

1. Run `npm install`
2. Run `npm run dev`

## Employee Workflow Prototype

Employees can create an Employee-only account from the Sign In screen. New accounts are linked to workforce records and begin active; the seeded system administrator remains protected. Admin task management is separate from employee-owned task updates, and employee task/report routes only show records linked to the signed-in employee.

Weekly progress periods are inclusive seven-day windows anchored to each task's start date, clipped at the due date or an explicit early completion date. Submissions retain immutable progress/status snapshots and append-only revision and review history. Admin weekly review is separate from the existing analytics Reports page.

Accounts, employee records, tasks, task activity, notifications, and weekly reports persist in this browser's `localStorage`. This is a frontend prototype only: mock passwords and client-side role checks are not secure, local browser data is not a durable backup, and production authentication/authorization requires a trusted backend. Data Management JSON exports include report history and exclude mock passwords.

Run `npm run build` to create a production bundle and `npm run lint` for ESLint checks.
