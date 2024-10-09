import OpenAI from "openai";

interface TweetAnalysis {
  id: string;
  isAIGenerated: boolean;
}

export async function analyzeTweets(
  tweets: { id: string; text: string }[],
  apiKey: string
): Promise<TweetAnalysis[]> {
  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

  const prompt = `Analyze the following tweets and determine if they are likely to be AI-generated. Return a JSON array with each tweet's ID and a boolean indicating if it's AI-generated. Example: {analysis:[{"id": "123", "isAIGenerated": true}, {"id": "456", "isAIGenerated": false}]}

Tweets to analyze:
${tweets.map((tweet) => `ID: ${tweet.id}\nText: ${tweet.text}\n`).join("\n")}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    console.log("Response from OpenAI:", response.choices[0].message.content);
    const result = JSON.parse(response.choices[0].message.content || "[]");
    return result.analysis.map(
      (item: { id: string; isAIGenerated: boolean }) => ({
        id: item.id,
        isAIGenerated: true,
      })
    );
  } catch (error) {
    console.error("Error analyzing tweets:", error);
    return [];
  }
}
