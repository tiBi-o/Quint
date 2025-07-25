import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";

const baseUrl = "http://localhost:3000";

describe("API: /api/prompts", () => {
  let createdId;
  let initialPromptCount;

  // Verify server is running before tests
  beforeAll(async () => {
    try {
      const res = await request(baseUrl).get("/health");
      expect(res.status).toBe(200);

      // Get initial prompt count for cleanup validation
      const prompts = await request(baseUrl).get("/api/prompts");
      initialPromptCount = prompts.body.length;
    } catch (error) {
      throw new Error("Server must be running on " + baseUrl);
    }
  });

  // Cleanup: ensure we don't leave test data behind
  afterAll(async () => {
    if (createdId) {
      try {
        await request(baseUrl).delete(`/api/prompts/${createdId}`);
      } catch (error) {
        console.warn("Cleanup failed for prompt:", createdId);
      }
    }
    // Verify we didn't leave any test data
    const prompts = await request(baseUrl).get("/api/prompts");
    expect(prompts.body.length).toBe(initialPromptCount);
  });

  it("should create a prompt", async () => {
    const testPrompt = { prompt: "Test prompt" };
    const res = await request(baseUrl).post("/api/prompts").send(testPrompt);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(typeof res.body.id).toBe("number");
    createdId = res.body.id;
  });

  it("should get all prompts", async () => {
    const res = await request(baseUrl).get("/api/prompts");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Verify our created prompt is included
    expect(res.body.some((p) => p.id === createdId)).toBe(true);
  });

  it("should get a prompt by id", async () => {
    const res = await request(baseUrl).get(`/api/prompts/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", createdId);
    expect(res.body).toHaveProperty("prompt");
  });

  it("should handle non-existent prompt id", async () => {
    const res = await request(baseUrl).get("/api/prompts/99999");
    expect(res.status).toBe(404);
  });

  it("should update a prompt", async () => {
    const updatedPrompt = { prompt: "Updated prompt" };
    const res = await request(baseUrl)
      .put(`/api/prompts/${createdId}`)
      .send(updatedPrompt);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("changes");

    // Verify the update
    const check = await request(baseUrl).get(`/api/prompts/${createdId}`);
    expect(check.body.prompt).toBe(updatedPrompt.prompt);
  });

  it("should delete a prompt", async () => {
    const res = await request(baseUrl).delete(`/api/prompts/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("changes");

    // Verify deletion
    const check = await request(baseUrl).get(`/api/prompts/${createdId}`);
    expect(check.status).toBe(404);
    createdId = null; // Clear ID since we deleted it
  });
});
