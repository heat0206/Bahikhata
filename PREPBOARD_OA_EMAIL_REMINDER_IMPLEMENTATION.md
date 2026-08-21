# PrepBoard --- OA Reminder Email Automation

## Agent Implementation Prompt

## 1. Objective

Implement an automatic email reminder system for PrepBoard.

The purpose of this feature is to send a reminder email to a user **one
day before an upcoming Online Assessment (OA)**.

Only applications whose status is:

`OA - Upcoming`

should be considered.

The reminder must be sent to the **email address associated with the
authenticated PrepBoard user**.

The application already stores the OA date and time, so do not introduce
a second source of truth for the OA schedule.

The email should use a simple reusable template and dynamically insert:

-   User's name
-   Company name
-   OA date
-   OA time

The implementation must work even when the user has completely closed
the browser or is not currently using the dashboard.

------------------------------------------------------------------------

# 2. Important Existing Architecture

This is an existing working PrepBoard application.

The current stack is:

-   React
-   Vite
-   Node.js
-   Express
-   MongoDB
-   Mongoose

Authentication already exists and uses:

-   Email/password authentication
-   bcrypt password hashing
-   JWT
-   JWT stored in an `httpOnly` cookie
-   Authentication middleware that attaches the authenticated user's ID
    to `req.user`

Applications are associated with users through `userId`.

The existing OA automation currently changes:

`OA - Upcoming` → `OA - Completed`

when the OA date/time passes. That existing feature is currently
implemented through the frontend `useApplications` hook and runs while
the dashboard is active.

Do **not** replace or unnecessarily modify that existing automation as
part of this feature.

This email reminder is a separate backend-side automation whose main
purpose is to work even when the frontend is closed.

------------------------------------------------------------------------

# 3. Required Reminder Schedule

Do NOT run a continuous check every hour or every few minutes.

The agreed architecture is to run the reminder check **twice per day**:

### Morning check

Run every day at:

`05:00 AM`

Purpose:

Find tomorrow's upcoming OAs and send their reminders.

### Night backup check

Run every day at:

`11:00 PM`

Purpose:

Catch OAs that were added or changed after the 05:00 AM check.

For example:

``` text
Day 1 — 05:00 AM
    ↓
Check tomorrow's OAs
    ↓
Send reminders for matching applications

Day 1 — 02:00 PM
    ↓
User adds another OA for Day 2

Day 1 — 11:00 PM
    ↓
Check tomorrow's OAs again
    ↓
Send reminder for the newly added OA
```

This gives us a simple and reliable MVP without constantly polling the
database.

------------------------------------------------------------------------

# 4. Critical Duplicate-Email Requirement

The 11:00 PM check must **NOT resend emails that were already sent by
the 05:00 AM check**.

Example:

``` text
05:00 AM
    ↓
Amazon OA tomorrow
    ↓
Email sent
    ↓
Mark reminder as sent

11:00 PM
    ↓
Amazon OA still exists
    ↓
Already reminded
    ↓
DO NOT send another email
```

The reminder system must therefore be idempotent.

The same OA reminder should only be sent once.

------------------------------------------------------------------------

# 5. Recommended Data Model Change

Inspect the existing `Application` model before modifying it.

Add a field to track whether the reminder has already been sent.

Recommended conceptual field:

``` javascript
oaReminderSent: {
    type: Boolean,
    default: false
}
```

Use the actual naming conventions of the existing codebase if a better
equivalent already exists, but keep the purpose clear.

The application will conceptually contain:

``` text
company
role
status
oaDate
oaTime
userId
oaReminderSent
```

Do NOT create a separate reminder collection for this MVP unless the
existing architecture makes that absolutely necessary.

The reminder status can live directly on the application.

------------------------------------------------------------------------

# 6. Reminder Eligibility

An application is eligible for an OA reminder only when ALL required
conditions are satisfied.

Conceptually:

``` text
status === "OA - Upcoming"
AND
oaDate exists
AND
oaTime exists
AND
OA occurs tomorrow
AND
oaReminderSent !== true
```

The backend must determine tomorrow based on the application's actual
stored OA date.

