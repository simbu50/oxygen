import 'package:flutter/material.dart';

class OxygenColors {
  static const navy = Color(0xFF0A2540);
  static const navyDeep = Color(0xFF061A30);
  static const teal = Color(0xFF00A6A6);
  static const tealDark = Color(0xFF087E7E);
  static const gold = Color(0xFFF5B544);
  static const offWhite = Color(0xFFF7F9FB);
  static const slate = Color(0xFF4A5568);
  static const slateLight = Color(0xFF8492A6);
}

class OxygenTheme {
  static ThemeData get light => ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: OxygenColors.navy,
          primary: OxygenColors.navy,
          secondary: OxygenColors.teal,
          surface: Colors.white,
        ),
        scaffoldBackgroundColor: OxygenColors.offWhite,
        fontFamily: 'Roboto',
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: OxygenColors.navy,
          elevation: 0,
          centerTitle: false,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: OxygenColors.navy,
            foregroundColor: Colors.white,
            minimumSize: const Size.fromHeight(52),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: OxygenColors.teal, width: 2),
          ),
        ),
      );
}
