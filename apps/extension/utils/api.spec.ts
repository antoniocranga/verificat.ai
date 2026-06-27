/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { storage } from "wxt/storage";
import { uploadAudio } from "./api";

jest.mock("wxt/storage", () => ({
  storage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}));

const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

describe("API utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("uploadAudio", () => {
    it("should upload audio with no auth token when not logged in", async () => {
      (storage.getItem as jest.Mock).mockResolvedValue(undefined);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ jobId: "job-123" }),
      });

      const jobId = await uploadAudio(new Blob(["test-audio"]));

      expect(jobId).toBe("job-123");
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/jobs/upload",
        {
          method: "POST",
          headers: { "Content-Type": "audio/webm" },
          body: expect.any(Blob),
        },
      );
    });

    it("should include Authorization header when auth token is present", async () => {
      (storage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === "local:auth_token") {
          return Promise.resolve("test-token-abc");
        }
        return Promise.resolve(undefined);
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ jobId: "job-456" }),
      });

      const jobId = await uploadAudio(new Blob());

      expect(jobId).toBe("job-456");
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/jobs/upload",
        {
          method: "POST",
          headers: {
            "Content-Type": "audio/webm",
            Authorization: "Bearer test-token-abc",
          },
          body: expect.any(Blob),
        },
      );
    });

    it("should throw on HTTP error", async () => {
      (storage.getItem as jest.Mock).mockResolvedValue(undefined);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 413,
        text: () => Promise.resolve("Payload too large"),
      });

      await expect(uploadAudio(new Blob())).rejects.toThrow(
        "Încărcarea a eșuat (413): Payload too large",
      );
    });

    it("should throw on network error", async () => {
      (storage.getItem as jest.Mock).mockResolvedValue(undefined);
      mockFetch.mockRejectedValueOnce(new Error("Network failure"));

      await expect(uploadAudio(new Blob())).rejects.toThrow("Network failure");
    });
  });
});
