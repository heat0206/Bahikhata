# PrepBoard Development Plan

PrepBoard is a personal, MVP-first React project. The goal is to learn React by building a real application in small, testable milestones that each leave the app in a usable state.

## Milestone 1: Project foundation

Build the initial app shell and shared data shape.

What to learn:
- JSX and component structure
- Props
- Thinking in reusable UI pieces

What to build:
- Vite + React + Tailwind setup
- Base layout for the app
- Shared application record shape
- Status options for Version 1

Done when:
- The app loads successfully
- A basic dashboard layout is visible
- Sample application data can be rendered statically

## Milestone 2: Read-only dashboard

Render the application list in a clean, readable format.

What to learn:
- Mapping arrays to UI
- Conditional rendering
- Presenting data clearly

What to build:
- Table or list view for applications
- Columns for Company Name, Role, Status, and Applied On
- Newest-first sorting
- Empty state for when no applications exist

Done when:
- Applications display correctly from sample data
- The newest application appears first
- The empty state appears when the list is empty

## Milestone 3: Search and filter

Let the dashboard respond to user input.

What to learn:
- Controlled components
- Derived state
- Simple list filtering

What to build:
- Search bar for Company Name and Role
- Filter dropdown for Status
- Clear filters action

Done when:
- Search narrows the visible list
- Status filtering works as expected
- Clearing filters restores the full list

## Milestone 4: Add company form

Create the first write flow and save data locally.

What to learn:
- Forms in React
- Input state
- Submission handling
- Browser local storage

What to build:
- Add Company form with all Version 1 fields
- Basic validation for required fields
- Local storage persistence for saved applications

Done when:
- A new company can be added through the form
- The new record appears in the dashboard
- The data remains after refreshing the page

## Milestone 5: Company details view

Show the full information for one application.

What to learn:
- Passing selected data between UI states
- Detail-oriented layouts
- Keeping views focused

What to build:
- Company details page or view
- All Version 1 fields displayed clearly
- Navigation from dashboard to details

Done when:
- A single company record can be opened
- All saved information is visible in the details view

## Milestone 6: Edit company flow

Reuse the form to update an existing application.

What to learn:
- Form reuse
- Prefilled controlled inputs
- Update versus create behavior

What to build:
- Edit button on the details view
- Prefilled form fields
- Update the existing record in local storage

Done when:
- Existing data can be edited
- Saving updates the correct record
- The edited values persist after refresh

## Milestone 7: Polish and reliability

Make the MVP feel solid without expanding scope.

What to learn:
- Accessibility basics
- Responsive layout adjustments
- Testing the most important user flows

What to build:
- Responsive dashboard and form layouts
- Better spacing, typography, and empty states
- Focused tests for search, filter, add, and edit flows

Done when:
- The app works well on desktop and mobile widths
- Core flows are covered by tests or repeatable manual checks
- The UI feels consistent and professional

## Milestone 8: Scope review

Confirm that Version 1 still matches the project vision.

What to check:
- No backend or authentication
- No AI features
- No calendar, timeline, or statistics
- No extra features beyond Version 1

Done when:
- The app matches the Version 1 scope in CONTEXT.md
- Any future ideas remain in ROADMAP.md instead of the implementation

## Recommended build order

1. Foundation
2. Read-only dashboard
3. Search and filter
4. Add company form
5. Details view
6. Edit flow
7. Polish and reliability
8. Scope review

This order teaches React in a natural progression: render data first, then handle user input, then persist state, then reuse logic, and finally polish the experience.

## Notes

- Keep each milestone independently testable.
- Do not add Version 1.1 or later features early.
- Prefer simple, beginner-friendly React patterns.
- Use local storage only for Version 1.
- Keep the UI clean and professional, not flashy.