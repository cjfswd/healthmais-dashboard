# Agent Guidelines & Project Context

## General Rules
1. **NO TRASH FILES**: Agents MUST NOT create temporary extraction scripts (Python, Node), JSON dumps, or build output logs (`.txt`, `.log`) in the project root. If temporary inspection is needed, do it strictly in memory or use the Vercel serverless environment appropriately without leaving artifacts.
2. **VERCEL FUNCTIONS**: This project uses Vercel Serverless Functions (`/api` folder). Use this architecture for backend processing instead of stand-alone scripts.
3. **EXCEL FILES**: The source Excel file is located at `public/POWERBI.xlsx`. It should be fetched and processed from the public directory. Do not duplicate or create "optimized" versions of the Excel files.

## Style Context
- **Framework**: React / Vite.
- **Styling**: Tailwind CSS v3 / Shadcn UI.
- **Theme**: We use the 'new-york' style with a slate base color. Custom CSS variables for the color palette are defined in `src/index.css`.
- Always stick to the pre-defined Shadcn UI components in `src/components/ui`.