Do not rely on the frontend.

Do not trust a client-provided `oaReminderSent` value.

------------------------------------------------------------------------

# 7. What Does "Tomorrow" Mean?

Use the application's stored OA date and the scheduler's configured
application timezone.

Do not blindly depend on the machine's local timezone if that could
create inconsistent behavior between development and production.

Before implementation:

1.  Inspect the existing project for timezone/date handling.
2.  Determine whether the project already has a timezone convention.
3.  Reuse it if one exists.
4.  If there is no established convention, introduce a simple
    configurable timezone for the scheduler rather than adding a
    complicated timezone system.

For this project, an appropriate default is:

`Asia/Kolkata`

but keep it configurable if practical, for example through:

``` text
APP_TIMEZONE=Asia/Kolkata
```

Do not introduce unnecessary timezone libraries unless they are actually
needed.

The important requirement is that a check at 05:00 or 23:00 is
interpreted in the intended PrepBoard application timezone.

------------------------------------------------------------------------

# 8. Scheduler Architecture

Create a backend scheduler/job.

Suggested structure:

``` text
backend/
├── controllers/
├── models/
├── routes/
├── middleware/
├── services/
│   └── emailService.js
├── jobs/
│   └── oaReminderJob.js
└── server.js
```

Adapt this to the existing project structure instead of blindly creating
these directories.

The responsibilities should be separated.

## `oaReminderJob`

Responsible for:

> Finding applications that require an OA reminder and initiating the
> reminder process.

It should NOT contain the complete email formatting and transport
implementation.

## `emailService`

Responsible for:

> Sending an email.

It should not contain MongoDB queries for finding applications.

## Email template

Responsible for:

> Producing the email subject/body from dynamic values.

This separation should keep the implementation understandable.

------------------------------------------------------------------------

# 9. Scheduler Implementation

Use a lightweight Node-compatible scheduler appropriate for the existing
project.

Before adding a dependency:

1.  Inspect `package.json`.
2.  Check whether a scheduling library already exists.
3.  If one does not exist, choose a simple, well-maintained scheduler
    appropriate for Node.js.
4.  Do not introduce a large job-processing framework such as BullMQ,
    Redis, RabbitMQ, or a distributed workflow system for this MVP.

The scheduler should invoke the same function twice per day:

``` text
05:00 → checkAndSendOAReminders()
23:00 → checkAndSendOAReminders()
```

There should be **one source of truth** for reminder eligibility.

Do not duplicate the query logic between the morning and night jobs.

Conceptually:

``` javascript
schedule 05:00 → checkAndSendOAReminders()
schedule 23:00 → checkAndSendOAReminders()
```

------------------------------------------------------------------------

# 10. Reminder Job Flow

The main function should conceptually perform:

``` text
checkAndSendOAReminders()
        ↓
Determine tomorrow's date
        ↓
Find eligible applications
        ↓
For each application
        ↓
Get associated user
        ↓
Build email from template
        ↓
Send email
        ↓
Mark reminder as sent
```

The job should process applications independently.

If sending an email for one application fails, do not prevent unrelated
applications from being processed.

Log the failure appropriately.

------------------------------------------------------------------------

# 11. MongoDB Query

The query should be scoped to the required conditions.

Conceptually:

``` javascript
Application.find({
    status: "OA - Upcoming",
    oaDate: tomorrow,
    oaReminderSent: { $ne: true }
})
```

Adapt this to the actual data type and format of `oaDate`.

Do not assume `oaDate` is a MongoDB Date if the current implementation
stores it as a string.

Inspect the actual model and existing application creation/update logic
first.

If `oaDate` is stored as a string such as:

``` text
2026-08-17
```

make the comparison compatible with that format.

Do not migrate the entire existing date system just to implement
reminders unless there is a strong reason.

------------------------------------------------------------------------

# 12. OA Time Handling

The OA time is already stored and should be included in the email.

For determining which applications belong to tomorrow's reminder group,
the primary condition is the OA date.

The OA time should be used for:

-   Email content
-   Human-readable reminder information
-   Any necessary date/time calculations

