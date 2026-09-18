# BlueSkills Frontend

Frontend application for
[blueskills.bluethroatlabs.com](https://blueskills.bluethroatlabs.com), built
with Next.js.

## Local setup

### Prerequisites

- Node.js 20 or newer
- Yarn 1.x

### Install and run

```bash
yarn install
cp .env.example .env.local
yarn dev
```

Add the required values to `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=""
NEXT_PUBLIC_TURNSTILE_SITE_KEY=""
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production build

```bash
yarn build
yarn start
```

Run `yarn lint` to check the code and `yarn format` to format it.
