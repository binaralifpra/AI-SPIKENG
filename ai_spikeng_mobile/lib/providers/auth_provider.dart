import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../models/user_data.dart';

class AuthProvider extends ChangeNotifier {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn();

  User? _user;
  UserData? _userData;
  bool _loading = true;
  bool _dataReady = false;

  User? get user => _user;
  UserData? get userData => _userData;
  bool get loading => _loading;
  bool get dataReady => _dataReady;
  bool get isLoggedIn => _user != null;

  AuthProvider() {
    _auth.authStateChanges().listen(_onAuthChanged);
  }

  Future<void> _onAuthChanged(User? firebaseUser) async {
    if (firebaseUser != null) {
      _user = firebaseUser;
      await _loadUserData(firebaseUser.uid);
      _dataReady = true;
    } else {
      _user = null;
      _userData = null;
      _dataReady = false;
    }
    _loading = false;
    notifyListeners();
  }

  Future<void> _loadUserData(String uid) async {
    try {
      final doc = await _firestore.collection('users').doc(uid).get();
      if (doc.exists && doc.data() != null) {
        _userData = UserData.fromMap(doc.data()!);
      } else {
        _userData = null;
      }
    } catch (e) {
      debugPrint('Error loading user data: $e');
      _userData = null;
    }
  }

  Future<void> login(String email, String password) async {
    final result = await _auth.signInWithEmailAndPassword(
      email: email, password: password,
    );
    _user = result.user;
    await _loadUserData(result.user!.uid);
    _dataReady = true;
    notifyListeners();
  }

  Future<void> signup(String email, String password, String name, String gender) async {
    final result = await _auth.createUserWithEmailAndPassword(
      email: email, password: password,
    );
    await result.user!.updateDisplayName(name);

    final newData = UserData(
      profile: UserProfile(
        name: name, email: email, gender: gender,
        createdAt: DateTime.now().toIso8601String(),
      ),
    );

    await _firestore.collection('users').doc(result.user!.uid).set(newData.toMap());
    _user = result.user;
    _userData = newData;
    _dataReady = true;
    notifyListeners();
  }

  Future<void> loginWithGoogle() async {
    final googleUser = await _googleSignIn.signIn();
    if (googleUser == null) return;

    final googleAuth = await googleUser.authentication;
    final credential = GoogleAuthProvider.credential(
      accessToken: googleAuth.accessToken,
      idToken: googleAuth.idToken,
    );

    final result = await _auth.signInWithCredential(credential);
    final docRef = _firestore.collection('users').doc(result.user!.uid);
    final docSnap = await docRef.get();

    if (!docSnap.exists) {
      final newData = UserData(
        profile: UserProfile(
          name: result.user!.displayName ?? 'User',
          email: result.user!.email ?? '',
          gender: 'male',
          createdAt: DateTime.now().toIso8601String(),
        ),
      );
      await docRef.set(newData.toMap());
      _userData = newData;
    } else {
      _userData = UserData.fromMap(docSnap.data()!);
    }

    _user = result.user;
    _dataReady = true;
    notifyListeners();
  }

  Future<void> logout() async {
    _dataReady = false;
    await _googleSignIn.signOut();
    await _auth.signOut();
  }

  Future<void> updateUserData(Map<String, dynamic> updates) async {
    if (_user == null) return;
    final docRef = _firestore.collection('users').doc(_user!.uid);
    await docRef.set(updates, SetOptions(merge: true));

    // Reload from Firestore to stay in sync
    await _loadUserData(_user!.uid);
    notifyListeners();
  }
}
