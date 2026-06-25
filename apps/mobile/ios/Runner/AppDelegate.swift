import UIKit
import Flutter
import AVFoundation

@UIApplicationMain
@objc class AppDelegate: FlutterAppDelegate {
  private var audioSessionChannel: FlutterMethodChannel?
  private var interruptionObs: NSObjectProtocol?
  private var routeChangeObs: NSObjectProtocol?

  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    GeneratedPluginRegistrant.register(with: self)

    let controller = window?.rootViewController as! FlutterViewController
    audioSessionChannel = FlutterMethodChannel(
      name: "com.verificat.mobile/audio_session",
      binaryMessenger: controller.binaryMessenger
    )

    configureAudioSession()
    observeInterruptions()

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  private func configureAudioSession() {
    let session = AVAudioSession.sharedInstance()
    do {
      try session.setCategory(
        .playAndRecord,
        mode: .default,
        options: [.defaultToSpeaker, .allowBluetooth, .mixWithOthers]
      )
      try session.setActive(true)
    } catch {
      audioSessionChannel?.invokeMethod("onError", arguments: "Failed to configure audio session: \(error.localizedDescription)")
    }
  }

  private func observeInterruptions() {
    interruptionObs = NotificationCenter.default.addObserver(
      forName: AVAudioSession.interruptionNotification,
      object: AVAudioSession.sharedInstance(),
      queue: .main
    ) { [weak self] notification in
      guard let userInfo = notification.userInfo,
            let typeValue = userInfo[AVAudioSessionInterruptionTypeKey] as? UInt,
            let type = AVAudioSession.InterruptionType(rawValue: typeValue) else { return }

      switch type {
      case .began:
        self?.audioSessionChannel?.invokeMethod("onInterruptionBegan", arguments: nil)
      case .ended:
        guard let optionsValue = userInfo[AVAudioSessionInterruptionOptionKey] as? UInt else { return }
        let options = AVAudioSession.InterruptionOptions(rawValue: optionsValue)
        if options.contains(.shouldResume) {
          do {
            try AVAudioSession.sharedInstance().setActive(true)
          } catch {}
          self?.audioSessionChannel?.invokeMethod("onInterruptionEnded", arguments: nil)
        }
      @unknown default:
        break
      }
    }

    routeChangeObs = NotificationCenter.default.addObserver(
      forName: AVAudioSession.routeChangeNotification,
      object: AVAudioSession.sharedInstance(),
      queue: .main
    ) { [weak self] notification in
      guard let userInfo = notification.userInfo,
            let reasonValue = userInfo[AVAudioSessionRouteChangeReasonKey] as? UInt,
            let reason = AVAudioSession.RouteChangeReason(rawValue: reasonValue) else { return }

      if reason == .oldDeviceUnavailable {
        self?.audioSessionChannel?.invokeMethod("onRouteLost", arguments: nil)
      }
    }
  }

  deinit {
    if let obs = interruptionObs { NotificationCenter.default.removeObserver(obs) }
    if let obs = routeChangeObs { NotificationCenter.default.removeObserver(obs) }
  }
}
