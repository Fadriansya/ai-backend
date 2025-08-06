// file: api/ai.js
export const config = {
  api: {
    bodyParser: true, // Pastikan body parser aktif
  },
};

export default async function handler(req, res) {
  // Tambahkan header ini
  res.setHeader("https://fadriansya.github.io/portfolio_website/", "*"); // Atau ganti dengan 'https://your-github-pages-url.github.io' agar lebih aman
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Hanya menerima POST request" });
  }

  const token = process.env.REPLICATE_API_TOKEN;

  if (!token) {
    return res.status(500).json({ error: "Token API belum disetel di environment variables" });
  }

  const { prompt } = req.body || {};

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt tidak ditemukan atau tidak valid" });
  }

  // Ganti dengan version_id model Granite (dari halaman Replicate)
  const version = "a325a0cacfb0aa9226e6bad1abe5385f1073f4c7f8c36e52ed040e5409e6c034";

  try {
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version,
        input: { prompt },
      }),
    });

    const data = await response.json();

    if (!data?.urls?.get) {
      return res.status(500).json({ error: "Gagal mendapatkan URL hasil prediksi", detail: data });
    }

    // Tunggu dulu sebelum polling
    await new Promise((resolve) => setTimeout(resolve, 4000));

    const poll = await fetch(data.urls.get, {
      headers: { Authorization: `Token ${token}` },
    });

    const pollResult = await poll.json();
    const output = pollResult?.output || "Tidak ada output dari model.";

    return res.status(200).json({ jawaban: output });
  } catch (err) {
    console.error("Terjadi error:", err);
    return res.status(500).json({ error: "Terjadi error saat memproses permintaan", detail: err.message });
  }
}
