Here’s a **refined version of your README**, tailored for the unit testing project with **Booking Creation** as the core feature, while keeping it clear and GitHub-friendly:

---

# LifEvent

**LifEvent** is an **online wedding restaurant booking and connection platform** designed to simplify the planning of weddings and special events. It provides an intuitive interface for both customers and restaurant owners, helping them manage bookings, view menus, and explore services seamlessly.

## Core Feature for Unit Testing: Booking Creation

This project focuses on **unit testing** the **Booking Creation** feature, which allows customers to:

* Select **restaurant halls** and **menus**
* Specify **event date** and **time slot**
* Choose **dishes**, **services**, and apply **promotions**
* Calculate **prices, discounts, VAT, and totals**

Unit tests verify that the feature works correctly, handles edge cases, and is fully **isolated from the database** using mocked DAOs or static data.

## Key Features

* **Restaurant & Hall Browsing** – Search and filter venues by location, price, capacity, date, and promotions.
* **Booking Management** – Customers can create, view, and manage their bookings.
* **Menu & Service Selection** – View menus, select dishes and additional services, and apply promotions.
* **Owner Management** – Owners can register, submit licenses, and manage halls, menus, and promotions.
* **Admin Dashboard** – Admins can verify licenses, manage commissions, approve owners, and monitor system activities.
* **Negotiation System** – Admins and owners can negotiate commission rates until approval.

## Benefits

* Ensures **robust booking logic** via unit tests.
* Streamlines wedding planning with a centralized platform.
* Provides transparency in pricing, availability, and promotions.

## Tech Stack

* **Frontend:** [Your frontend framework, e.g., React/Next.js]
* **Backend:** Node.js with Express
* **Database:** MySQL / MongoDB
* **Testing:** Jest for unit testing (with mocked DAOs and static data)

---

## ⚙️ Testing

**Jest** is used as the primary testing framework. The project includes NPM scripts for running, watching, and reporting tests.

### 🏃 Testing Commands

| Command                 | Description                        | Use Case                               |
| :---------------------- | :--------------------------------- | :------------------------------------- |
| `npm test`              | Run **all tests** once             | Final checks before commit or CI/CD    |
| `npm run test:watch`    | Run tests in **watch mode**        | Active development, immediate feedback |
| `npm run test:coverage` | Run tests with **coverage report** | Evaluate test coverage                 |

### Usage

**1. Run All Tests**

```bash
npm test
```

**2. Watch Mode**

```bash
npm run test:watch
```

* Runs tests initially and re-runs automatically on file changes.
* Provides an interactive menu for filtering tests by file or name.

**3. Generate Coverage Report**

```bash
npm run test:coverage
```

* Displays summary of lines, functions, branches, and statements coverage in terminal.
* Generates an HTML report in `coverage/index.html` for detailed visualization.