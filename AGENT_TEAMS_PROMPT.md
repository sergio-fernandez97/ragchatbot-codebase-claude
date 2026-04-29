Create an agent team for this repository with 3 teammates:

1. Backend teammate
- Owns backend/*
- Responsible for API contracts, response models, and data shaping

2. Frontend teammate
- Owns frontend/*
- Responsible for layout, interactions, accessibility, and visible UI behavior

3. QA teammate
- Does not edit production files unless explicitly reassigned
- Responsible for verification, contrast/readability review, and demo test scenarios

First work in planning mode only.
Do not implement yet.
Use Sonnet for each teammate.
Require plan approval before implementation.

The feature scope is: "Content Health Dashboard for Imported Course Data". Retrive the specifications from Github Issues.

Constraints:
- avoid same-file conflicts
- backend teammate must not edit frontend/*
- frontend teammate must not edit backend/*
- QA teammate should produce a verification checklist
- keep the existing visual style unless readability needs improvement

Use the live-session-delivery skill if helpful.
When the plan is ready, summarize the task breakdown and wait for approval.