Do not send reminders for applications that do not have a valid OA date.

If an `OA - Upcoming` application has no OA date:

-   Do not send an email.
-   Log or otherwise handle the incomplete data safely.
-   Do not crash the entire reminder job.

If it has a date but no time, decide based on the existing application's
validation rules. Prefer to handle it safely rather than failing the
entire job.

------------------------------------------------------------------------

# 13. Email Recipient

The email must be sent to the email address belonging to the
application's user.

Do NOT store an email address separately on the application just for
reminders.

Use the relationship:

``` text
Application.userId
        ↓
User._id
        ↓
User.email
```

Also retrieve:

``` text
User.name
```

for the email greeting.

This is important because the application already belongs to the
authenticated user through `userId`.

Do not accept the recipient email from the frontend.

Do not allow a client to specify an arbitrary recipient.

------------------------------------------------------------------------

# 14. Email Service

Use a simple backend email service.

Nodemailer is the preferred approach for this MVP if the project does
not already have an email provider integration.

Conceptual flow:

``` text
oaReminderJob
      ↓
emailService.sendOAReminder(...)
      ↓
Nodemailer
      ↓
Configured SMTP/email provider
      ↓
User's inbox
```

Keep the email transport configuration entirely server-side.

------------------------------------------------------------------------

# 15. Email Environment Variables

Email credentials/secrets must never be placed in React code.

Use backend environment variables.

For example, depending on the selected SMTP configuration:

``` text
EMAIL_HOST=...
EMAIL_PORT=...
EMAIL_USER=...
EMAIL_PASSWORD=...
```

If the chosen provider requires different configuration, follow its
standard environment-variable approach.

Update `.env.example` with placeholders if the project uses one.

Never commit actual credentials.

Never expose credentials in:

-   React
-   API responses
-   logs
-   documentation
-   Git
-   client-side environment variables

If using Vite, do NOT put email secrets into variables prefixed with
`VITE_`.

------------------------------------------------------------------------

# 16. Email Template

Create a reusable email template.

Suggested structure:

``` text
Subject:
Reminder: {companyName} OA is tomorrow

Body:

Hi {userName},

Just a reminder that your Online Assessment for
{companyName} is scheduled for tomorrow.

Date: {oaDate}
Time: {oaTime}

Make sure you're prepared and ready.

Good luck!

— PrepBoard
```

The exact wording can be polished, but keep it:

-   short
-   professional
-   friendly
-   useful
-   clearly identifiable as a PrepBoard reminder

The template should accept dynamic values such as:

``` javascript
{
    userName,
    companyName,
    oaDate,
    oaTime
}
```

Do not hardcode company names or user names.

If the existing project has an established naming convention for the
company field, use it.

------------------------------------------------------------------------

# 17. HTML + Plain Text

Prefer generating a simple HTML email with a plain-text fallback.

Do not create a complicated marketing email.

The email should remain readable on mobile and desktop.

A simple structure is enough:

``` text
PrepBoard
──────────────

OA Reminder

Hi Heet,

Your Online Assessment for Amazon is tomorrow.

Date: 17 August 2026
Time: 10:00 AM

Good luck!
```

Do not introduce unnecessary email template frameworks.

------------------------------------------------------------------------

# 18. Marking the Reminder as Sent

After the email is successfully sent:

``` text
oaReminderSent = true
```

Do NOT mark it as sent before the email succeeds.

Correct:

``` text
send email
    ↓
success
    ↓
set oaReminderSent = true
```

Incorrect:

``` text
set oaReminderSent = true
    ↓
send email
    ↓
email fails
```

The second approach could permanently prevent the user from receiving
the reminder.

------------------------------------------------------------------------

# 19. Duplicate Prevention and Race Conditions

The system must prevent duplicate emails as much as reasonably possible
for this MVP.

The main protection is:

``` text
oaReminderSent === false
```

However, think about what happens if two scheduler executions overlap.

For example:

``` text
Job A finds Amazon
Job B finds Amazon
Job A sends email
Job B also sends email
```

If practical, use an atomic database update/claim mechanism or another
simple approach to prevent this.

