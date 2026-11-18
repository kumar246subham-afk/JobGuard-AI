const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/api/health`);
    if (!res.ok) throw new Error("Health check failed");
    return res.json();
  },

  async getDatasetStatus() {
    const res = await fetch(`${API_BASE}/api/dataset/status`);
    if (!res.ok) throw new Error("Failed to check dataset status");
    return res.json();
  },

  async getModelStatus() {
    const res = await fetch(`${API_BASE}/api/model/status`);
    if (!res.ok) throw new Error("Failed to fetch model status");
    return res.json();
  },

  async getModelMetrics() {
    const res = await fetch(`${API_BASE}/api/model/metrics`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Model metrics not available");
    }
    return res.json();
  },

  async predictJob(jobData) {
    const res = await fetch(`${API_BASE}/api/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(jobData)
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || "Prediction request failed");
    }
    return data;
  },

  async predictPdf(file) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/api/predict/pdf`, {
      method: "POST",
      body: formData
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || "PDF prediction request failed");
    }
    return data;
  }
};
