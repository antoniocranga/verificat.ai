import 'dart:io';
import 'package:flutter/services.dart';

class RootDetector {
  static const _channel = MethodChannel('com.verificat.mobile/security');

  static Future<bool> isDeviceSecure() async {
    try {
      final result = await _channel.invokeMethod<bool>('isDeviceSecure');
      if (result != null) return result;
    } catch (_) {}
    return true;
  }
}
