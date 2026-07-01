/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { startTabCapture } from "./audio-capture";

// Mock chrome.runtime.sendMessage
const mockSendMessage = jest.fn();
(global as any).chrome = {
  runtime: {
    sendMessage: mockSendMessage,
  },
  offscreen: {
    hasDocument: jest.fn().mockResolvedValue(false),
    createDocument: jest.fn().mockResolvedValue(undefined),
    Reason: {
      USER_MEDIA: "USER_MEDIA",
    },
  },
};

describe("startTabCapture", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should send START_TAB_CAPTURE to background", async () => {
    mockSendMessage.mockImplementation((_msg: any, cb: (r: any) => void) => {
      cb({ streamId: "test-stream-id" });
    });

    await startTabCapture();
    expect(mockSendMessage).toHaveBeenCalledWith(
      { type: "UI_START_STREAM_TAB" },
      expect.any(Function),
    );
  });

  it("should reject when background returns an error", async () => {
    mockSendMessage.mockImplementation((_msg: any, cb: (r: any) => void) => {
      cb({ error: "Eroare test" });
    });

    await expect(startTabCapture()).rejects.toThrow("Eroare test");
  });
});
