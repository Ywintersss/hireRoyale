<!--toc:start-->

- [Steps to run migrations](#steps-to-run-migrations)
- [Steps to run server](#steps-to-run-server)
<!--toc:end-->

# Steps to run migrations

1. Run `npm i` in the current directory (./talentacquisition/backend)
2. Run `npm run migrate-db`

# Steps to run server

1. Create a `.env` file:

```
PORT=8000
FRONTEND_URL=http://localhost:3000
```

2. Run `npm run server` in the current directory.

## Notes
- API and Socket.IO signaling run on the same port.
- CORS origin is controlled by `FRONTEND_URL`.
- Basic request logging via `morgan`.
