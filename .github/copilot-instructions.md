# Gantt Chart Planner - AI Coding Instructions

## Architecture Overview

This is a **React SPA project** built with Create React App using Tailwind CSS for styling. The application provides a comprehensive Gantt chart interface with drag-and-drop functionality, localStorage persistence, and advanced timeline features.

**Primary Entry Point**: React SPA (`src/App.js`, `src/index.js`) - Full-featured Gantt chart with localStorage persistence
**Unused**: Express TypeScript backend (`src/app.ts`) - Disconnected and not integrated

## Key Patterns & Conventions

### State Management (src/App.js)
- **localStorage persistence**: Tasks auto-save with keys `'ganttTasks'` and `'ganttTimeline'`
- **Task model**: `{ id, name, start, end, color, notes }` where dates are ISO strings (YYYY-MM-DD)
- **Complex state**: Tasks, timeline range, drag states, editing states, undo/redo history
- **Undo/Redo system**: Snapshot-based with `history` and `future` arrays for unlimited undo
- **Dynamic timeline**: Bounds calculated from task dates, falls back to current year if no tasks

### Advanced Features
- **Drag & Drop**: Pointer events API for smooth task bar dragging and resizing
- **Timeline Visualization**: Weekend highlighting, today's date indicator, month segments
- **Zoom Controls**: Dynamic zoom with mouse wheel and fit-to-view functionality
- **Notes System**: Per-task notes with modal interface
- **Color Picker**: Custom color selection for task bars
- **Import/Export**: JSON-based data import/export functionality

### Styling Conventions
- **Tailwind utility-first**: All components use Tailwind classes exclusively
- **Gradient backgrounds**: Main container uses `bg-gradient-to-br from-blue-50 to-indigo-100`
- **Icon library**: `lucide-react` for all UI icons (Plus, Trash2, MessageSquare, etc.)
- **Grid layouts**: Complex CSS Grid for left panel with configurable column widths
- **Responsive design**: Mobile-friendly with responsive grid layouts

### Date & Timeline Calculations
- **Date utilities**: Custom functions for date parsing, formatting, duration calculations
- **Timeline positioning**: Pixel-perfect positioning using day width calculations
- **Month segments**: Dynamic month header generation with proper day counting
- **Zoom system**: Configurable zoom levels with smooth transitions

## Development Workflows

### Commands (package.json scripts)
```bash
npm start        # Start dev server (react-scripts) - default port 3000
npm run build    # Production build to build/
npm test         # Run Jest tests (none currently configured)
```

### Project Structure
- **Active**: `src/App.js` (React component), `src/index.js` (entry point)
- **Unused**: `src/app.ts` (Express), `src/types/index.ts` (unused TypeScript types)
- **Config**: `tailwind.config.js`, `tsconfig.json` (Express-focused, not used)
- **Data**: `data/tasks.json` (sample data, not used by app)

## Critical Developer Notes

1. **Single source of truth**: All functionality lives in `src/App.js` - the Express backend is unused
2. **Date handling**: All dates use ISO format (`YYYY-MM-DD`); use custom date utilities for calculations
3. **State persistence**: Tasks and timeline auto-save to localStorage; use snapshot system for undo/redo
4. **Drag implementation**: Pointer Events API with complex state management for smooth interactions
5. **Timeline calculations**: Day width, positioning, and zoom require careful coordinate math
6. **Grid layout**: Left panel uses CSS Grid with dynamic column widths defined as constants

## Common Tasks

**Add a new task property** (e.g., priority):
1. Update `newTask` initial state to include the new property
2. Add input field to the task creation form
3. Update task rendering in the left panel grid
4. Add display logic in timeline bars if neededc
5. **localStorage auto-updates** - no schema migration needed

**Modify timeline appearance**:
- Weekend highlighting: Modify grid background colors in timeline rendering
- Today's date: Update day cell styling logic
- Month headers: Adjust month segment generation and styling
- Zoom behavior: Update zoom constants and day width calculations

**Add timeline feature**:
- Position calculations: Use `getTaskPosition()` for bar placement
- Drag handlers: Implement pointer event handlers with state management
- Visual feedback: Add hover states and active indicators
- State updates: Use commit system for undo/redo compatibility

**Customize left panel**:
- Column widths: Update `*_COLUMN_WIDTH` constants and grid template
- Layout changes: Modify CSS Grid template columns
- Styling updates: Adjust Tailwind classes for spacing and appearance
- Interactive elements: Update button sizes and input styling for new widths
