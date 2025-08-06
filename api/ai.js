// file: api/ai.js
export default async function handler(req, res) {
  const token = process.env.REPLICATE_API_TOKEN;
  const body = req.body;

  // Versi model Granite dari halaman Replicate
  const version = "a325a0cacfb0aa9226e6bad1abe5385f1073f4c7f8c36e52ed040e5409e6c034";

  const prediction = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: version,
      input: { prompt: body.prompt },
    }),
  });

  const predictionResult = await prediction.json();
  const predictionUrl = predictionResult?.urls?.get;

  let output = "Menunggu jawaban...";

  if (predictionUrl) {
    await new Promise((resolve) => setTimeout(resolve, 4000));
    const poll = await fetch(predictionUrl, {
      headers: { Authorization: `Token ${token}` },
    });
    const pollResult = await poll.json();
    output = pollResult?.output || "Tidak ada output.";
  }

  res.status(200).json({ jawaban: output });
}
