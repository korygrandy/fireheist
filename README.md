# Playwright E2E Automation Framework

This project contains a robust **Playwright end-to-end (E2E) testing framework**, initialized with the latest features of Playwright v1.56.

---

## 🔐 Authentication via Global Setup (Best Practice)

This framework uses Playwright's **Global Setup** to manage the authenticated state, which is the fastest way to run authenticated tests.

1.  **Login & Save:** The `e2e.tests/auth.setup.ts` file runs **once** before all tests to log in and save the session data to `auth\user.json`.
2.  **Load State:** All browser projects in `playwright.config.ts` are configured to **automatically load** this saved state, skipping the login UI step for every test and worker.
3.  **Test Example:** See `auth_storage.spec.ts` for an example of a test that starts directly on a protected page.

---

## 🤖 Playwright Test Agents (v1.56)

Playwright v1.56 introduced **Test Agents**, custom AI-driven agents that can assist with test creation, generation, and self-healing.

These agents can be generated using the following command, which creates agent definitions for various AI clients (like VS Code, Claude, or OpenCode):

```bash
npx playwright init-agents --loop=vscode
# or --loop=claude, --loop=opencode
```

**The three core agents are:**
* **🎭 planner:** Explores the application and creates a Markdown test plan.
* **🎭 generator:** Transforms the Markdown plan into actual Playwright Test files.
* **🎭 healer:** Executes the test suite and automatically repairs failing tests.

---

## ⚙️ Configuration Summary

This framework was initialized with the following settings:

| Setting | Value | Impact |
| :--- | :--- | :--- |
| **Test Retries** | **1** | The number of times a test will re-run globally upon failure. |
| **Max Parallel Workers** | **4** | Limits concurrent test file execution. Set to `undefined` if using OS default. |
| **Browser Projects** | **chromium, firefox** | Only these projects are included in `playwright.config.ts`. |
| **Base URL** | **https://kgenterprises.com** | The default application URL. |

### 🛠️ Important Note on Visual Tests

During the initial run, the system creates baseline screenshots for the visual regression test. You **must** manually review these newly created images in the snapshot folder to confirm they represent the correct desired state of the application.

---

## ✨ New API Showcase (v1.56)

The framework's `network_data.spec.ts` test now showcases the new v1.56 methods:
* `page.consoleMessages()`
* `page.pageErrors()`
* `page.requests()`

These methods allow for retrieving recent data without manually setting up page listeners, simplifying network and console assertions.

---

## ▶️ Getting Started

### 1. Run All Tests

```bash
npm test
```

### 2. View the HTML Report

```bash
npm run report
```

### 3. Debugging with UI Mode

```bash
npm run test:ui
```
