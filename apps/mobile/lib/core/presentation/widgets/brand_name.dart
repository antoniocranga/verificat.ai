import 'package:flutter/material.dart';

class BrandName extends StatelessWidget {
  final TextStyle? style;

  const BrandName({super.key, this.style});

  @override
  Widget build(BuildContext context) {
    final defaultStyle = DefaultTextStyle.of(context).style;
    final baseStyle = style ?? defaultStyle;
    
    return RichText(
      text: TextSpan(
        style: baseStyle,
        children: [
          const TextSpan(text: 'verificat'),
          TextSpan(
            text: '.xyz',
            style: baseStyle.copyWith(
              color: Theme.of(context).colorScheme.primary,
            ),
          ),
        ],
      ),
    );
  }
}
