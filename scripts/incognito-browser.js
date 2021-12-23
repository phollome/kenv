// Menu: Incognito Browser
// Description: Open your favorite browser in incognito/private mode
// Author: Peter Holló
// Log: false

import "@johnlindquist/kit";

const listOfBrowsers = [
  {
    name: "[F]irefox",
    description: 'Opens Firefox with the "-private-window" flag',
    value: "Firefox",
    path: "Firefox.app",
    command: 'open -na "Firefox" --args -private-window',
  },
  {
    name: "[B]rave",
    description: 'Opens Brave with the "-incognito" flag',
    value: "Brave",
    path: "Brave Browser.app",
    command: 'open -na "Brave Browser" --args -incognito',
  },
  {
    name: "[S]afari",
    description: "Runs an Apple Script which emulates key press",
    value: "Safari",
    path: "Safari.app",
    command: `
      tell application "Safari"
        activate
        tell application "System Events"
          keystroke "n" using {command down, shift down}
        end tell
      end tell`,
  },
  {
    name: "[C]hrome",
    description: 'Opens Chrome with the "-incognito" flag',
    value: "Chrome",
    path: "Google Chrome.app",
    command: 'open -na "Google Chrome" --args -incognito',
  },
  {
    name: "[O]pera",
    description: 'Opens Opera with the "-private" flag',
    value: "Opera",
    path: "Opera.app",
    command: 'open -na "Opera" --args -private',
  },
  {
    name: "[E]dge",
    description: 'Opens Edge with the "-inprivate" flag',
    value: "Edge",
    path: "Microsoft Edge.app",
    command: 'open -na "Microsoft Edge" --args -inprivate',
  },
];

async function getFavoriteBrowser(availableBrowsers) {
  const listOfAvailableBrowsers = listOfBrowsers.filter((browser) => {
    const isBrowserAvailable = availableBrowsers.some(
      (item) => item === browser.value
    );
    return isBrowserAvailable;
  });
  const selectedBrowser = await arg(
    {
      placeholder: "Select a your favorite browser",
      hint: "Press first letter for quick select",
    },
    {
      choices: listOfAvailableBrowsers,
    }
  );
  return selectedBrowser;
}

const data = await db({
  availableBrowsers: [],
});

if (data.availableBrowsers.length === 0) {
  for (let i = 0, length = listOfBrowsers.length; i < length; i++) {
    const available = await isDir(`/Applications/${listOfBrowsers[i].path}`);
    if (available) {
      data.availableBrowsers.push(listOfBrowsers[i].value);
    }
  }
  await data.write();
}

if (data.availableBrowsers.length === 0) {
  const browserNames = listOfBrowsers.map((browser) => {
    return browser.value;
  });

  await div(
    `
    <div class="p-4 font-mono text-sm">
      <p class="pb-2">
          No supported browser found!😬
      </p>
      <p>
        Supported browsers are: ${browserNames.join(", ")}.
      <p>
    </div>
    `
  );
}

const favoriteBrowser = await env("FAVORITE_BROWSER", {
  reset: flag?.cmd,
  choices: getFavoriteBrowser.bind(null, data.availableBrowsers),
});

const { command } = listOfBrowsers.find((browser) => {
  return browser.value === favoriteBrowser;
});

if (favoriteBrowser === "Safari") {
  await applescript(command);
} else {
  await exec(command);
}
