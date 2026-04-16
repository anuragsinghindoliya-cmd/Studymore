# StudyTimer

## Overview

A focused Pomodoro study timer application for the Internet Computer. Users can track study sessions by subject, set weekly goals, view cumulative study stats, and maintain study streaks. All data is stored on-chain with full user ownership through Internet Identity authentication.

## Authentication

- Internet Identity required for all operations
- Anonymous access is not permitted
- User data is isolated by principal — users can only access their own sessions, subjects, and goals
- Display name can be set for personalization

## Core Features

### Pomodoro Timer

- Configurable work and break intervals (work, short break, long break)
- Configurable number of sessions before a long break
- Timer cycles automatically through work and break phases
- Sessions are logged to the backend upon completion

### Subject Management

- Create, update, and delete subjects
- Subject properties:
  - Name (required, max 100 characters)
  - Color (max 20 characters, used for UI color coding)
- Maximum of 50 subjects per user
- Deleting a subject also removes any weekly goals tied to that subject

### Session Logging

- Sessions logged with subject, start time, duration (minutes), and type (`work` or `break`)
- Sessions can be deleted individually
- Query sessions by subject or by date range
- Maximum of 10,000 sessions per user

### Weekly Goals

- Set per-subject or global (all-subjects) weekly minute targets
- One goal per subject per week (enforced on backend)
- Update or delete existing goals
- Maximum of 200 goals per user

### Study Stats

- Total study minutes across all work sessions
- Minutes broken down per subject
- Current study streak (consecutive days with at least one work session)
- Longest study streak ever achieved

### Timer Settings

- Configurable durations: work, short break, long break (all must be > 0)
- Configurable sessions before long break (must be > 0)
- Settings persisted per user on-chain

## Backend Data Storage

- **Subjects**: Persistent per-user map keyed by subject ID
- **Sessions**: Persistent per-user map keyed by session ID
- **Weekly Goals**: Persistent per-user map keyed by goal ID; one per (subject, weekStart) pair
- **Settings**: Persistent per-user Pomodoro configuration
- **Profiles**: Display name keyed by principal
- State is maintained across canister upgrades via orthogonal persistence

## Backend Operations

- All update operations require authentication (`requireAuth`)
- Input validation with descriptive error messages via `Runtime.trap`
- Per-user ID counters for subjects, sessions, and goals
- Streak calculation performed on-chain using day-indexed session timestamps

## User Interface

- Landing page with feature overview and sign-in CTA
- Dashboard with active Pomodoro timer
- Subject selector for the active session
- Session history view
- Weekly goals panel with progress tracking
- Study stats panel (total minutes, streaks, per-subject breakdown)
- Settings dialog for timer configuration
- Profile dialog for display name

## Design System

- Clean, distraction-free interface optimized for focus
- Subject color coding throughout the UI
- Animated progress indicators for the timer
- Responsive layout for various screen sizes

## Error Handling

- Authentication required errors for anonymous users
- Validation errors for invalid input (empty names, zero durations, invalid session types)
- Resource limit errors when approaching maximums (subjects, sessions, goals)
- Subject/session/goal not found errors for invalid IDs
- Duplicate goal prevention (same subject and week)
