# Run Knotty at home

The app runs on your computer. Your phones open it over your home Wi-Fi.
Local practice captures stay in page memory on the device you use, until you
discard them or close the page. Optional cloud analysis sends selected stills
to xAI only when configured and explicitly submitted; it is off in this local
built mode. Settings, limits, journal and boundaries are saved in browser storage.

## What you need

- A Mac or Windows computer, on your home Wi-Fi, staying awake while you use it.
- The latest Node 22.x — free, from https://nodejs.org/en/download/archive/v22.
  On Windows, `start.cmd` prefers Node 22 on PATH, otherwise it uses the private
  `%LOCALAPPDATA%\node22\node.exe` installation (keep its `npm.cmd` and npm files
  alongside it). System Node 24 can stay installed.
- The unzipped `coaching` folder (double-click `coaching-updated.zip`).

## Start it

**Mac:** open the `coaching` folder, then open **Terminal** (press Cmd+Space,
type `Terminal`, press Return). Paste this and press Return:

```
cd ~/Downloads/coaching && sh start.sh
```

(If you unzipped it somewhere else, put that folder's path after `cd ` instead.)

**Windows:** open the `coaching` folder, click the address bar at the top of the
window, type `cmd`, press Return, then type:

```
start.cmd
```

The first run installs what it needs and builds the app — a few minutes.
After that it starts in seconds unless the app changed; updates rebuild
automatically. It opens your default browser once the server is ready. Windows
keeps the window open if startup fails so you can read the error.

## Open it on your phones

The window prints lines like:

```
  On this computer:   http://localhost:8080
  On your phones:     http://192.168.50.14:8080
  Username:  us
  Password:  kq7m2x
```

The plain-HTTP **On your phones** address works for browsing/importing photos on
a trusted home Wi-Fi, but **live phone cameras need HTTPS**. Basic-auth passwords
are not encrypted over HTTP. Use the HTTPS Tailscale instructions below for
private phone access and live capture. Enter the username and password when asked.

- **iPhone:** Share → **Add to Home Screen** to get an app icon.
- **Android:** menu (⋮) → **Install app** / **Add to Home screen**.
- Allow camera access when using HTTPS (or localhost on the laptop).

## Stopping it

Press Ctrl+C in the window, or just close the window.

## Changing your password

Delete `password.txt` in the folder and start again — a new password is made.
Or set it yourself before starting:

```
SITE_PASSWORD=mylongpassword sh start.sh
```

Windows Command Prompt:

```bat
set "SITE_PASSWORD=mylongpassword"
start.cmd
```

## Using it away from home

Install [Tailscale](https://tailscale.com) (free) on the computer and both
phones and sign in to the same account. Enable MagicDNS and HTTPS Certificates
in Tailscale's DNS settings. With the app running, run:

```sh
tailscale serve --bg --https=443 http://localhost:8080
```

Open the printed `https://laptop....ts.net` address on your phones with Tailscale
connected. This is private to your tailnet. Never use `tailscale funnel`, which
is public. `tailscale serve reset` removes the rule. The laptop must stay awake.

## Good to know

- Each phone keeps its own data (limits, journal, boundaries). Pick one phone as
  the "scene phone" so everything lands in one place.
- Settings → erase removes everything stored on that phone.
- The username/password protects server-handled pages and calls, not static
  assets such as built-in images served directly by the host.
- Your computer's firewall may ask whether to allow incoming connections — say
  yes, or your phones can't reach it.
- Captures are not a photo archive: save a wanted image deliberately before
  closing the page. Browser-local data is per device and per URL/origin; switching
  from localhost to a Tailscale URL does not transfer your journal or limits.