Do NOT overengineer this with Redis or distributed locks.

A reasonable simple strategy is to atomically claim the reminder before
sending, using a dedicated state such as:

``` text
oaReminderStatus:
    pending
    sending
    sent
```

OR use an atomic conditional update if it can be done safely.

However, prefer the **simplest reliable solution compatible with the
existing schema**.

The implementation agent should inspect the current project and explain
the chosen approach before implementing it.

The final implementation must make a reasonable attempt to guarantee
that the 05:00 and 23:00 jobs do not send the same reminder twice.

------------------------------------------------------------------------

# 20. What Happens if the 05:00 Job Fails?

The 23:00 job should act as the backup.

Example:

``` text
05:00
    ↓
Amazon reminder should be sent
    ↓
Email provider temporarily fails
    ↓
oaReminderSent remains false
```

At 23:00:

``` text
Find Amazon
    ↓
oaReminderSent = false
    ↓
Try again
    ↓
Email succeeds
    ↓
oaReminderSent = true
```

This is one of the major reasons for having the second daily check.

------------------------------------------------------------------------

# 21. What Happens if the User Adds an OA After 05:00?

Example:

``` text
05:00
No Google OA exists

02:00 PM
User adds:
Google
OA - Upcoming
OA date = tomorrow

11:00 PM
Reminder job runs
    ↓
Finds Google
    ↓
oaReminderSent = false
    ↓
Send email
    ↓
Mark sent
```

This scenario MUST work.

------------------------------------------------------------------------

# 22. What Happens if the User Adds an OA After 23:00?

Example:

``` text
11:00 PM
No Microsoft OA exists

11:30 PM
User adds Microsoft OA for tomorrow
```

The two scheduled checks will not catch it.

This is an acknowledged MVP edge case.

Do NOT silently add a complex third scheduler just to handle this unless
the agent identifies a very simple existing mechanism that can safely
solve it.

The implementation should document this behavior.

If the agent believes a simple creation/update-triggered check is
preferable, it should propose that separately rather than silently
expanding the scope.

------------------------------------------------------------------------

# 23. Status Changes

The reminder should only be sent when the application currently has:

``` text
OA - Upcoming
```

If an application was originally `OA - Upcoming` but is changed to
another status before the reminder job runs, it should not receive an OA
reminder.

Example:

``` text
Amazon
OA - Upcoming
    ↓
User changes status
    ↓
Interview
    ↓
05:00 reminder check
    ↓
Not eligible
```

The current database state should always be used.

------------------------------------------------------------------------

# 24. Editing an OA

Think carefully about what happens if the user edits an existing
upcoming OA.

Example:

``` text
Amazon
OA date = August 17
oaReminderSent = true
```

Then the user changes it to:

``` text
OA date = August 20
```

The implementation should ensure that the reminder state remains
logically correct.

A previously sent reminder for August 17 must not incorrectly prevent
the reminder for August 20.

Therefore, inspect the existing edit/update flow and design the reminder
field accordingly.

One simple approach is to reset:

``` text
oaReminderSent = false
```

when the OA date/time is changed while the status remains
`OA - Upcoming`.

Do not implement this blindly; inspect the existing update controller
and model first.

Document the chosen behavior.

------------------------------------------------------------------------

# 25. Application Creation

When creating a new:

``` text
OA - Upcoming
```

application, the reminder state should start as:

``` text
oaReminderSent = false
```

The backend should be the source of truth for this.

Do not trust a frontend-provided value.

If an application is created with another status, the reminder field can
remain at its default value without affecting the reminder query.

------------------------------------------------------------------------

# 26. Chatbot Integration

PrepBoard already has an NLP chatbot that can create and update
applications.

The existing chatbot must remain compatible with this feature.

For example:

``` text
User:
"I applied to Amazon and my OA is tomorrow."
```

If the chatbot creates an:

``` text
OA - Upcoming
```

application with a valid `oaDate`, the reminder system should eventually
detect it.

Likewise, if the chatbot changes an existing application to:

``` text
OA - Upcoming
```

and provides the OA date, the reminder system should be able to process
it.

