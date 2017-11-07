# bull.sh
:cow: A website for a school project

## Context

The aim of the project was to act like my team and I were in the position
of creating a startup, in order to apply the skills we learned in the fields of
management, economy, communication and social responsibility.

We came up with the idea of a tool able measure how much a talk could be
corrupted and prone to trick people hearing/reading it, lexically and linguistically speaking.

Despite the fact that we won't release such a tool,
we did everything as if we really were, meaning:
- Business plan
- Marketing studies
- Communication plan
- ...

The present website is meant to be a showcase / business website,
and will include all the documents listed above, and more.

## Usage
### Dev

```shell
npm run dev
```
This will build the project in dev mode:
- Build and bundle js (es6 to es5)
- Build and bundle sass
- Copy assets (fonts, pictures...) and html
- Run the dev server on `http://locahost:3333`
- Watch `src/` and rebuild upon changes (+ show notifications)

### Prod

```shell
npm run prod
```
This will build the project in prod mode:
- Build and bundle js (es6 to es5) + optimize / minimize
- Build and bundle sass + optimize / minimize
- Copy assets (fonts, pictures...) and html
- Cache bust css and js

### Debug

```shell
npm run debug:dev       # Debug in dev mode
npm run debug:prod      # Debug in prod mode
```
Same as dev/prod (depending of the debug mode) but starts a webpack bundle analyzer server as well.

## Template
To save some time, this website is widely based on the following template:

[Spectral by HTML5 UP](https://html5up.net/spectral);
html5up.net | @ajlkn;

Free for personal and commercial use under the CCA 3.0 license ([html5up.net/license](html5up.net/license))

Author: aj@lkn.io | @ajlkn

Credits:

- Demo Images:
    Unsplash (unsplash.com)

- Icons:
    Font Awesome (fortawesome.github.com/Font-Awesome)

- Other:
    jQuery (jquery.com)
    html5shiv.js (@afarkas @jdalton @jon_neal @rem)
    background-size polyfill (github.com/louisremi)
    Misc. Sass functions (@HugoGiraudel)
    Respond.js (j.mp/respondjs)
    Skel (skel.io)