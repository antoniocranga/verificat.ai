import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:verificat_mobile/core/security/root_detector.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  const channel = MethodChannel('com.verificat.mobile/security');

  group('RootDetector', () {
    test('returns true when channel returns true', () async {
      TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
          .setMockMethodCallHandler(channel, (MethodCall methodCall) async {
        return true;
      });

      final result = await RootDetector.isDeviceSecure();
      expect(result, isTrue);

      TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
          .setMockMethodCallHandler(channel, null);
    });

    test('returns false when channel returns false', () async {
      TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
          .setMockMethodCallHandler(channel, (MethodCall methodCall) async {
        return false;
      });

      final result = await RootDetector.isDeviceSecure();
      expect(result, isFalse);

      TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
          .setMockMethodCallHandler(channel, null);
    });

    test('returns true when channel throws', () async {
      TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
          .setMockMethodCallHandler(channel, (MethodCall methodCall) async {
        throw PlatformException(code: 'UNKNOWN');
      });

      final result = await RootDetector.isDeviceSecure();
      expect(result, isTrue);

      TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
          .setMockMethodCallHandler(channel, null);
    });

    test('returns true when no handler registered', () async {
      final result = await RootDetector.isDeviceSecure();
      expect(result, isTrue);
    });
  });
}