Do NOT create a second reminder mechanism specifically for the chatbot.

The chatbot already operates through the backend and authenticated user
identity, so the reminder system should simply consume the resulting
application data.

------------------------------------------------------------------------

# 27. Authentication and Privacy

Do not change the authentication architecture for this feature.

The existing authentication uses:

``` text
React
    ↓
Express
    ↓
auth middleware
    ↓
req.user.id
    ↓
Application.userId
```

The reminder job runs server-side and should use the application's
`userId` to find the corresponding user.

Never send a user's OA information to another user's email.

Never query all users' data and then rely on frontend filtering.

The reminder job should explicitly associate:

``` text
Application → User → Email
```

------------------------------------------------------------------------

# 28. No Frontend Email Logic

Do NOT:

-   send email from React
-   expose SMTP credentials to React
-   call an email provider directly from the browser
-   make the reminder depend on the dashboard being open
-   use `useEffect` or `setInterval` in React for email delivery

The existing frontend OA deadline automation can remain as-is because it
serves a different purpose: keeping the dashboard state updated.

The email reminder must be backend-driven.

------------------------------------------------------------------------

# 29. Logging

Add useful backend logs.

Examples:

``` text
[OA Reminder] Starting reminder check
[OA Reminder] Found 3 eligible applications
[OA Reminder] Sending reminder for Amazon to user ...
[OA Reminder] Reminder sent successfully for Amazon
[OA Reminder] Failed to send reminder for Google: ...
[OA Reminder] Reminder check completed
```

Do NOT log:

-   passwords
-   JWTs
-   SMTP passwords
-   full authentication cookies
-   sensitive secrets

Logging should make debugging the scheduler easy.

------------------------------------------------------------------------

# 30. Error Handling

One email failure must not terminate the entire reminder job.

Example:

``` text
Amazon → email succeeds
Google → email fails
Microsoft → email succeeds
```

The job should still process Microsoft.

Use per-application error handling where appropriate.

At the end, the job should provide useful information about:

-   number of eligible applications
-   successful sends
-   failed sends
-   skipped/already-sent applications

Do not expose internal errors to users through the frontend because this
is a background job.

------------------------------------------------------------------------

# 31. Server Startup

The scheduler should be initialized when the backend server starts.

However:

-   Do not accidentally start multiple scheduler instances within the
    same process.
-   Do not initialize the scheduler repeatedly during module imports.
-   Make sure development hot-reload does not unintentionally create
    many duplicate jobs if the current development architecture could
    trigger that.

Inspect the actual backend entry point before deciding where
initialization belongs.

------------------------------------------------------------------------

# 32. Deployment Consideration

This feature assumes the backend process is running at the scheduled
times.

The implementation agent must inspect the project's expected deployment
environment.

If the backend is deployed on a platform where long-running Node
processes may sleep, restart, or scale to multiple instances, document
the implications.

For this MVP, do not introduce external infrastructure unless the
existing deployment requires it.

The scheduler should be implemented in a way that is easy to replace
later with a managed cron/scheduled-job service if PrepBoard moves to
such an environment.

------------------------------------------------------------------------

# 33. Do Not Overengineer

This is an MVP feature.

Do NOT introduce:

-   Redis
-   BullMQ
-   RabbitMQ
-   Kafka
-   microservices
-   separate notification database
-   complex event buses
-   WebSockets
-   Firebase Cloud Functions
-   a full notification framework
-   unnecessary frontend state
-   unnecessary UI changes

The desired architecture is intentionally simple:

``` text
Node scheduler
      ↓
MongoDB
      ↓
Email service
      ↓
User email
```

------------------------------------------------------------------------

# 34. Implementation Process

Do NOT immediately modify files.

First inspect the actual codebase.

At minimum inspect:

### Backend

-   `backend/server.js`
-   `backend/models/Application.js`
-   `backend/models/User.js`
-   `backend/controllers/applicationController.js`
-   `backend/controllers/chatbotController.js`
-   relevant routes
-   `package.json`
-   existing environment configuration
-   existing date/time handling

### Frontend

-   application form
-   application editing logic
-   `useApplications`
-   any API helper used for application creation/update

