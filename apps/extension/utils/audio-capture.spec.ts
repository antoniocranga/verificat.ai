/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import {
  getConsentStatus,
  setConsentStatus,
  startTabCapture,
  startMicCapture,
} from "./audio-capture";

// Mock storage
const mockStore = new Map<string, any>();
(global as any).storage = {
  getItem: jest
    .fn()
    .mockImplementation((key: string) => Promise.resolve(mockStore.get(key))),
  setItem: jest.fn().mockImplementation((key: string, val: any) => {
    mockStore.set(key, val);
    return Promise.resolve();
  }),
};

// Mock browser API
(global as any).browser = {
  tabCapture: {
    capture: jest.fn(),
  },
};

// Mock navigator mediaDevices
const mockStream = {
  getTracks: () => [{ stop: jest.fn() }],
};
(global as any).navigator = {
  mediaDevices: {
    getUserMedia: jest.fn(),
  },
};

describe("Audio Capture Consent Utilities", () => {
  beforeEach(() => {
    mockStore.clear();
    jest.clearAllMocks();
  });

  it("should return false consent by default", async () => {
    const consent = await getConsentStatus();
    expect(consent).toEqual({ tabConsent: false, micConsent: false });
  });

  it("should allow setting and getting consent status", async () => {
    await setConsentStatus({ tabConsent: true, micConsent: false });
    const consent = await getConsentStatus();
    expect(consent).toEqual({ tabConsent: true, micConsent: false });
  });

  it("should throw an error on tab capture if consent is not granted", async () => {
    await expect(startTabCapture()).rejects.toThrow(
      "Lipsea acordul utilizatorului",
    );
  });

  it("should call browser.tabCapture.capture when tab consent is granted", async () => {
    await setConsentStatus({ tabConsent: true, micConsent: false });
    (global as any).browser.tabCapture.capture.mockImplementation(
      (_opts: any, cb: (s: any) => void) => {
        cb(mockStream);
      },
    );

    const stream = await startTabCapture();
    expect(stream).toBe(mockStream);
    expect((global as any).browser.tabCapture.capture).toHaveBeenCalled();
  });

  it("should throw an error on mic capture if consent is not granted", async () => {
    await expect(startMicCapture()).rejects.toThrow(
      "Lipsea acordul utilizatorului",
    );
  });

  it("should request media devices when mic consent is granted", async () => {
    await setConsentStatus({ tabConsent: false, micConsent: true });
    (global as any).navigator.mediaDevices.getUserMedia.mockResolvedValue(
      mockStream,
    );

    const stream = await startMicCapture();
    expect(stream).toBe(mockStream);
    expect(
      (global as any).navigator.mediaDevices.getUserMedia,
    ).toHaveBeenCalledWith({ audio: true, video: false });
  });
});
