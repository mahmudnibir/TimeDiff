# TimeDiff

TimeDiff is a privacy-friendly date and time calculator built as a lightweight React app. It focuses on instant results, keyboard-friendly inputs, and a clean black-and-white interface without accounts, tracking, or backend dependencies.

## Features

- Date difference calculator
- Time difference calculator
- Add and subtract days from a date
- Exact age calculator
- Business-day difference view
- Unix timestamp conversion
- Mobile-friendly, minimal UI
- Copy-to-clipboard result action

## Local development

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Production build

```bash
npm run build
```

## Test suite

```bash
npm test
```

## Notes

This project intentionally keeps the MVP fast and offline-friendly. The logic is isolated in [src/timediff.js](src/timediff.js), and the UI is in [src/App.jsx](src/App.jsx).
