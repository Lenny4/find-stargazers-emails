// https://khalilstemmler.com/blogs/typescript/node-starter-project/
'use strict';

const maxRequestPerHour = 1000;
const waitTime = (3601 / maxRequestPerHour) * 1000; // 1000 request per hour: rate limit https://docs.github.com/en/rest/overview/resources-in-the-rest-api?apiVersion=2022-11-28#rate-limits-for-requests-from-github-actions
const token = process.env.TOKEN;

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
    await new Promise(resolve => setTimeout(resolve, waitTime));
    const stargazers = await (await fetch('https://api.github.com/repos/iperov/DeepFaceLab/stargazers', {
        headers: {
            'Authorization': 'Bearer ' + token,
        }
    })).json();
    console.log(stargazers);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    const user = await (await fetch('https://api.github.com/users/chakson', {
        headers: {
            'Authorization': 'Bearer ' + token,
        }
    })).json();
    console.log(user);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    const events = await (await fetch('https://api.github.com/users/lenny4/events/public', {
        headers: {
            'Authorization': 'Bearer ' + token,
        }
    })).json();
    const emails: string[] = [];
    getEmails(events, emails);
    console.log(emails);
}

start();
