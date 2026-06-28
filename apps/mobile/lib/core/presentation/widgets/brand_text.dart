import 'package:flutter/material.dart';

class BrandText extends StatelessWidget {
  final String text;
  final TextStyle? style;
  final TextAlign? textAlign;

  const BrandText(
    this.text, {
    super.key,
    this.style,
    this.textAlign,
  });

  @override
  Widget build(BuildContext context) {
    final defaultStyle = DefaultTextStyle.of(context).style;
    final baseStyle = style ?? defaultStyle;
    
    final parts = text.split('verificat.xyz');
    if (parts.length == 1) {
      return Text(text, style: style, textAlign: textAlign);
    }

    final spans = <InlineSpan>[];
    for (int i = 0; i < parts.length; i++) {
      if (parts[i].isNotEmpty) {
        spans.add(TextSpan(text: parts[i], style: baseStyle));
      }
      if (i < parts.length - 1) {
        spans.add(TextSpan(text: 'verificat', style: baseStyle));
        spans.add(TextSpan(
          text: '.xyz',
          style: baseStyle.copyWith(
            color: Theme.of(context).colorScheme.primary,
          ),
        ));
      }
    }

    return RichText(
      textAlign: textAlign ?? TextAlign.start,
      text: TextSpan(children: spans),
    );
  }
}
