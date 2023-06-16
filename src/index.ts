// https://khalilstemmler.com/blogs/typescript/node-starter-project/
'use strict';

import * as fs from "fs";

require('log-timestamp');

const maxRequestPerHour = 1000;
const waitTime = (3601 / maxRequestPerHour) * 1000; // 1000 request per hour: rate limit https://docs.github.com/en/rest/overview/resources-in-the-rest-api?apiVersion=2022-11-28#rate-limits-for-requests-from-github-actions
const token = process.env.TOKEN;
const githubRepo = new URL(process.env.GITHUB_REPO ?? "");

function getEmails(data: any, emails: string[]) {
    for (const key in data) {
        if (key === "email" && !emails.includes(data[key])) {
            emails.push(data[key]);
        }
        if (data[key] !== null && typeof data[key] === 'object') {
            getEmails(data[key], emails);
        }
    }
}

async function start() {
    const emailFilePath = '/srv/app/src/data/email.json';
    if (!fs.existsSync(emailFilePath)) {
        fs.writeFileSync(emailFilePath, JSON.stringify({}));
    }
    let fileContent: any = fs.readFileSync(emailFilePath, {encoding: 'utf8'});
    try {
        fileContent = JSON.parse(fileContent);
    } catch (e) {
        fs.writeFileSync(emailFilePath, JSON.stringify({}));
        fileContent = JSON.parse(fs.readFileSync(emailFilePath, {encoding: 'utf8'}));
    }
    // https://docs.github.com/en/rest/activity/starring?apiVersion=2022-11-28#list-stargazers
    let page = 1;
    const perPage = 100;
    let stargazers = [];
    do {
        await new Promise(resolve => setTimeout(resolve, waitTime));
        stargazers = await (await fetch('https://api.github.com/repos' + githubRepo.pathname + '/stargazers?page=' + page + '&per_page=' + perPage, {
            headers: {
                'Authorization': 'Bearer ' + token,
            }
        })).json();
        console.log(stargazers.length + " stargazers ... [page: " + page + "]");
        for (const [i, stargazer] of stargazers.entries()) {
            console.log("[" + (i + 1) + "/" + stargazers.length + "] user " + stargazer.login);
            if (!fileContent.hasOwnProperty(stargazer.login)) {
                fileContent[stargazer.login] = {
                    username: stargazer.login,
                    name: null,
                    emails: [],
                }
            }
            await new Promise(resolve => setTimeout(resolve, waitTime));
            const user = await (await fetch('https://api.github.com/users/' + stargazer.login, {
                headers: {
                    'Authorization': 'Bearer ' + token,
                }
            })).json();
            // {
            //     login: 'iw0nderhow',
            //     id: 6024426,
            //     node_id: 'MDQ6VXNlcjYwMjQ0MjY=',
            //     avatar_url: 'https://avatars.githubusercontent.com/u/6024426?v=4',
            //     gravatar_id: '',
            //     url: 'https://api.github.com/users/iw0nderhow',
            //     html_url: 'https://github.com/iw0nderhow',
            //     followers_url: 'https://api.github.com/users/iw0nderhow/followers',
            //     following_url: 'https://api.github.com/users/iw0nderhow/following{/other_user}',
            //     gists_url: 'https://api.github.com/users/iw0nderhow/gists{/gist_id}',
            //     starred_url: 'https://api.github.com/users/iw0nderhow/starred{/owner}{/repo}',
            //     subscriptions_url: 'https://api.github.com/users/iw0nderhow/subscriptions',
            //     organizations_url: 'https://api.github.com/users/iw0nderhow/orgs',
            //     repos_url: 'https://api.github.com/users/iw0nderhow/repos',
            //     events_url: 'https://api.github.com/users/iw0nderhow/events{/privacy}',
            //     received_events_url: 'https://api.github.com/users/iw0nderhow/received_events',
            //     type: 'User',
            //     site_admin: false,
            //     name: 'chris',
            //     company: null,
            //     blog: '',
            //     location: 'Germany',
            //     email: null,
            //     hireable: null,
            //     bio: 'he/him ✨',
            //     twitter_username: null,
            //     public_repos: 25,
            //     public_gists: 1,
            //     followers: 13,
            //     following: 21,
            //     created_at: '2013-11-24T16:36:44Z',
            //     updated_at: '2023-05-31T18:31:12Z'
            // }
            fileContent[stargazer.login].name = user.name;
            const emails: string[] = [];
            if (user.email && emails.includes(user.email)) {
                emails.push(user.email);
            }
            await new Promise(resolve => setTimeout(resolve, waitTime));
            const events = await (await fetch('https://api.github.com/users/' + stargazer.login + '/events/public', {
                headers: {
                    'Authorization': 'Bearer ' + token,
                }
            })).json();
            getEmails(events, emails);
            for (const email of emails) {
                if (email && !fileContent[stargazer.login].emails.includes(email)) {
                    fileContent[stargazer.login].emails.push(email);
                }
            }
        }
        fs.writeFileSync(emailFilePath, JSON.stringify(fileContent));
        console.log(stargazers.length + " stargazers done ! [page: " + page + "]");
        page++;
    } while (stargazers.length > 0)
}

start();
