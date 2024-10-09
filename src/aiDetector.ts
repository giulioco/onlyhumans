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

  const systemPrompt = `You are an AI detector. You will be given a tweet and you need to determine if it is likely to be AI-generated. Return a JSON array with each tweet's ID and a boolean indicating if it's AI-generated. Example: {analysis:[{"id": "123", "isAIGenerated": true}, {"id": "456", "isAIGenerated": false}]}

  In general AI-generated tweets are:
  - Too perfect: No spelling or grammar mistakes, uses perfect grammar and sentence structure
  - Too positive: Uses overly positive language that doesn't sound natural or genuine
  - Too formal: Uses overly formal language that doesn't sound natural or genuine
  - Too repetitive: Repeats the same message over and over again
  - Not authentic: Doesn't sound like it's coming from a real person
  - If it uses "’" or "‘" instead of "'" or "’", it's most likely AI-generated


  Here are some examples of tweets that are AI-generated:
  - "localization is key, no doubt. gotta meet customers where they’re at—language matters for business."
  - "That's awesome that you added ambient sound and used a compressor on the final mix to enhance the realism of the audio. It's great to see the effort you put into improving the quality of the sound. I agree that audio plays a significant role in minimizing the uncanny feeling..."
  - "This is amazing. A well-equipped gym alongside a program that pushes both mental and physical limits—there’s no better way to build resilience. It's inspiring to see a space that encourages growth in every way. I’m sure this is going to have a lasting impact on everyone involved."
  - "Looks like you accidentally upgraded from the 'freebie' to the 'splurge' option! Snapnames really knows how to surprise us with those hidden fees. Good luck negotiating that price down! 😅"
  `;

  const prompt = `Analyze the following tweets and determine if they are likely to be AI-generated. Return a JSON array with each tweet's ID and a boolean indicating if it's AI-generated. Example: {analysis:[{"id": "123", "isAIGenerated": true}, {"id": "456", "isAIGenerated": false}]}

Tweets to analyze:
${tweets.map((tweet) => `ID: ${tweet.id}\nText: ${tweet.text}\n`).join("\n")}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.analysis || [];
  } catch (error) {
    console.error("Error analyzing tweets:", error);
    return [];
  }
}
