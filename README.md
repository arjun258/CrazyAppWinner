# 🍌 The Banana Bureau
depolyed url : 
https://arjun258.github.io/CrazyAppWinner/

> Congratulations! You've won ONE (1) FREE BANANA. Just a few quick formalities.

An intentionally absurd website. To claim a free banana, you must survive the
**Ministry of Absolutely Necessary Paperwork**, run by Gerald, an anxious pigeon in a tie.

## Run it

No build step and no dependencies. Either:

- double-click `index.html`, or
- serve the folder (recommended, so the microphone works everywhere):
  ```bash
  python3 -m http.server 8642
  ```
  then open http://localhost:8642

To deploy, drag the folder onto Netlify Drop, or push it to GitHub Pages.

## The journey

| # | Department | The absurdity |
|---|---|---|
| 00 | Lobby | A cookie banner that is an actual cookie (it gets eaten). A giant green **NO** button. The real way forward is the word "here" hidden in the small print. |
| 01 | Identity | Phone number on a single 10-billion-value slider, birthday by slot machine, letters that swap if you type too fast, a pre-checked "I do NOT accept" box, and a spam checkbox that re-checks itself. |
| 02 | Passwords | 15 escalating rules (digits sum to 25, moon phase emoji, Roman numeral, must rhyme with banana, prime length…). **Kevin the goldfish** lives in your password and drinks the 💧 drops. If he dies, your password is deleted out of respect. |
| 03 | Sound Regulations | Set the volume to exactly 42% with a leaky bicycle pump (it can burst) or a catapult. The site's real volume follows along. |
| 04 | Not-a-Robot | Select the bananas that are lying, rotate a duck until it is emotionally upright, find the square that is thinking about you. |
| 05 | Submission | The SUBMIT button runs away, teleports and calls decoys. **Scream into your mic** to blow it into the mailbox (or hold SPACE). |
| 06 | Waiting | A progress bar that lies, plus a mini-game: catch 15 bananas while Gerald swoops in to steal them. |
| 07 | Ceremony | Certificate, fanfare, confetti… then Gerald eats your banana. VOID stamp, sad trombone, credits with your stats. The replay button runs away, and round two is **upside down**. |

## Everywhere chaos

- Gerald narrates everything. Click him for life advice. Stop moving and he pecks your cursor.
- 🦆 Duck Support live chat (it only quacks).
- 🪂 Gravity button: the page falls apart.
- 🌙 Dark mode: the lights go off and you get a flashlight.
- Random popups: banana updates, hot single bananas, a cat check, a survey that cries.
- Wrong clock, weather "Currently: vibes", a visitor counter that counts down, Terms & Conditions that speed up when you read them.
- Language selector: English / Pigeon / Banana / SHOUTING.
- Konami code (↑↑↓↓←→←→BA): disco mode.
- ⏭️ "Skip (judges only)" button to jump between departments.

## Tech

Plain HTML, CSS and vanilla JS. Every sound effect and most of the background music
(7 original songs) are synthesised live with the Web Audio API. The Password and
Waiting departments play a recorded track (`audio/bureau-track.m4a`). In upside-down
mode the synth melodies are mirrored and the recorded track slows down. The characters are hand-drawn inline SVG.

```
index.html
css/style.css        global look, Gerald, popups, chat, splash
css/depts.css        per-department styles
js/util.js           helpers + banana/Kevin SVG art
js/sound.js          synthesised sound effects
js/music.js          step sequencer + songs + recorded-track player
audio/               recorded track for Password + Waiting
js/gerald.js         Gerald SVG + speech engine
js/chaos.js          popups, duck chat, gravity, lights, widgets, konami, confetti
js/app.js            router, state, progress, splash
js/depts/*.js        one file per department
```
