# 🍌 THE BANANA BUREAU — Idea & Build Plan

> "Congratulations! You've won ONE (1) FREE BANANA. Just a few quick formalities."

## The Story

A visitor lands on a dazzling, flashing page telling them they've won a free banana.
To claim it they must get through the **Ministry of Absolutely Necessary Paperwork**,
run entirely by **Gerald**, an anxious pigeon in a tiny tie who is the Ministry's only
employee, CEO, janitor and emotional support animal.

Each "Department" is one level with an absurd UI challenge. Gerald narrates in a speech
bubble, panics, lies, gives wrong hints, and gets more and more attached to the banana.

**Twist ending:** after the user finally gets the Certificate of Banana Ownership,
with confetti and a fanfare, Gerald eats the banana live on screen.
"Your banana has been successfully delivered… to Gerald." The big replay button runs
away from the cursor. If they catch it, the whole site restarts in **UPSIDE-DOWN MODE**.

## The Journey (Departments)

| # | Department | What happens |
|---|---|---|
| 0 | **Lobby / Cookie Consent** | The cookie banner is a literal cookie that gets eaten bite by bite as you hover. A giant green **NO** button; the real way forward is a tiny word hidden in the paragraph. |
| 1 | **Dept. of Identity** | Name input shuffles letters if you type too fast. Phone number is ONE slider from 000-000-0000 to 999-999-9999. Birthday comes from a spinning slot machine. A pre-checked "I do NOT not agree" checkbox. |
| 2 | **Dept. of Passwords** | Rules get worse one by one: digits add up to 25, today's moon phase emoji, a Roman numeral, Gerald's name, "must rhyme with banana", the current hex colour of a flashing box… **Kevin the goldfish** lives in the password box and dies unless you type 💧 every 25s. |
| 3 | **Dept. of Sound Regulations** | Set the site volume to exactly 42% by pumping a bicycle tyre (drag up and down) or by launching the knob from a catapult. Too much and the tyre bursts. |
| 4 | **Dept. of Not-Being-A-Robot** | Weird CAPTCHAs: "Select all bananas that are lying", "Rotate the duck until it is emotionally upright", "Click the square that's thinking about you". |
| 5 | **Dept. of Submission** | The submit button runs away, teleports and splits into decoys. To give up, **scream into the microphone** to blow it into place (fallback: hold SPACE for 10s while Gerald cheers). |
| 6 | **Dept. of Waiting** | The progress bar goes backwards, makes up excuses ("Reticulating bananas…", "Asking the moon"), and you play a mini-game catching falling bananas while Gerald steals them. |
| 7 | **The Grand Banana Ceremony** | Certificate, confetti, fanfare… Gerald eats the banana. Credits roll in Comic Sans. Runaway replay button → UPSIDE-DOWN MODE. |

## Chaos Layer (on every page)

- **Gerald the Pigeon**: animated SVG mascot with a speech bubble; pecks your cursor when you're idle.
- **Banana cursor** with a trail of tiny bananas.
- **Support chat**: "Live help" from Duck Support, who only replies "quack" (in different tones and with sound).
- **Random interruptions**: "Windows is updating your banana (3%)", "Your session expires in 3s… jk", "Are you still there? Click the cat to prove it".
- **GRAVITY button**: everything on the page falls to the floor and bounces.
- **Dark mode**: turns the lights off and gives you a flashlight cursor.
- **Header widgets**: a clock that's confidently wrong, weather "Currently: vibes", a visitor counter that counts down.
- **Footer**: Terms & Conditions scrolling at 900 mph, language selector (English / Pigeon / Banana / SHOUTING).
- **Satisfaction survey** whose emoji slider cries when you move it.
- **Konami code** → disco mode.

## Look & Feel

- Loud, colourful "early-internet meets candy shop" look: gradients, stickers, wobbly
  borders, marquee text, tilted cards.
- Fonts: Bungee / Fredoka / Comic Neue (Google Fonts).
- Constant micro-animations: wobble, jelly, bounce, shake on error, confetti on success.
- **Sounds**: all made in code with the Web Audio API (boing, honk, slide whistle, kazoo
  fanfare, quack, pop), so there are no audio files and no licensing issues. Mute toggle
  available (through the absurd volume control, of course).
- Images: hand-drawn inline SVG (Gerald, Kevin, the duck, the banana) plus emoji.

## Tech

- Plain **HTML + CSS + vanilla JS (ES modules)**. No build step, so it hosts on GitHub Pages or Netlify with a simple drag and drop.
- CDN libraries: `canvas-confetti` (confetti); gravity is written by hand in a small physics loop.
- Web Audio API for sounds, `getUserMedia` for the scream (with a keyboard fallback).
- State machine: `app.js` routes between departments; each department is its own module.

```
crazyappcontest/
  index.html
  css/   base.css, chaos.css, departments.css
  js/
    app.js          (router + state + progress)
    sound.js        (Web Audio synth effects)
    gerald.js       (mascot + dialogue engine)
    chaos.js        (cursor, popups, gravity, dark mode, duck chat, konami)
    depts/  lobby.js identity.js password.js volume.js captcha.js submit.js waiting.js ceremony.js
  assets/svg/       (gerald, kevin, duck, banana)
```

## Build Phases

1. **Skeleton**: index, router, theme, Gerald plus dialogue engine, sound engine.
2. **Departments 0–2**: Lobby, Identity, Password (the biggest level).
3. **Departments 3–5**: Volume, CAPTCHA, Submit.
4. **Departments 6–7**: Waiting mini-game, Ceremony and ending twist, upside-down mode.
5. **Chaos layer**: popups, duck chat, gravity, dark mode, cursor, footer, Konami.
6. **Polish**: check it works start to finish in the browser, phone layout, sound balance, a "skip level" escape hatch for the judges.
