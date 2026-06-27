import 'dart:async';
import 'package:flutter/services.dart';

enum AudioSessionInterruption { began, ended }

class AudioSessionService {
  static const _channel = MethodChannel('com.verificat.mobile/audio_session');

  final _interruptionController = StreamController<AudioSessionInterruption>.broadcast();
  final _errorController = StreamController<String>.broadcast();
  final _routeLostController = StreamController<void>.broadcast();

  Stream<AudioSessionInterruption> get onInterruption => _interruptionController.stream;
  Stream<String> get onError => _errorController.stream;
  Stream<void> get onRouteLost => _routeLostController.stream;

  AudioSessionService() {
    _channel.setMethodCallHandler(_handleMethodCall);
  }

  Future<dynamic> _handleMethodCall(MethodCall call) async {
    switch (call.method) {
      case 'onInterruptionBegan':
        _interruptionController.add(AudioSessionInterruption.began);
      case 'onInterruptionEnded':
        _interruptionController.add(AudioSessionInterruption.ended);
      case 'onRouteLost':
        _routeLostController.add(null);
      case 'onError':
        if (call.arguments is String) {
          _errorController.add(call.arguments as String);
        }
    }
  }

  Future<void> setCategoryPlayAndRecord() async {
    try {
      await _channel.invokeMethod('setCategoryPlayAndRecord');
    } on MissingPluginException {
      // Ignored on platforms without native implementation (e.g. Android)
    } catch (_) {}
  }

  void dispose() {
    _interruptionController.close();
    _errorController.close();
    _routeLostController.close();
    _channel.setMethodCallHandler(null);
  }
}
