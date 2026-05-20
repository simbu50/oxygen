import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../core/theme.dart';
import 'kyc_repository.dart';

class SelfieScreen extends ConsumerStatefulWidget {
  const SelfieScreen({super.key});
  @override
  ConsumerState<SelfieScreen> createState() => _SelfieScreenState();
}

class _SelfieScreenState extends ConsumerState<SelfieScreen> {
  File? _file;
  bool _loading = false;
  String? _error;

  Future<void> _pick() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(
      source: ImageSource.camera,
      preferredCameraDevice: CameraDevice.front,
      imageQuality: 80,
    );
    if (picked != null) setState(() => _file = File(picked.path));
  }

  Future<void> _submit() async {
    if (_file == null) {
      setState(() => _error = 'Take a selfie first');
      return;
    }
    setState(() { _loading = true; _error = null; });
    try {
      await ref.read(kycRepositoryProvider).submitSelfie(_file!);
      if (!mounted) return;
      context.pop();
    } catch (e) {
      setState(() => _error = 'Could not upload selfie. Try again.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Selfie')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Take a clear selfie',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  color: OxygenColors.navy, fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Look at the camera, no glasses or hats.',
                style: TextStyle(color: OxygenColors.slate, fontSize: 13),
              ),
              const SizedBox(height: 24),
              Expanded(
                child: Center(
                  child: GestureDetector(
                    onTap: _pick,
                    child: Container(
                      width: 220, height: 220,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white,
                        border: Border.all(color: OxygenColors.teal, width: 3),
                      ),
                      child: _file == null
                          ? Icon(Icons.camera_alt, size: 64, color: OxygenColors.teal)
                          : ClipOval(child: Image.file(_file!, fit: BoxFit.cover)),
                    ),
                  ),
                ),
              ),
              if (_error != null) ...[
                Text(_error!, style: const TextStyle(color: Colors.red, fontSize: 13)),
                const SizedBox(height: 8),
              ],
              if (_file != null)
                TextButton(onPressed: _pick, child: const Text('Retake')),
              const SizedBox(height: 8),
              ElevatedButton(
                onPressed: _loading ? null : _submit,
                child: _loading
                    ? const SizedBox(
                        width: 22, height: 22,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Text('Submit selfie'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
