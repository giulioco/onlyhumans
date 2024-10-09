import { analyzeTweets } from './aiDetector';

const processedTweets = new Set<string>();
const tweetsToAnalyze: { id: string; text: string }[] = [];

function createFlagButton() {
  const button = document.createElement('button');
  button.className = 'css-175oi2r r-1777fci r-bt1l66 r-bztko3 r-lrvibr r-1loqt21 r-1ny4l3l';
  button.setAttribute('aria-label', 'Flag as AI-generated');
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

async function blockUser(username: string) {
  const moreButton = document.querySelector(`[aria-label="More"]`);
  if (moreButton) {
    (moreButton as HTMLElement).click();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const blockButton = document.querySelector('[data-testid="block"]');
    if (blockButton) {
      (blockButton as HTMLElement).click();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const confirmBlockButton = document.querySelector('[data-testid="confirmationSheetConfirm"]');
      if (confirmBlockButton) {
        (confirmBlockButton as HTMLElement).click();
      }
    }
  }
}

async function processTweets() {
  const tweetElements = document.querySelectorAll('[data-testid="tweet"]');
  tweetElements.forEach((tweetElement) => {
    const tweetId = tweetElement.getAttribute('data-tweet-id');
    const tweetTextElement = tweetElement.querySelector('[data-testid="tweetText"]');
    if (tweetId && tweetTextElement && !processedTweets.has(tweetId)) {
      const tweetText = tweetTextElement.textContent || '';
      tweetsToAnalyze.push({ id: tweetId, text: tweetText });
      processedTweets.add(tweetId);
    }
  });

  if (tweetsToAnalyze.length >= 10) {
    chrome.storage.local.get(['apiKey'], async (result) => {
      if (result.apiKey) {
        const results = await analyzeTweets(tweetsToAnalyze, result.apiKey);
        results.forEach((result) => {
          if (result.isAIGenerated) {
            const tweetElement = document.querySelector(`[data-tweet-id="${result.id}"]`);
            if (tweetElement) {
              const actionsElement = tweetElement.querySelector('.css-175oi2r.r-18u37iz.r-1h0z5md');
              if (actionsElement) {
                const flagButton = createFlagButton();
                flagButton.addEventListener('click', async () => {
                  const usernameElement = tweetElement.querySelector('[data-testid="User-Name"] a');
                  if (usernameElement) {
                    const username = usernameElement.textContent?.trim() || '';
                    await blockUser(username);
                  }
                  chrome.runtime.sendMessage({
                    action: 'flagTweet',
                    tweet: { id: result.id, text: tweetsToAnalyze.find(t => t.id === result.id)?.text || '' }
                  });
                  tweetElement.style.border = '2px solid red';
                  tweetElement.style.borderRadius = '8px';
                });
                actionsElement.insertBefore(flagButton, actionsElement.firstChild);
              }
            }
          }
        });
        tweetsToAnalyze.length = 0;
      }
    });
  }
}

// Run on page load and whenever the DOM changes
processTweets();
const observer = new MutationObserver(processTweets);
observer.observe(document.body, { childList: true, subtree: true });