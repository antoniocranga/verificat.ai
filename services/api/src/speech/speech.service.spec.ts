import { Test, TestingModule } from '@nestjs/testing';
import { firstValueFrom } from 'rxjs';
import { SpeechService } from './speech.service';
import { SpeechModule } from './speech.module';

describe('SpeechService', () => {
  let service: SpeechService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SpeechModule],
    }).compile();

    service = module.get<SpeechService>(SpeechService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAdapter', () => {
    it('should return Deepgram adapter by default', () => {
      const adapter = service.getAdapter();
      expect(adapter.engineName).toBe('deepgram');
    });

    it('should return Deepgram adapter when requested', () => {
      const adapter = service.getAdapter('deepgram');
      expect(adapter.engineName).toBe('deepgram');
    });

    it('should return Azure adapter when requested', () => {
      const adapter = service.getAdapter('azure');
      expect(adapter.engineName).toBe('azure');
    });

    it('should return Whisper adapter when requested', () => {
      const adapter = service.getAdapter('whisper');
      expect(adapter.engineName).toBe('whisper');
    });

    it('should throw an error for unsupported engines', () => {
      expect(() => service.getAdapter('unknown' as 'deepgram')).toThrow(
        'STT Engine "unknown" not found/configured.',
      );
    });
  });

  describe('SttSession Contracts', () => {
    it('should emit Deepgram transcripts on audio stream', async () => {
      const adapter = service.getAdapter('deepgram');
      const session = await adapter.startStream();

      const transcriptPromise = firstValueFrom(session.getTranscript$());
      session.sendAudio(Buffer.alloc(0));

      const event = await transcriptPromise;
      expect(event.text).toBe(
        'Mock transcription from Deepgram stream (no API key)',
      );
      expect(event.isFinal).toBe(true);
      expect(event.confidence).toBe(0.99);
      expect(event.language).toBe('ro-RO');

      await session.close();
    });

    it('should emit Azure transcripts on audio stream', async () => {
      const adapter = service.getAdapter('azure');
      const session = await adapter.startStream();

      const transcriptPromise = firstValueFrom(session.getTranscript$());
      session.sendAudio(Buffer.alloc(0));

      const event = await transcriptPromise;
      expect(event.text).toBe('Mock transcription from Azure stream');
      expect(event.isFinal).toBe(true);
      expect(event.confidence).toBe(0.95);
      expect(event.language).toBe('ro-RO');

      await session.close();
    });

    it('should emit Whisper transcripts on audio stream', async () => {
      const adapter = service.getAdapter('whisper');
      const session = await adapter.startStream();

      const transcriptPromise = firstValueFrom(session.getTranscript$());
      session.sendAudio(Buffer.alloc(0));

      const event = await transcriptPromise;
      expect(event.text).toBe('Mock transcription from Whisper stream');
      expect(event.isFinal).toBe(true);
      expect(event.confidence).toBe(0.9);
      expect(event.language).toBe('ro-RO');

      await session.close();
    });
  });

  describe('transcribeBuffer Contracts', () => {
    it('should transcribe buffers correctly across engines', async () => {
      const deepgram = service.getAdapter('deepgram');
      const azure = service.getAdapter('azure');
      const whisper = service.getAdapter('whisper');

      const deepgramRes = await deepgram.transcribeBuffer(Buffer.alloc(0));
      expect(deepgramRes.text).toBe('Mock transcription from Deepgram batch');
      expect(deepgramRes.confidence).toBe(0.99);

      const azureRes = await azure.transcribeBuffer(Buffer.alloc(0));
      expect(azureRes.text).toBe(
        'Mock transcription from Azure batch (no API key)',
      );
      expect(azureRes.confidence).toBe(0.95);

      const whisperRes = await whisper.transcribeBuffer(Buffer.alloc(0));
      expect(whisperRes.text).toBe('Mock transcription from Whisper batch');
      expect(whisperRes.confidence).toBe(0.9);
    });
  });
});
