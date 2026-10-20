# 📱 Guide d'Intégration Frontend — Temps Réel, Notifications & Firebase / SMS
## Plateforme Coco (Cocotaille & Cocomousso)

> **Destinataires :** Équipes Frontend (Mobile Flutter, React Native, Applications Web & Écrans TV Salons)  
> **Backend :** NestJS 12, Socket.IO, BullMQ, Firebase Admin SDK, Termii SMS  
> **Version API :** `v1`  
> **Dernière mise à jour :** Octobre 2026  

---

## 📑 Sommaire
1. [Vue d'Ensemble & Architecture](#1-vue-densemble--architecture)
2. [Module 1 : Temps Réel (WebSockets & Socket.IO)](#2-module-1--temps-réel-websockets--socketio)
   - [Paramètres de Connexion](#a-paramètres-de-connexion)
   - [Gestion des Salles (Rooms)](#b-gestion-des-salles-rooms)
   - [Événements Émis par le Backend](#c-événements-émis-par-le-backend)
   - [Implémentation Frontend (React / React Native & Flutter)](#d-implémentation-frontend)
3. [Module 2 : Notifications In-App & Préférences](#3-module-2--notifications-in-app--préférences)
   - [Cycle de Vie & Flux Hybride (WebSocket + REST)](#a-cycle-de-vie--flux-hybride)
   - [Répertoire des Endpoints REST](#b-répertoire-des-endpoints-rest)
   - [Préférences Canaux Utilisateur](#c-préférences-canaux-utilisateur)
4. [Module 3 : Notifications Push Firebase (FCM)](#4-module-3--notifications-push-firebase-fcm)
   - [Cycle de Vie du Token FCM](#a-cycle-de-vie-du-token-fcm)
   - [Enregistrement de l'Appareil auprès du Backend](#b-enregistrement-de-lappareil-auprès-du-backend)
   - [Gestion des 3 États (Foreground, Background, Terminated)](#c-gestion-des-3-états)
   - [Code Complet (Flutter & React Native)](#d-code-complet)
5. [Module 4 : SMS & Authentification Firebase OTP](#5-module-4--sms--authentification-firebase-otp)
   - [La Double Stratégie SMS du Projet](#a-la-double-stratégie-sms-du-projet)
   - [Flux Firebase Phone Auth OTP (100% Gratuit)](#b-flux-firebase-phone-auth-otp-100-gratuit)
   - [SMS Transactionnels Automatiques (Termii)](#c-sms-transactionnels-automatiques-termii)
6. [Checklist Finale d'Intégration Frontend (Zéro Étape Sautée)](#6-checklist-finale-dintégration-frontend)

---

## 1. Vue d'Ensemble & Architecture

La plateforme Coco gère trois types de communication asynchrone avec le frontend :

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   FRONTEND COCO                                        │
│         (Application Mobile Client / App Coiffeur / Dashboard Web / Écran TV)          │
└────────────┬─────────────────────────────┬───────────────────────────────┬─────────────┘
             │                             │                               │
    (1) WebSocket                  (2) Push FCM                   (3) Auth OTP
     Namespace /queue             Notification Push                SMS Gratuit Google
             │                             │                               │
             ▼                             ▼                               ▼
┌─────────────────────────┐   ┌─────────────────────────┐   ┌─────────────────────────────┐
│  QueueGateway Socket.IO │   │ Firebase Cloud Messaging│   │   Firebase Phone Auth       │
│  - Alertes tickets live │   │ - Alertes en tâche fond │   │   - Validation OTP client   │
│  - Son carillon TV      │   │ - Rappels RDV J-1 / H-2 │   │   - idToken envoyé au backend│
│  - Popups In-App        │   │ - Campagnes & Promos    │   └──────────────┬──────────────┘
└────────────┬────────────┘   └────────────┬────────────┘                  │
             │                             │                               ▼
             │ (Événements)                │ (Tokens devices)     POST /auth/reset-password
             └──────────────────────┬──────┴───────────────────────────────┘
                                    ▼
                         ┌──────────────────────┐
                         │   Backend coco_api   │
                         │  (NestJS + BullMQ)   │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ Termii SMS Gateway   │
                         │ (SMS Transac CI +225)│
                         └──────────────────────┘
```

---

## 2. Module 1 : Temps Réel (WebSockets & Socket.IO)

Le temps réel est propulsé par **Socket.IO** via la passerelle `QueueGateway`.

### A. Paramètres de Connexion

| Paramètre | Valeur |
|---|---|
| **URL Serveur** | `https://api.votredomaine.com` (ou `http://localhost:3000`) |
| **Namespace** | `/queue` |
| **Path Socket.IO** | `/socket.io` (par défaut) |
| **Transports** | `['websocket', 'polling']` |

#### Deux Modes de Connexion :

1. **Mode Utilisateur Connecté (Client, Coiffeur, Gérant) :**
   Passez le token JWT d'accès dans `auth.token` ou dans la query :
   ```javascript
   const socket = io('https://api.votredomaine.com/queue', {
     auth: { token: 'Bearer ' + accessToken },
     transports: ['websocket'],
   });
   ```
   *Action automatique du backend :* Il extrait `sub` (l'ID utilisateur) et fait rejoindre automatiquement le client à la salle `customer:<userId>`.

2. **Mode Écran TV Public de Salon (Affichage file d'attente sans compte) :**
   Pas besoin de JWT ! Passez simplement le paramètre `salonId` dans la query :
   ```javascript
   const socket = io('https://api.votredomaine.com/queue?salonId=' + salonId, {
     transports: ['websocket'],
   });
   ```
   *Action automatique du backend :* Rejoint directement la salle `salon:<salonId>`.

---

### B. Gestion des Salles (Rooms)

Si vous changez de salon ou souhaitez écouter une salle spécifique dynamiquement :

| Événement Émis par le Frontend | Payload | Effet |
|---|---|---|
| `join:salon` | `{ salonId: string }` | Écoute les tickets et mises à jour du salon |
| `leave:salon` | `{ salonId: string }` | Quitte l'écoute du salon |
| `join:customer` | `{ customerId: string }` | Écoute manuelle des alertes personnelles |

---

### C. Événements Émis par le Backend

| Nom de l'Événement | Destinataires | Données Reçues | Action Frontend Recommandée |
|---|---|---|---|
| `ticket:called` | `salon:<salonId>` | `{ type: 'TICKET_CALLED', ticketId, ticketNumber, callDeadlineAt, graceMinutes, playChime: true }` | **Sur Écran TV :** Faire clignoter le ticket et jouer le carillon audio sonore. |
| `ticket:called` | `customer:<userId>` | `{ type: 'YOUR_TURN', ticketId, ticketNumber, callDeadlineAt, graceMinutes, message }` | **Sur Mobile :** Vibration, modal plein écran "C'est votre tour !", affichage du chrono de grâce. |
| `ticket:started` | `salon:<salonId>` | `{ type: 'TICKET_STARTED', ticketId, ticketNumber, startedAt }` | Déplacer le ticket dans la colonne "En cours". |
| `ticket:completed` | `salon:<salonId>` | `{ type: 'TICKET_COMPLETED', ticketId, ticketNumber, completedAt }` | Retirer le ticket de la liste d'attente. |
| `ticket:no_show` | `salon:<salonId>` | `{ type: 'TICKET_NO_SHOW', ticketId, ticketNumber, markedAt }` | Marquer le ticket en rouge (Non présenté). |
| `queue:updated` | `salon:<salonId>` | `{ action: 'CREATED'\|'CALLED'\|'STARTED'\|'COMPLETED'\|'LEFT', ticketId, timestamp }` | Rafraîchir les données de la file (ou invalider le cache React Query). |
| `notification:new` | `customer:<userId>` | `NotificationEntity` (voir section In-App) | Incrémenter le badge cloche non lue (+1) et afficher un toast en direct. |

---

### D. Implémentation Frontend

#### Exemple React / React Native (TypeScript)

```typescript
// hooks/useQueueSocket.ts
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface TicketCalledPayload {
  type: string;
  ticketId: string;
  ticketNumber: string;
  callDeadlineAt?: string;
  graceMinutes?: number;
  playChime?: boolean;
  message?: string;
}

export function useQueueSocket(salonId?: string, userToken?: string) {
  const socketRef = useRef<Socket | null>(null);
  const [lastCalledTicket, setLastCalledTicket] = useState<TicketCalledPayload | null>(null);
  const [queueNeedsRefresh, setQueueNeedsRefresh] = useState(0);

  useEffect(() => {
    const socket = io('https://api.votredomaine.com/queue', {
      auth: userToken ? { token: userToken } : undefined,
      query: salonId ? { salonId } : undefined,
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connecté au serveur Temps Réel:', socket.id);
      if (salonId) {
        socket.emit('join:salon', { salonId });
      }
    });

    // Écoute de l'appel d'un ticket
    socket.on('ticket:called', (data: TicketCalledPayload) => {
      setLastCalledTicket(data);

      if (data.playChime) {
        // Jouer le fichier audio sonore (ex: cloche d'accueil)
        const audio = new Audio('/assets/sounds/chime.mp3');
        audio.play().catch(() => console.log('Autoplay audio bloqué par le navigateur'));
      }
    });

    // Écoute des mises à jour de file pour rafraîchissement
    socket.on('queue:updated', () => {
      setQueueNeedsRefresh((prev) => prev + 1);
    });

    // Écoute des notifications In-App personnelles
    socket.on('notification:new', (notification) => {
      console.log('Nouvelle notification reçue:', notification);
    });

    return () => {
      socket.disconnect();
    };
  }, [salonId, userToken]);

  return { socket: socketRef.current, lastCalledTicket, queueNeedsRefresh };
}
```

#### Exemple Flutter (Dart)

```dart
// services/queue_socket_service.dart
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:audioplayers/audioplayers.dart';

class QueueSocketService {
  late IO.Socket _socket;
  final AudioPlayer _audioPlayer = AudioPlayer();

  void initSocket({String? salonId, String? userJwt}) {
    _socket = IO.io(
      'https://api.votredomaine.com/queue',
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .enableAutoConnect()
          .enableReconnection()
          .setAuth(userJwt != null ? {'token': userJwt} : {})
          .setQuery(salonId != null ? {'salonId': salonId} : {})
          .build(),
    );

    _socket.onConnect((_) {
      print('Connecté au WebSocket Coco Queue: ${_socket.id}');
      if (salonId != null) {
        _socket.emit('join:salon', {'salonId': salonId});
      }
    });

    _socket.on('ticket:called', (data) async {
      print('Ticket appelé : $data');
      if (data['playChime'] == true) {
        await _audioPlayer.play(AssetSource('sounds/chime.mp3'));
      }
    });

    _socket.on('notification:new', (notification) {
      print('Notification In-App reçue : $notification');
    });

    _socket.onDisconnect((_) => print('Déconnecté du WebSocket'));
  }

  void dispose() {
    _socket.disconnect();
    _socket.dispose();
  }
}
```

---

## 3. Module 2 : Notifications In-App & Préférences

### A. Cycle de Vie & Flux Hybride (WebSocket + REST)

1. Lorsqu'un événement survient (ex: ticket créé, réservation confirmée, solde débité) :
   - Le backend enregistre une entrée dans la table `Notification`.
   - Il émet instantanément un événement WebSocket `notification:new` à la salle `customer:<userId>`.
2. Si le client a son application ouverte :
   - Le WebSocket reçoit le message en moins de 100 ms.
   - Le badge de notifications s'incrémente automatiquement.
3. Si le client ouvre son centre de notifications :
   - L'application appelle l'API REST `GET /api/v1/notifications`.

---

### B. Répertoire des Endpoints REST

Toutes ces requêtes nécessitent l'en-tête :  
`Authorization: Bearer <ACCESS_TOKEN>`

#### 1. Consulter les notifications
* **Route :** `GET /api/v1/notifications`
* **Query Params (Optionnels) :**
  * `page` (défaut: `1`)
  * `limit` (défaut: `20`)
  * `isRead` (`true` ou `false` pour filtrer)
  * `salonId` (filtrer par salon)
* **Réponse :**
```json
{
  "notifications": [
    {
      "id": "e4b2d184-7a1b-4d6e-927d-5a8264d1f211",
      "userId": "user-uuid",
      "salonId": "salon-uuid",
      "title": "C'est votre tour !",
      "body": "Le coiffeur Kouassi est prêt à vous accueillir.",
      "channel": "IN_APP",
      "isRead": false,
      "readAt": null,
      "data": { "ticketId": "ticket-uuid", "action": "GO_TO_DESK" },
      "createdAt": "2026-10-20T10:30:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

#### 2. Obtenir le nombre de notifications non lues (Badge rouge)
* **Route :** `GET /api/v1/notifications/unread-count`
* **Réponse :**
```json
{
  "unreadCount": 3
}
```

#### 3. Marquer une notification comme lue
* **Route :** `PATCH /api/v1/notifications/:id/read`
* **Réponse :** La notification mise à jour (`isRead: true`, `readAt: timestamp`).

#### 4. Tout marquer comme lu
* **Route :** `PATCH /api/v1/notifications/read-all`
* **Réponse :** `{ "count": 3 }`

---

### C. Préférences Canaux Utilisateur

L'utilisateur peut choisir sur quels canaux il souhaite être contacté (SMS, Push, In-App, WhatsApp).

#### 1. Récupérer les préférences actuelles
* **Route :** `GET /api/v1/notifications/preferences`
* **Réponse :**
```json
{
  "id": "pref-uuid",
  "userId": "user-uuid",
  "pushEnabled": true,
  "smsEnabled": true,
  "inAppEnabled": true,
  "whatsappEnabled": true
}
```

#### 2. Modifier les préférences
* **Route :** `PATCH /api/v1/notifications/preferences`
* **Corps (`application/json`) :**
```json
{
  "pushEnabled": true,
  "smsEnabled": false,
  "inAppEnabled": true,
  "whatsappEnabled": true
}
```

---

## 4. Module 3 : Notifications Push Firebase (FCM)

Le backend utilise le SDK officiel `firebase-admin` pour délivrer des alertes sur smartphone même lorsque l'application est en arrière-plan ou complètement fermée.

### A. Cycle de Vie du Token FCM

```
[Installation / Lancement App]
        │
        ▼
[Demander Permission Notification (iOS / Android 13+)]
        │
        ▼  (Acceptée)
[Obtenir FCM Token via SDK Client Firebase]
        │
        ▼
[POST /api/v1/notifications/devices (Lié au User connecté)]
        │
        ▼
[Réception des notifications même app fermée]
        │
        ▼
[Déconnexion / Logout du compte]
        │
        ▼
[DELETE /api/v1/notifications/devices/:deviceId]
```

---

### B. Enregistrement de l'Appareil auprès du Backend

Le backend dispose des routes dédiées :

#### 1. Enregistrer ou mettre à jour le Token FCM
* **Route :** `POST /api/v1/notifications/devices`
* **Auth :** `Bearer <ACCESS_TOKEN>`
* **Corps (`application/json`) :**
```json
{
  "deviceId": "8a3d42e1-512f-410a-b31c-0c4a4a491efc",
  "platform": "android",
  "pushToken": "fK9s...vKpQ",
  "appVersion": "1.0.0"
}
```
* **Règles :**
  * `deviceId` : Identifiant unique de l'appareil (ex: `device_info_plus` en Flutter ou `react-native-device-info`).
  * `platform` : `'android'`, `'ios'`, ou `'web'`.
  * `pushToken` : Le token obtenu via `FirebaseMessaging.instance.getToken()`.

#### 2. Supprimer l'appareil à la déconnexion
* **Route :** `DELETE /api/v1/notifications/devices/:deviceId`
* **Auth :** `Bearer <ACCESS_TOKEN>`
* Empêche l'ancien utilisateur de continuer à recevoir des notifications sur cet appareil après sa déconnexion.

---

### C. Gestion des 3 États

1. **Foreground (App au premier plan) :**
   Firebase ne déclenche **pas** de bannière système automatique par défaut. C'est à vous d'afficher un SnackBar / Toast ou un bandeau interactif.
2. **Background (App en arrière-plan) :**
   Le système affiche la notification native avec le titre et le corps.
3. **Terminated (App fermée / tuée) :**
   Le système réveille l'app lors du clic utilisateur et transmet le payload `data`.

---

### D. Code Complet

#### Flutter (Dart) — `notification_service.dart`

```dart
import 'dart:io';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class PushNotificationService {
  final FirebaseMessaging _fcm = FirebaseMessaging.instance;
  final DeviceInfoPlugin _deviceInfo = DeviceInfoPlugin();

  Future<void> initializeAndRegister(String accessToken) async {
    // 1. Demande de permission
    NotificationSettings settings = await _fcm.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus != AuthorizationStatus.authorized) {
      print('Permission push refusée par l’utilisateur');
      return;
    }

    // 2. Récupération du Token FCM
    String? fcmToken = await _fcm.getToken();
    if (fcmToken == null) return;

    // 3. Récupération de l'ID unique de l'appareil
    String deviceId = await _getUniqueDeviceId();
    String platform = Platform.isIOS ? 'ios' : 'android';

    // 4. Envoi au Backend coco_api
    await http.post(
      Uri.parse('https://api.votredomaine.com/api/v1/notifications/devices'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $accessToken',
      },
      body: jsonEncode({
        'deviceId': deviceId,
        'platform': platform,
        'pushToken': fcmToken,
        'appVersion': '1.0.0',
      }),
    );

    // 5. Rafraîchissement automatique si le token change
    _fcm.onTokenRefresh.listen((newToken) async {
      await http.post(
        Uri.parse('https://api.votredomaine.com/api/v1/notifications/devices'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $accessToken',
        },
        body: jsonEncode({
          'deviceId': deviceId,
          'platform': platform,
          'pushToken': newToken,
        }),
      );
    });

    // 6. Écoute Foreground
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      print('Push reçue au premier plan: ${message.notification?.title}');
      // Afficher un SnackBar ou dialog local
    });

    // 7. Clic sur notification (Background -> Ouverture App)
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      _handleNotificationClick(message.data);
    });
  }

  Future<String> _getUniqueDeviceId() async {
    if (Platform.isAndroid) {
      final androidInfo = await _deviceInfo.androidInfo;
      return androidInfo.id;
    } else {
      final iosInfo = await _deviceInfo.iosInfo;
      return iosInfo.identifierForVendor ?? 'ios-unknown-id';
    }
  }

  void _handleNotificationClick(Map<String, dynamic> data) {
    if (data['ticketId'] != null) {
      // Rediriger vers l'écran du ticket
    } else if (data['bookingId'] != null) {
      // Rediriger vers la réservation
    }
  }

  Future<void> unregisterDevice(String accessToken) async {
    String deviceId = await _getUniqueDeviceId();
    await http.delete(
      Uri.parse('https://api.votredomaine.com/api/v1/notifications/devices/$deviceId'),
      headers: {'Authorization': 'Bearer $accessToken'},
    );
  }
}
```

---

## 5. Module 4 : SMS & Authentification Firebase OTP

### A. La Double Stratégie SMS du Projet

Dans le projet Coco, il existe deux usages très différents du SMS :

| Usage | Cas d'Utilisation | Fournisseur | Coût | Qui l'Initie ? |
|---|---|---|---|---|
| **1. Vérification d'Identité & Reset MDP** | Code OTP à 6 chiffres envoyé lors de la réinitialisation de mot de passe. | **Firebase Phone Auth** | **100 % Gratuit** (Quota Google de 10 000 SMS/mois) | **Le Frontend Mobile / Web** |
| **2. SMS Transactionnels Salons** | Rappel de RDV (2h avant), alerte "Ticket appelé", confirmation acompte Wave/Orange. | **Termii SMS** (Passerelle SMS africaine) | Facturé au volume côté backend | **Le Backend Automatiquement** (BullMQ Workers) |

---

### B. Flux Firebase Phone Auth OTP (100% Gratuit)

Pour réinitialiser son mot de passe ou valider son numéro, **le frontend gère l'envoi du SMS via Firebase Client SDK**. Le backend ne paie aucun frais SMS et vérifie cryptographiquement le jeton Google.

#### Schéma d'Exécution :

```
Utilisateur                 Frontend Mobile                     Firebase SDK                Backend coco_api
    │                              │                                  │                            │
    │── Saisit son numéro (+225) ─>│                                  │                            │
    │                              │── verifyPhoneNumber(numéro) ────>│                            │
    │                              │                                  │── Envoie SMS (Gratuit) ───>│
    │<── Reçoit le SMS (ex: 492019)───────────────────────────────────│                            │
    │                              │                                  │                            │
    │── Saisit le code 492019 ────>│                                  │                            │
    │                              │── signInWithCredential(code) ───>│                            │
    │                              │<── Renvoie idToken signé ────────│                            │
    │                              │                                                               │
    │                              │── POST /api/v1/auth/reset-password ──────────────────────────>│
    │                              │   { firebaseIdToken, newPassword }                            │── Valide le token via firebase-admin
    │                              │                                                               │── Réinitialise le mot de passe
    │                              │<── 200 OK (Sessions révoquées) ───────────────────────────────│
```

#### Code Frontend Flutter (Dart) :

```dart
import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

final FirebaseAuth _auth = FirebaseAuth.instance;
String? _verificationId;

// 1. Déclencher l'envoi du SMS gratuit via Google
Future<void> requestOtpSms(String phoneNumber) async {
  // phoneNumber doit impérativement être au format international : "+2250701020304"
  await _auth.verifyPhoneNumber(
    phoneNumber: phoneNumber,
    timeout: const Duration(seconds: 60),
    verificationCompleted: (PhoneAuthCredential credential) async {
      // Auto-résolution SMS sous Android
      await submitNewPasswordWithCredential(credential, 'NouveauMotDePasse123!');
    },
    verificationFailed: (FirebaseAuthException e) {
      print('Erreur d’envoi Firebase SMS: ${e.message}');
    },
    codeSent: (String verificationId, int? resendToken) {
      _verificationId = verificationId;
      print('SMS envoyé avec succès ! Saisissez le code reçu.');
    },
    codeAutoRetrievalTimeout: (String verificationId) {
      _verificationId = verificationId;
    },
  );
}

// 2. Valider le code tapé par l'utilisateur
Future<void> verifyCodeAndResetPassword(String smsCode, String newPassword) async {
  if (_verificationId == null) throw Exception('Veuillez d’abord demander un SMS');

  final PhoneAuthCredential credential = PhoneAuthProvider.credential(
    verificationId: _verificationId!,
    smsCode: smsCode,
  );

  await submitNewPasswordWithCredential(credential, newPassword);
}

// 3. Soumettre au backend avec preuve cryptographique
Future<void> submitNewPasswordWithCredential(
  PhoneAuthCredential credential,
  String newPassword,
) async {
  // Connexion Firebase Client
  final UserCredential userCredential = await _auth.signInWithCredential(credential);
  final User? user = userCredential.user;

  // Récupération de l'idToken officiel signé par Google
  final String? firebaseIdToken = await user?.getIdToken(true);

  if (firebaseIdToken == null) {
    throw Exception('Impossible de générer le jeton de sécurité Firebase');
  }

  // Appel de l'API coco_api
  final response = await http.post(
    Uri.parse('https://api.votredomaine.com/api/v1/auth/reset-password'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'firebaseIdToken': firebaseIdToken,
      'newPassword': newPassword,
    }),
  );

  if (response.statusCode == 200) {
    print('Mot de passe mis à jour avec succès !');
  } else {
    print('Échec: ${response.body}');
  }
}
```

---

### C. SMS Transactionnels Automatiques (Termii)

* **Rôle du Frontend :** **Aucun code d'envoi n'est requis sur le frontend pour ce flux.**
* **Comment ça marche côté Backend :**
  1. Lorsqu'un ticket est appelé, que le rappel 2h est déclenché par BullMQ, ou qu'un acompte est confirmé :
  2. Le backend vérifie si `preferences.smsEnabled === true`.
  3. Si oui, le worker NestJS formate le numéro ivoirien (ex: `+2250700000000`) et expédie un SMS via la passerelle Termii (`https://api.ng.termii.com/api/sms/send`).
  4. L'utilisateur reçoit le SMS directement sur son téléphone via son opérateur local (Orange, MTN, Moov).

---

## 6. Checklist Finale d'Intégration Frontend

Pour s'assurer qu'aucune étape n'a été oubliée :

### 🟢 Phase 1 : Temps Réel (Socket.IO)
- [ ] Installer le client Socket.IO (`socket.io-client` en JS / `socket_io_client` en Flutter).
- [ ] Se connecter sur le namespace `/queue` (ex: `https://api.domain.com/queue`).
- [ ] Envoyer `auth: { token: 'Bearer ...' }` pour les utilisateurs connectés.
- [ ] Passer `?salonId=uuid` pour les écrans TV de salon.
- [ ] Écouter l'événement `ticket:called` et déclencher le son carillon audio si `playChime === true`.
- [ ] Écouter `queue:updated` pour rafraîchir dynamiquement les listes de tickets.

### 🟡 Phase 2 : Notifications In-App & Badge
- [ ] Appeler `GET /api/v1/notifications/unread-count` au lancement de l'application pour afficher la pastille rouge sur la cloche.
- [ ] Écouter l'événement WebSocket `notification:new` pour incrémenter le badge en direct sans recharger l'écran.
- [ ] Afficher la liste paginée via `GET /api/v1/notifications`.
- [ ] Appeler `PATCH /api/v1/notifications/:id/read` lorsqu'un utilisateur clique sur un message.
- [ ] Permettre à l'utilisateur de gérer ses canaux dans l'écran Profil via `GET/PATCH /api/v1/notifications/preferences`.

### 🟣 Phase 3 : Push Notifications Firebase (FCM)
- [ ] Configurer `google-services.json` (Android) et `GoogleService-Info.plist` (iOS).
- [ ] Demander la permission système (`requestPermission`).
- [ ] Récupérer le `fcmToken`.
- [ ] Envoyer le token au backend via `POST /api/v1/notifications/devices` dès que l'utilisateur est authentifié.
- [ ] Écouter `onTokenRefresh` pour mettre à jour le token si Firebase le régénère.
- [ ] Appeler `DELETE /api/v1/notifications/devices/:deviceId` lors du logout pour couper la réception des notifications de ce compte.
- [ ] Tester les 3 états : Foreground (toast custom), Background (bannière OS) et Terminated (clic de réveil).

### 🔵 Phase 4 : SMS & Firebase OTP
- [ ] Configurer Firebase Phone Auth dans la console Firebase (activer le fournisseur Téléphone).
- [ ] Configurer les clés SHA-1 et SHA-256 (Android) et les certificats APNs (iOS) pour la réception sans reCAPTCHA intrusif.
- [ ] Utiliser `verifyPhoneNumber` pour l'envoi gratuit du code SMS OTP.
- [ ] Récupérer le `idToken` avec `user.getIdToken()`.
- [ ] Appeler `POST /api/v1/auth/reset-password` avec `{ firebaseIdToken, newPassword }`.