### Documentation

Read the existing project documentation related to:

-   authentication
-   OA automation
-   project architecture

The implementation must fit the actual codebase.

Do not blindly follow paths in this prompt if the repository structure
differs.

------------------------------------------------------------------------

# 35. Implementation Milestones

Implement in these logical stages.

## Milestone 1 --- Inspect existing architecture

Identify:

-   current Application schema
-   current User schema
-   current application CRUD
-   current OA date/time storage format
-   current authentication relationship
-   current server startup
-   package/dependency setup

Before changing anything, explain the findings briefly.

------------------------------------------------------------------------

## Milestone 2 --- Application reminder state

Add the minimal required reminder tracking field.

Verify:

-   default value
-   creation behavior
-   update behavior
-   OA date/time editing behavior

------------------------------------------------------------------------

## Milestone 3 --- Email service

Create the server-side email service.

Verify:

-   environment variables
-   SMTP configuration
-   successful test email path
-   error handling

Do not hardcode credentials.

------------------------------------------------------------------------

## Milestone 4 --- Email template

Create the reusable OA reminder template.

Verify that it dynamically receives:

-   user name
-   company
-   OA date
-   OA time

------------------------------------------------------------------------

## Milestone 5 --- Reminder job

Implement:

``` text
checkAndSendOAReminders()
```

It should:

1.  Calculate tomorrow's date.
2.  Find eligible `OA - Upcoming` applications.
3.  Resolve each application to its user.
4.  Send the email.
5.  Mark the reminder as sent only after successful delivery.
6.  Continue processing if one email fails.

------------------------------------------------------------------------

## Milestone 6 --- Scheduler

Schedule the same reminder function:

``` text
05:00 AM
11:00 PM
```

Do not duplicate reminder logic.

------------------------------------------------------------------------

## Milestone 7 --- Integration with create/update flows

Ensure that:

-   new upcoming OAs start with reminder unsent
-   changing an OA date/time behaves correctly
-   changing status away from `OA - Upcoming` prevents the reminder
-   chatbot-created/upgraded OAs remain compatible

------------------------------------------------------------------------

## Milestone 8 --- Verification

Test all important scenarios.

------------------------------------------------------------------------

# 36. Required Test Scenarios

The implementation is not complete until these scenarios are considered.

### Scenario 1 --- Existing OA before 5 AM

``` text
Application:
OA - Upcoming
OA date = tomorrow
oaReminderSent = false

05:00 check

Expected:
Email sent
oaReminderSent = true
```

------------------------------------------------------------------------

### Scenario 2 --- Same OA checked again at 11 PM

``` text
OA - Upcoming
OA date = tomorrow
oaReminderSent = true

11:00 PM check

Expected:
No email
```

This scenario is especially important.

The 11 PM check must not duplicate the morning email.

------------------------------------------------------------------------

### Scenario 3 --- OA added after morning check

``` text
05:00 → no OA

14:00 → user creates OA for tomorrow

23:00 → reminder job
```

Expected:

``` text
Email sent
```

------------------------------------------------------------------------

### Scenario 4 --- 5 AM email fails

``` text
05:00 → email provider fails
oaReminderSent remains false

23:00 → job runs again
```

Expected:

``` text
Email attempted again
```

------------------------------------------------------------------------

### Scenario 5 --- Status changed

``` text
OA - Upcoming
    ↓
Interview
```

Expected:

``` text
No OA reminder
```

------------------------------------------------------------------------

### Scenario 6 --- OA date changed

``` text
OA = tomorrow
Reminder sent

User changes OA date to another future date
```

Expected:

The system must be able to send a reminder for the newly scheduled OA.

------------------------------------------------------------------------

### Scenario 7 --- Multiple users

``` text
User A → Amazon OA tomorrow
User B → Google OA tomorrow
```

Expected:

``` text
Amazon email → User A
Google email → User B
```

Never cross-send.

------------------------------------------------------------------------

### Scenario 8 --- Multiple OAs for one user

``` text
User A:
Amazon → tomorrow
Google → tomorrow
Microsoft → tomorrow
```

