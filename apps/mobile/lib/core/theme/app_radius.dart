import 'package:flutter/material.dart';

class AppRadius {
  AppRadius._();

  static const double none = 0;
  static const double sm = 6;
  static const double md = 12;
  static const double lg = 16;
  static const double pill = 100;
  static const double full = 9999;

  static Radius circular(double value) => Radius.circular(value);
  static BorderRadius all(double value) => BorderRadius.all(Radius.circular(value));
}
