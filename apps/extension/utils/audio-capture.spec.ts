/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { startTabCapture } from "./audio-capture";

// Mock chrome.runtime.sendMessage
const mockSendMessage = jest.fn();
(global as any).chrome = {
  runtime: {
    sendMessage: mockSendMessage,
  },
};

describe("startTabCapture", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should send START_TAB_CAPTURE to background", async () => {
    mockSendMessage.mockImplementation((_msg: any, cb: (r: any) => void) => {
      cb({ ok: true });
    });

    await startTabCapture();
    expect(mockSendMessage).toHaveBeenCalledWith(
      { type: "START_TAB_CAPTURE" },
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
