Get all users email who star a repo

## How to use
```
git clone https://github.com/Lenny4/find-stargazers-emails.git
cd find-stargazers-emails
echo -e 'TOKEN=\nGITHUB_REPO='> .env.local
```

Go to https://github.com/settings/tokens/new to generate a token

Then place your token and github repo url in `.env.local`

```bash
docker compose up --build
```

Emails will be avaible in `src/data/email.json`
