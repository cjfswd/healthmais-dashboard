---
trigger: always_on
---

# Healthmais Ecosystem - Agent Instructions

## Architecture & Design Patterns
- **Clean Code**: Prioritize readability and maintainability.
- **DDD & Layered Architecture**:
  - `@presentation`: React components, pages, layouts.
  - `@application`: Custom hooks, business logic.
  - `@domain`: Entities, types, strategy pattern implementations.
  - `@infrastructure`: API clients and external service integrations.
- **Functional Programming**: Preference for immutability and pure functions.

## UI/UX Standards
- **Layout**: Full-width dashboard. **No sidebar** (use top navigation).
