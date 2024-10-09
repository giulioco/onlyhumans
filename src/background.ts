chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "flagTweet") {
    chrome.storage.local.get(["flaggedTweets"], (result) => {
      const flaggedTweets = result.flaggedTweets || [];
      const updatedTweets = [...flaggedTweets, message.tweet];
      chrome.storage.local.set({ flaggedTweets: updatedTweets });
    });
  } else if (message.action === "blockAndReport") {
    // Implement blocking and reporting logic here
    console.log(`Blocking and reporting tweet: ${message.tweetId}`);
  }
});
