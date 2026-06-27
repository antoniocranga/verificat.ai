import 'package:permission_handler/permission_handler.dart';

class PermissionService {
  const PermissionService();

  Future<bool> requestMicPermission() async {
    final status = await Permission.microphone.request();
    return status.isGranted;
  }

  Future<bool> hasMicPermission() async {
    final status = await Permission.microphone.status;
    return status.isGranted;
  }
}
