import { analyzeTweets } from "./aiDetector";

const processedTweets = new Set<string>();
let flaggedTweets = new Set<string>();
const tweetsToAnalyze: { id: string; text: string }[] = [];

// Custom debounce function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce(func: (...args: any[]) => void, wait: number) {
  let timeout: NodeJS.Timeout | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (...args: any[]) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

function createFlagButton() {
  const button = document.createElement("button");
  button.className =
    "css-175oi2r r-1777fci r-bt1l66 r-bztko3 r-lrvibr r-1loqt21 r-1ny4l3l";
  button.setAttribute("aria-label", "Flag as AI-generated");
  button.innerHTML = `
    <div dir="ltr" class="css-146c3p1 r-bcqeeo r-1ttztb7 r-qvutc0 r-37j5jr r-a023e6 r-rjixqe r-16dba41 r-1awozwy r-6koalj r-1h0z5md r-o7ynqc r-clp7b1 r-3s2u2q" style="text-overflow: unset; color: rgb(83, 100, 113);">
      <div class="css-175oi2r r-xoduu5">
        <div class="css-175oi2r r-xoduu5 r-1p0dtai r-1d2f490 r-u8s1d r-zchlnj r-ipm5af r-1niwhzg r-sdzlij r-xf4iuw r-o7ynqc r-6416eg r-1ny4l3l"></div>
        <svg viewBox="0 0 24 24" aria-hidden="true" class="r-4qtqp9 r-yyyyoo r-dnmrzs r-bnwqim r-lrvibr r-m6rgpd r-1xvli5t r-1hdv0qi">
          <g fill="none" stroke="none">
            <path d="M4 2V22" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
            <path d="M5 4H19V12H5Z" fill="red"></path>
          </g>
        </svg>
      </div>
    </div>
  `;
  return button;
}

async function blockUser() {
  const moreButton = document.querySelector(`[aria-label="More"]`);
  if (moreButton) {
    (moreButton as HTMLElement).click();
    await new Promise((resolve) => setTimeout(resolve, 500));

    const blockButton = document.querySelector('[data-testid="block"]');
    if (blockButton) {
      (blockButton as HTMLElement).click();
      await new Promise((resolve) => setTimeout(resolve, 500));

      const confirmBlockButton = document.querySelector(
        '[data-testid="confirmationSheetConfirm"]'
      );
      if (confirmBlockButton) {
        (confirmBlockButton as HTMLElement).click();
      }
    }
  }
}

function applyFlagToTweet(tweetElement: Element, tweetId: string) {
  const actionsElement = tweetElement.querySelector(
    ".css-175oi2r.r-1awozwy.r-18u37iz.r-1cmwbt1.r-1wtj0ep"
  );
  if (actionsElement && !actionsElement.querySelector(".ai-flag-button")) {
    const flagButton = createFlagButton();
    flagButton.classList.add("ai-flag-button");
    flagButton.addEventListener("click", async () => {
      const usernameElement = tweetElement.querySelector(
        '[data-testid="User-Name"] a'
      );
      if (usernameElement) {
        await blockUser();
        console.log(`Blocked user for tweet ${tweetId}`);
      }
    });
    actionsElement.insertBefore(flagButton, actionsElement.firstChild);
    console.log(`Flag button added to tweet ${tweetId}`);
    (tweetElement as HTMLElement).style.border = "2px solid red";
    (tweetElement as HTMLElement).style.borderRadius = "8px";
    console.log(`Applied red border to tweet ${tweetId}`);
  }
}

async function loadFlaggedTweets() {
  return new Promise<Set<string>>((resolve) => {
    chrome.storage.local.get(["flaggedTweets"], (result) => {
      if (result.flaggedTweets) {
        resolve(new Set(result.flaggedTweets));
      } else {
        resolve(new Set());
      }
    });
  });
}

async function saveFlaggedTweets() {
  await chrome.storage.local.set({ flaggedTweets: Array.from(flaggedTweets) });
}

async function processTweets() {
  const tweetElements = document.querySelectorAll(
    'article[data-testid="tweet"]'
  );

  tweetElements.forEach((tweetElement) => {
    const tweetLink = tweetElement.querySelector('a[href*="/status/"]');
    let tweetId = null;
    if (tweetLink) {
      const href = tweetLink.getAttribute("href");
      const match = href?.match(/\/status\/(\d+)/);
      if (match) {
        tweetId = match[1];
      }
    }
    const tweetTextElement = tweetElement.querySelector(
      '[data-testid="tweetText"]'
    );

    if (tweetId) {
      if (flaggedTweets.has(tweetId)) {
        applyFlagToTweet(tweetElement, tweetId);
      } else if (
        tweetTextElement &&
        !processedTweets.has(tweetId) &&
        !tweetElement.querySelector(".ai-flag-button")
      ) {
        const tweetText = tweetTextElement.textContent || "";
        tweetsToAnalyze.push({ id: tweetId, text: tweetText });
        processedTweets.add(tweetId);
      }
    }
  });

  if (tweetsToAnalyze.length >= 5) {
    chrome.storage.local.get(["apiKey"], async (result) => {
      if (result.apiKey) {
        const results = await analyzeTweets(tweetsToAnalyze, result.apiKey);

        // console.log("Analysis results:", results);

        if (results.length === 0) {
          // console.log("No results from analysis");
          return;
        }

        results.forEach((result) => {
          if (result.isAIGenerated) {
            console.log(`Tweet ${result.id} identified as AI-generated`);
            const tweetElement = document
              .querySelector(
                `article[data-testid="tweet"] a[href*="/status/${result.id}"]`
              )
              ?.closest('article[data-testid="tweet"]');

            if (tweetElement && !flaggedTweets.has(result.id)) {
              applyFlagToTweet(tweetElement, result.id);
              flaggedTweets.add(result.id);
              saveFlaggedTweets();
            }
          }
        });
        tweetsToAnalyze.length = 0;
        console.log("Cleared tweets to analyze array");
      } else {
        console.log("No API key found");
      }
    });
  } else {
    console.log("Not enough tweets to analyze yet");
  }
}

// Initial setup
(async () => {
  flaggedTweets = await loadFlaggedTweets();
  processTweets();
})();

const debouncedProcessTweets = debounce(() => {
  processTweets();
}, 2000);

const observer = new MutationObserver(() => {
  debouncedProcessTweets();
});
observer.observe(document.body, { childList: true, subtree: true });
