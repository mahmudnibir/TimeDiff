# TimeDiff

TimeDiff is a fast, private, browser-first time utility for repeated date and time workflows. It is built for people who need instant, structured calculations without explaining the task to a chatbot every time.

## What it does

- Quick mode for natural inputs such as "45 days from today"
- Date difference and duration calculations
- Add and subtract days from a date
- Business-day calculations with custom holiday support
- Custom weekend configuration
- Timezone conversion across all supported IANA time zones
- Recurring date generation
- Unix timestamp conversion
- Shareable calculation links
- Copy-to-clipboard results

## Tech stack

- React
- Vite
- Vitest
- Browser-only local logic

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

## Test suite

```bash
npm test
```

## Open source docs

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [SECURITY.md](SECURITY.md)
- [LICENSE](LICENSE)

## Why this project exists

The product is built around a simple idea: people repeatedly need time math, and a dedicated local tool is more practical, private, and fast than asking a chatbot for the same calculation every time.
