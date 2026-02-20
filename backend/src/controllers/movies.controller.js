import axios from "axios";

export const proxyTMDB = async (req, res) => {
  let subpath = req.params.splat;

  if (Array.isArray(subpath)) {
    subpath = subpath.join("/");
  } else if (typeof subpath !== "string") {
    subpath = "";
  }

  subpath = subpath.replace(/^\/+/, "");

  const apiKey = process.env.TMDB_API_KEY;
  const readAccessToken =
    process.env.TMDB_READ_ACCESS_TOKEN || process.env.TMDB_ACCESS_TOKEN;
  const params = new URLSearchParams(req.query);
  const headers = {};

  if (apiKey) {
    params.set("api_key", apiKey);
  } else if (readAccessToken) {
    headers.Authorization = `Bearer ${readAccessToken}`;
  } else {
    return res.status(500).json({
      error: "TMDB credentials are not configured on server",
    });
  }

  const queryString = params.toString();
  const url = `https://api.themoviedb.org/3/${subpath}${queryString ? `?${queryString}` : ""}`;

  try {
    const response = await axios.get(url, { headers, timeout: 10000 });
    return res.status(response.status).json(response.data);
  } catch (err) {
    return res
      .status(err.response?.status || 500)
      .json({
        error: "Failed to fetch from TMDB",
        tmdbStatus: err.response?.status || null,
        details: err.response?.data || err.message,
      });
  }
};