Expected:

The user receives the appropriate reminders for all eligible
applications.

Do not accidentally send only one reminder because of a query or loop
bug.

------------------------------------------------------------------------

### Scenario 9 --- Missing OA date

``` text
OA - Upcoming
oaDate missing
```

Expected:

No email.

Job should continue normally.

------------------------------------------------------------------------

### Scenario 10 --- Browser closed

Close the frontend completely.

Leave the backend running.

Expected:

The scheduled backend job still sends the reminder.

This proves the feature is not dependent on React.

------------------------------------------------------------------------

# 37. Final Architecture

The final implementation should approximately resemble:

``` text
                         MongoDB
                            │
                ┌───────────┴───────────┐
                │                       │
           Application                User
                │                       │
             userId ───────────────────┘
                │
                │
                ▼
        OA Reminder Scheduler
             │        │
          05:00     23:00
             │        │
             └────┬───┘
                  ▼
       checkAndSendOAReminders()
                  │
                  ▼
        Find tomorrow's OAs
                  │
                  ▼
        oaReminderSent = false?
             │            │
            NO           YES
             │            │
          skip            ▼
                     Email Service
                          │
                          ▼
                    Email Template
                          │
                          ▼
                      Nodemailer
                          │
                          ▼
                     User's Inbox
                          │
                          ▼
                  oaReminderSent=true
```

------------------------------------------------------------------------

# 38. Final Implementation Requirements

Before declaring the feature complete, verify all of the following:

-   [ ] Backend scheduler exists.
-   [ ] Scheduler runs at 05:00 every day.
-   [ ] Scheduler runs again at 23:00 every day.
-   [ ] Both schedules call the same reminder-check function.
-   [ ] Only `OA - Upcoming` applications are considered.
-   [ ] OA date must represent tomorrow.
-   [ ] Applications without a valid OA date are skipped safely.
-   [ ] User email comes from the associated User document.
-   [ ] User name comes from the associated User document.
-   [ ] Email contains company name.
-   [ ] Email contains OA date.
-   [ ] Email contains OA time.
-   [ ] Email uses a reusable template.
-   [ ] Email credentials are server-side only.
-   [ ] No email logic exists in React.
-   [ ] Reminder is not sent twice.
-   [ ] The 23:00 backup does not resend a 05:00 reminder.
-   [ ] Failed 05:00 emails can be retried by the 23:00 check.
-   [ ] Status changes away from `OA - Upcoming` prevent reminders.
-   [ ] OA date changes are handled correctly.
-   [ ] Chatbot-created/updated applications work with the reminder
    system.
-   [ ] Multiple users remain isolated.
-   [ ] Multiple OAs for one user are handled.
-   [ ] One failed email does not stop the whole job.
-   [ ] Secrets are not committed.
-   [ ] Useful scheduler logs exist.
-   [ ] Existing OA → OA - Completed automation still works.
-   [ ] Existing authentication still works.
-   [ ] Existing application CRUD still works.
-   [ ] Existing chatbot still works.
-   [ ] No unnecessary infrastructure was introduced.

------------------------------------------------------------------------

# 39. Important Final Instruction to the Agent

Treat this as an existing production-like project, not a greenfield
application.

**First inspect the actual codebase.**

Do not assume:

-   file names
-   field names
-   date formats
-   route structures
-   package versions
-   deployment environment
-   existing scheduler libraries

Adapt this specification to the real code.

Preserve all existing functionality.

Do not rewrite unrelated parts of PrepBoard.

The most important behavioral requirement is:

> **Send one OA reminder per eligible upcoming OA, with the 05:00 check
> as the primary check and the 23:00 check as the backup, while ensuring
> the 23:00 check never sends a duplicate reminder for an OA that was
> already successfully reminded at 05:00.**

After implementation, provide a concise summary of:

1.  Files created/modified.
2.  Scheduler implementation.
3.  Email provider/transport used.
4.  How duplicate prevention works.
5.  How the 05:00 + 23:00 schedule works.
6.  Environment variables that must be configured.
7.  Tests/verification performed.
8.  Any known limitations or deployment considerations.
