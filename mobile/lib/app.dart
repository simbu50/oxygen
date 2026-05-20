import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/router.dart';
import 'core/theme.dart';

class OxygenApp extends ConsumerWidget {
  const OxygenApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    return MaterialApp.router(
      title: 'OXYGEN',
      debugShowCheckedModeBanner: false,
      theme: OxygenTheme.light,
      routerConfig: router,
    );
  }
}
