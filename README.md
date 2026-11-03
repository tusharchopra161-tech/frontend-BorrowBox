# BorrowBox

BorrowBox is a small React app for sharing items with a local community. It includes account registration, a demo login, an owner dashboard, and a local item-browsing screen.

## Run locally

```sh
npm install
npm run dev
```

Use the demo account `demo@borrowbox.com` with password `demo1234`, or create an account. Accounts, profiles, and listings are stored in the browser's local storage, so this demo does not sync data between browsers or devices.

## Data API

`src/services/api.js` provides the local persistence API for user registration/login, profiles, owner listings, public listings, and borrowing/lending history. Replace this module with server-backed requests when a backend is available; local storage is for prototyping and is not production authentication or shared persistence.

Available listing fields are title, category, description, optional image URLs (one per line), condition, general location, and lending rules. Owners can edit, pause/resume, or remove their own listings.

## Checks

```sh
npm run lint
npm run build
```
