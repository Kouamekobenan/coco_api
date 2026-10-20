import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

const outputPath = path.resolve('GUIDE_INTEGRATION_FRONTEND_TEMPS_REEL_ET_NOTIFICATIONS.pdf');

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 40, bottom: 45, left: 45, right: 45 },
  bufferPages: true,
  autoFirstPage: true,
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// --- COULEURS CHARTE COCO ---
const PRIMARY = '#BE123C';       // Rose Framboise Coco
const PRIMARY_DARK = '#881337';  // Bordeaux profond
const PRIMARY_LIGHT = '#FFE4E6'; // Rose clair
const SLATE_900 = '#0F172A';     // Noir textuel
const SLATE_800 = '#1E293B';     // Arrière-plan code
const SLATE_700 = '#334155';     // Texte courant
const SLATE_600 = '#475569';     // Texte secondaire
const SLATE_500 = '#64748B';     // Libellés légers
const SLATE_200 = '#E2E8F0';     // Bordures
const SLATE_100 = '#F1F5F9';     // Arrière-plans légers
const SLATE_50 = '#F8FAFC';      // Alternance tableau
const EMERALD = '#059669';       // Succès / Vert
const EMERALD_LIGHT = '#D1FAE5';
const AMBER = '#D97706';         // Attention / Orange
const AMBER_LIGHT = '#FEF3C7';
const BLUE = '#2563EB';          // Information / Bleu
const BLUE_LIGHT = '#DBEAFE';
const PURPLE = '#7C3AED';        // Firebase / Push
const PURPLE_LIGHT = '#EDE9FE';

const PAGE_WIDTH = doc.page.width;
const PAGE_HEIGHT = doc.page.height;
const CONTENT_WIDTH = PAGE_WIDTH - 90; // 505 pt

let currentSectionCategory = "GUIDE D'INTÉGRATION FRONTEND — COCO API";

function drawHeader() {
  doc.save();
  doc.rect(45, 30, CONTENT_WIDTH, 2.5).fill(PRIMARY);
  
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor(SLATE_500)
     .text(currentSectionCategory.toUpperCase(), 45, 38, { align: 'left' });
  doc.fontSize(7.5).font('Helvetica')
     .text('COCOTAILLE & COCOMOUSSO — FRONTEND INTEGRATION GUIDE', 45, 38, { width: CONTENT_WIDTH, align: 'right' });
  
  doc.restore();
  doc.y = 56;
}

function checkPageSpace(needed) {
  if (doc.y + needed > PAGE_HEIGHT - 50) {
    doc.addPage();
    drawHeader();
  }
}

function sectionTitle(title, subtitle = null) {
  checkPageSpace(52);
  doc.moveDown(0.4);
  
  const curY = doc.y;
  doc.save();
  doc.rect(45, curY, 4, 18).fill(PRIMARY);
  doc.fontSize(11.5).font('Helvetica-Bold').fillColor(SLATE_900)
     .text(title, 56, curY + 2);
  doc.restore();
  
  doc.y = curY + 22;
  if (subtitle) {
    doc.fontSize(8.5).font('Helvetica-Oblique').fillColor(SLATE_500)
       .text(subtitle, 56, doc.y);
    doc.y += 12;
  }
}

function subSectionTitle(title) {
  checkPageSpace(30);
  doc.moveDown(0.3);
  doc.fontSize(9.5).font('Helvetica-Bold').fillColor(PRIMARY_DARK).text(title, 45, doc.y);
  doc.y += 4;
}

function paragraph(text) {
  checkPageSpace(20);
  doc.fontSize(8.5).font('Helvetica').fillColor(SLATE_700).text(text, 45, doc.y, {
    width: CONTENT_WIDTH,
    align: 'justify',
    lineGap: 2.2,
  });
  doc.y += 4;
}

function bullet(title, text) {
  checkPageSpace(18);
  const curY = doc.y;
  doc.fontSize(8.2).font('Helvetica-Bold').fillColor(SLATE_900).text('• ' + title + ' : ', 45, curY, {
    continued: true,
  });
  doc.fontSize(8.2).font('Helvetica').fillColor(SLATE_700).text(text, {
    width: CONTENT_WIDTH - 10,
    lineGap: 1.8,
  });
  doc.y += 3;
}

function callout(title, text, type = 'info') {
  let bgColor = BLUE_LIGHT;
  let borderColor = BLUE;
  let textColor = '#1E40AF';

  if (type === 'success') {
    bgColor = EMERALD_LIGHT;
    borderColor = EMERALD;
    textColor = '#065F46';
  } else if (type === 'warning') {
    bgColor = AMBER_LIGHT;
    borderColor = AMBER;
    textColor = '#92400E';
  } else if (type === 'purple') {
    bgColor = PURPLE_LIGHT;
    borderColor = PURPLE;
    textColor = '#5B21B6';
  }
  
  doc.fontSize(8).font('Helvetica');
  const textHeight = doc.heightOfString(text, { width: CONTENT_WIDTH - 24, lineGap: 1.5 });
  const boxHeight = textHeight + 22;
  
  checkPageSpace(boxHeight + 8);
  const startY = doc.y;
  
  doc.save();
  doc.roundedRect(45, startY, CONTENT_WIDTH, boxHeight, 4).fill(bgColor);
  doc.rect(45, startY, 4, boxHeight).fill(borderColor);
  
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor(textColor).text(title, 57, startY + 5);
  doc.fontSize(8).font('Helvetica').fillColor(SLATE_700).text(text, 57, startY + 16, {
    width: CONTENT_WIDTH - 24,
    lineGap: 1.5,
  });
  doc.restore();
  doc.y = startY + boxHeight + 6;
}

function drawTable(headers, rows, colWidths) {
  checkPageSpace(35);
  let curY = doc.y;

  // Header Row
  doc.save();
  doc.rect(45, curY, CONTENT_WIDTH, 17).fill(SLATE_900);
  let curX = 45;
  headers.forEach((h, i) => {
    doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#FFFFFF')
       .text(h, curX + 5, curY + 4, { width: colWidths[i] - 10 });
    curX += colWidths[i];
  });
  doc.restore();
  curY += 17;

  // Calculate & Draw Rows
  rows.forEach((row, rIdx) => {
    doc.fontSize(7.5).font('Helvetica');
    const heights = row.map((cell, cIdx) => 
      doc.heightOfString(cell, { width: colWidths[cIdx] - 10, lineGap: 1.5 })
    );
    const rowHeight = Math.max(...heights) + 7;

    if (curY + rowHeight > PAGE_HEIGHT - 50) {
      doc.addPage();
      drawHeader();
      curY = doc.y;
      
      doc.save();
      doc.rect(45, curY, CONTENT_WIDTH, 17).fill(SLATE_900);
      let hX = 45;
      headers.forEach((h, i) => {
        doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#FFFFFF')
           .text(h, hX + 5, curY + 4, { width: colWidths[i] - 10 });
        hX += colWidths[i];
      });
      doc.restore();
      curY += 17;
    }

    doc.save();
    if (rIdx % 2 === 0) {
      doc.rect(45, curY, CONTENT_WIDTH, rowHeight).fill(SLATE_50);
    }
    doc.rect(45, curY, CONTENT_WIDTH, rowHeight).stroke(SLATE_200);

    let cellX = 45;
    row.forEach((cell, cIdx) => {
      doc.fontSize(7.2).font(cIdx === 0 ? 'Helvetica-Bold' : 'Helvetica')
         .fillColor(cIdx === 0 ? SLATE_900 : SLATE_700)
         .text(cell, cellX + 5, curY + 4, { width: colWidths[cIdx] - 10, lineGap: 1.5 });
      cellX += colWidths[cIdx];
    });
    doc.restore();

    curY += rowHeight;
  });

  doc.y = curY + 6;
}

function drawCodeBlock(code) {
  doc.fontSize(6.8).font('Courier');
  const codeHeight = doc.heightOfString(code, { width: CONTENT_WIDTH - 20, lineGap: 1.4 }) + 12;
  checkPageSpace(codeHeight + 6);
  
  const startY = doc.y;
  doc.save();
  doc.roundedRect(45, startY, CONTENT_WIDTH, codeHeight, 4).fill(SLATE_800);
  doc.fontSize(6.8).font('Courier').fillColor('#F8FAFC')
     .text(code, 55, startY + 6, { width: CONTENT_WIDTH - 20, lineGap: 1.4 });
  doc.restore();
  
  doc.y = startY + codeHeight + 6;
}

// =============================================================================
// PAGE 1 : COUVERTURE & RÉSUMÉ EXÉCUTIF
// =============================================================================

// Bandeau supérieur de couverture
doc.rect(0, 0, PAGE_WIDTH, 165).fill(PRIMARY_DARK);
doc.rect(0, 160, PAGE_WIDTH, 5).fill(PRIMARY);

doc.fontSize(9.5).font('Helvetica-Bold').fillColor(PRIMARY_LIGHT)
   .text('PLATEFORME SAAS COCOTAILLE & COCOMOUSSO', 50, 42);

doc.fontSize(19).font('Helvetica-Bold').fillColor('#FFFFFF')
   .text('GUIDE TECHNIQUE FRONTEND :', 50, 60);

doc.fontSize(15).font('Helvetica').fillColor('#FFFFFF')
   .text('TEMPS RÉEL, NOTIFICATIONS, PUSH FCM & SMS OTP', 50, 84);

doc.fontSize(8.5).font('Helvetica').fillColor(PRIMARY_LIGHT)
   .text('Version API : v1 (NestJS 12 / Socket.IO / BullMQ / Firebase Admin / Termii)', 50, 112);

doc.fontSize(8).font('Helvetica-Oblique').fillColor(PRIMARY_LIGHT)
   .text('Destiné aux équipes de développement Mobile (Flutter, React Native) et Web (Next.js, Écrans TV)', 50, 128);

doc.y = 185;

sectionTitle('1. Vue d\'Ensemble & Architecture de Communication');

paragraph(
  'La plateforme Coco dispose d\'une infrastructure asynchrone hautement optimisée conçue pour éliminer la latence dans les salons, automatiser l\'appel des tickets, informer les clients sans délai et sécuriser les accès téléphoniques en Côte d\'Ivoire sans générer de coûts superflus.'
);

const summaryHeaders = ['Canal / Protocole', 'Technologie Sous-Jacente', 'Cible Frontend', 'Cas d\'Usage Clés'];
const summaryRows = [
  [
    'Temps Réel\n(WebSocket)',
    'Socket.IO\nNamespace: /queue',
    'Écrans TV Salons,\nApp Mobile Client,\nDashboard Gérant',
    'Appel des tickets au micro/carillon, mouvement file d\'attente, début et fin de prestation en direct.',
  ],
  [
    'Notifications In-App\n& Centre d\'Alertes',
    'PostgreSQL + Prisma\n+ Relais WebSocket',
    'App Mobile Client,\nEspace Coiffeur',
    'Historique des alertes, pastille rouge non-lue, notifications d\'acompte, de retard et de solde.',
  ],
  [
    'Notifications Push\n(FCM)',
    'Firebase Admin SDK\nMulticast HTTP v1',
    'Smartphones iOS\net Android',
    'Alertes réveillant l\'appareil fermé : ticket prêt, rappel de RDV 2h avant, annulation, offre promo.',
  ],
  [
    'Vérification SMS OTP\n(100% Gratuit)',
    'Firebase Phone Auth\n(SDK Client Google)',
    'App Mobile Client\net Web Auth',
    'Validation du numéro de téléphone et réinitialisation de mot de passe (10 000 SMS/mois offerts par Google).',
  ],
  [
    'SMS Transactionnel\n(Opérateurs CI)',
    'Termii SMS Gateway\n(+225 Orange, MTN, Moov)',
    'Backend Automatique\n(Workers BullMQ)',
    'SMS critiques de rappel 2h avant RDV, avertissement No-Show et confirmation de réservation payée.',
  ],
];

drawTable(summaryHeaders, summaryRows, [90, 115, 95, 205]);

callout(
  'PRINCIPE CLÉ POUR LE FRONTEND',
  'Le frontend ne doit jamais déclencher manuellement l\'envoi d\'un SMS payant. Les SMS transactionnels sont gérés à 100% par le backend via BullMQ. En revanche, pour la réinitialisation de mot de passe, le frontend utilise directement Firebase Phone Auth pour bénéficier du quota 100% gratuit de Google.',
  'purple'
);

// =============================================================================
// PAGE 2 : TEMPS RÉEL (WEBSOCKETS & SOCKET.IO)
// =============================================================================
doc.addPage();
currentSectionCategory = 'MODULE 1 : TEMPS RÉEL (SOCKET.IO)';
drawHeader();

sectionTitle('2. Module 1 : Temps Réel (WebSockets & Socket.IO)');

paragraph(
  'La passerelle QueueGateway écoute sur le namespace dédié /queue. Elle supporte deux modes d\'utilisation distincts : les clients mobiles connectés avec leur compte utilisateur, et les écrans TV installés dans les salons de coiffure fonctionnant en mode public.'
);

subSectionTitle('Paramètres de Connexion');
bullet('URL du Gateway', 'wss://api.votredomaine.com/queue (ou ws://localhost:3000/queue en local)');
bullet('Namespace Socket.IO', '/queue (très important : ne pas se connecter sur le namespace racine /)');
bullet('Transports recommandés', "['websocket', 'polling'] (privilégier le transport websocket pour une latence < 10ms)");

subSectionTitle('Les Deux Modes de Connexion');
paragraph(
  '1. Mode Utilisateur Connecté (Client Mobile, Coiffeur, Gérant) : Transmettez le jeton JWT dans handshake.auth.token. Le serveur vérifie le jeton à la connexion et fait automatiquement rejoindre le socket à la salle customer:<userId>. Les alertes nominatives sont reçues instantanément.'
);
paragraph(
  '2. Mode Écran TV Public de Salon : Aucun jeton requis ! Passez simplement le paramètre ?salonId=<uuid> dans la query de handshake. Le serveur fait automatiquement rejoindre l\'écran à la salle salon:<salonId>.'
);

subSectionTitle('Tableau des Événements Émis par le Serveur');

const wsHeaders = ['Nom de l\'Événement', 'Destinataires', 'Contenu du Payload', 'Action Frontend Recommandée'];
const wsRows = [
  [
    'ticket:called',
    'salon:<salonId>\n(Écran TV Salon)',
    '{\ntype: "TICKET_CALLED",\nticketNumber: "W-015",\ngraceMinutes: 10,\nplayChime: true\n}',
    'Faire clignoter le ticket sur la TV, afficher la fenêtre modale et jouer le son carillon (chime.mp3).',
  ],
  [
    'ticket:called',
    'customer:<userId>\n(Smartphone Client)',
    '{\ntype: "YOUR_TURN",\nticketNumber: "W-015",\nmessage: "C\'est votre tour !"\n}',
    'Vibration du smartphone, popup modale avec compte à rebours de grâce (10 min) et bouton de confirmation.',
  ],
  [
    'ticket:started',
    'salon:<salonId>',
    '{\ntype: "TICKET_STARTED",\nticketNumber: "W-015",\nstartedAt: "..."\n}',
    'Déplacer le ticket de la liste d\'attente vers la section "Prestations En cours" sur la TV et le dashboard.',
  ],
  [
    'ticket:completed',
    'salon:<salonId>',
    '{\ntype: "TICKET_COMPLETED",\nticketNumber: "W-015"\n}',
    'Retirer le ticket de la file active.',
  ],
  [
    'ticket:no_show',
    'salon:<salonId>',
    '{\ntype: "TICKET_NO_SHOW",\nticketNumber: "W-015"\n}',
    'Marquer le ticket en rouge (Non-présentation) avec mention de pénalité.',
  ],
  [
    'queue:updated',
    'salon:<salonId>',
    '{\naction: "CREATED|CALLED|...",\nticketId: "uuid"\n}',
    'Invalider le cache React Query ou réexécuter l\'appel GET /api/v1/salons/:id/queue.',
  ],
  [
    'notification:new',
    'customer:<userId>',
    'NotificationEntity (id, title, body, data, createdAt)',
    'Incrémenter le badge rouge de la cloche (+1) et afficher un toast personnalisé au premier plan.',
  ],
];

drawTable(wsHeaders, wsRows, [80, 85, 125, 215]);

subSectionTitle('Messages Émis par le Client vers le Serveur');
bullet('join:salon', 'Payload: { salonId: string } — Permet à un client de changer de salon écouté dynamiquement.');
bullet('leave:salon', 'Payload: { salonId: string } — Quitte l\'écoute des tickets d\'un salon.');
bullet('join:customer', 'Payload: { customerId: string } — Permet une écoute explicite si le handshake était non authentifié.');

// =============================================================================
// PAGE 3 : CODE TEMPS RÉEL (REACT & FLUTTER)
// =============================================================================
doc.addPage();
currentSectionCategory = 'MODULE 1 : IMPLÉMENTATION SOCKET.IO';
drawHeader();

subSectionTitle('Exemple d\'Intégration React / React Native (Custom Hook)');
paragraph('Ce hook gère la connexion persistante, la reconnexion automatique, l\'abonnement aux salles et le son audio du carillon :');

const reactCode = `import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useQueueSocket(salonId?: string, userToken?: string) {
  const socketRef = useRef<Socket | null>(null);
  const [lastCalled, setLastCalled] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const socket = io('https://api.votredomaine.com/queue', {
      auth: userToken ? { token: \`Bearer \${userToken}\` } : undefined,
      query: salonId ? { salonId } : undefined,
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connecté au WebSocket Coco Queue:', socket.id);
      if (salonId) socket.emit('join:salon', { salonId });
    });

    socket.on('ticket:called', (payload) => {
      setLastCalled(payload);
      if (payload.playChime) {
        new Audio('/sounds/chime.mp3').play().catch(() => {});
      }
    });

    socket.on('queue:updated', () => setRefreshTrigger((prev) => prev + 1));

    return () => {
      socket.disconnect();
    };
  }, [salonId, userToken]);

  return { socket: socketRef.current, lastCalled, refreshTrigger };
}`;

drawCodeBlock(reactCode);

subSectionTitle('Exemple d\'Intégration Flutter (Dart)');
paragraph('Implémentation avec le package officiel socket_io_client et audioplayers :');

const flutterCode = `import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:audioplayers/audioplayers.dart';

class QueueSocketService {
  late IO.Socket _socket;
  final AudioPlayer _audioPlayer = AudioPlayer();

  void connect({String? salonId, String? userJwt}) {
    _socket = IO.io('https://api.votredomaine.com/queue', IO.OptionBuilder()
      .setTransports(['websocket'])
      .enableAutoConnect()
      .enableReconnection()
      .setAuth(userJwt != null ? {'token': 'Bearer ' + userJwt} : {})
      .setQuery(salonId != null ? {'salonId': salonId} : {})
      .build());

    _socket.onConnect((_) => print('Connecté au WebSocket Coco Queue'));

    _socket.on('ticket:called', (data) async {
      print('Ticket appelé : \${data['ticketNumber']}');
      if (data['playChime'] == true) {
        await _audioPlayer.play(AssetSource('sounds/chime.mp3'));
      }
    });

    _socket.on('notification:new', (notif) {
      print('Notification In-App reçue : \${notif['title']}');
    });
  }

  void disconnect() => _socket.disconnect();
}`;

drawCodeBlock(flutterCode);

// =============================================================================
// PAGE 4 : NOTIFICATIONS IN-APP & PRÉFÉRENCES
// =============================================================================
doc.addPage();
currentSectionCategory = 'MODULE 2 : NOTIFICATIONS IN-APP & PRÉFÉRENCES';
drawHeader();

sectionTitle('3. Module 2 : Notifications In-App & Préférences');

paragraph(
  'Le système de notifications In-App repose sur une double approche : la réception instantanée via WebSocket (événement notification:new) dès qu\'une notification survient, et la synchronisation persistante via les endpoints REST (historique, compteur de non-lus, marquage comme lu).'
);

subSectionTitle('Répertoire Complet des Endpoints REST Notifications');

const restHeaders = ['Méthode & Route', 'Authentification', 'Description & Rôle', 'Exemple Réponse'];
const restRows = [
  [
    'GET\n/api/v1/notifications',
    'Bearer JWT\n(Requis)',
    'Historique paginé des notifications du compte connecté. Supporte query params: page, limit, isRead, salonId.',
    '{\ntotal: 12,\nnotifications: [{\nid: "uuid",\ntitle: "...",\nisRead: false\n}]\n}',
  ],
  [
    'GET\n/api/v1/notifications/unread-count',
    'Bearer JWT\n(Requis)',
    'Retourne le nombre exact de notifications non lues. Idéal pour afficher la pastille rouge sur la cloche à l\'ouverture de l\'app.',
    '{\nunreadCount: 3\n}',
  ],
  [
    'PATCH\n/api/v1/notifications/:id/read',
    'Bearer JWT\n(Requis)',
    'Marque une notification spécifique comme lue dès que l\'utilisateur clique dessus.',
    '{\nid: "uuid",\nisRead: true,\nreadAt: "2026-10-20..."\n}',
  ],
  [
    'PATCH\n/api/v1/notifications/read-all',
    'Bearer JWT\n(Requis)',
    'Marque l\'ensemble des notifications non lues de l\'utilisateur comme lues en une seule requête.',
    '{\ncount: 3\n}',
  ],
  [
    'GET\n/api/v1/notifications/preferences',
    'Bearer JWT\n(Requis)',
    'Récupère les préférences de réception des notifications de l\'utilisateur pour chaque canal.',
    '{\npushEnabled: true,\nsmsEnabled: true,\ninAppEnabled: true,\nwhatsappEnabled: true\n}',
  ],
  [
    'PATCH\n/api/v1/notifications/preferences',
    'Bearer JWT\n(Requis)',
    'Met à jour les préférences de canaux de l\'utilisateur. Corps JSON avec les booléens modifiés.',
    '{\nsmsEnabled: false\n}',
  ],
];

drawTable(restHeaders, rowsClean(restRows), [120, 75, 185, 125]);

function rowsClean(r) { return r; }

callout(
  'STRATÉGIE DE MISE À JOUR DU BADGE CLOCHE',
  'Au lancement de l\'application : appelez GET /api/v1/notifications/unread-count. Lorsque l\'application est ouverte et que le WebSocket reçoit notification:new, incrémentez immédiatement la valeur locale de +1 sans faire de requête HTTP. Lorsque l\'utilisateur consulte la liste, appelez PATCH /api/v1/notifications/read-all pour remettre le compteur à 0.',
  'info'
);

// =============================================================================
// PAGE 5 : NOTIFICATIONS PUSH FIREBASE (FCM)
// =============================================================================
doc.addPage();
currentSectionCategory = 'MODULE 3 : PUSH FIREBASE (FCM)';
drawHeader();

sectionTitle('4. Module 3 : Notifications Push Firebase (FCM)');

paragraph(
  'Les notifications Push permettent de réveiller le smartphone d\'un client même lorsque l\'application est fermée. Le backend envoie les messages au format Multicast HTTP v1 de Firebase en ciblant les tokens enregistrés dans la table UserDevice.'
);

subSectionTitle('Cycle de Vie & Flux d\'Enregistrement du Token');
bullet('1. Demande de Permission', 'Dès l\'installation ou la première connexion, demander l\'autorisation système (obligatoire sur iOS et Android 13+).');
bullet('2. Récupération du FCM Token', 'Obtenir la clé unique délivrée par Google via FirebaseMessaging.instance.getToken().');
bullet('3. Enregistrement auprès du Backend', 'Appeler POST /api/v1/notifications/devices avec le token et l\'identifiant unique de l\'appareil.');
bullet('4. Rafraîchissement automatique', 'Écouter onTokenRefresh pour mettre à jour le token si Firebase le renouvelle.');
bullet('5. Dissociation lors du Logout', 'Appeler DELETE /api/v1/notifications/devices/:deviceId pour empêcher la réception de messages après déconnexion.');

subSectionTitle('Nouveaux Endpoints Backend Dédiés aux Appareils (FCM)');

const deviceHeaders = ['Méthode & Route', 'Corps de Requête (JSON)', 'Description & Sécurité'];
const deviceRows = [
  [
    'POST\n/api/v1/notifications/devices',
    '{\n  "deviceId": "uuid-materiel",\n  "platform": "android|ios|web",\n  "pushToken": "fK9s...vKpQ",\n  "appVersion": "1.0.0"\n}',
    'Enregistre ou met à jour le token FCM de l\'appareil connecté. Requiert l\'en-tête Authorization: Bearer <TOKEN>. Gère automatiquement les doublons grâce à un upsert sur (userId, deviceId).',
  ],
  [
    'DELETE\n/api/v1/notifications/devices/:deviceId',
    'Aucun (Paramètre dans l\'URL)',
    'Supprime l\'appareil de la base de données. Doit obligatoirement être appelé lors du bouton "Se Déconnecter" (Logout).',
  ],
];

drawTable(deviceHeaders, deviceRows, [140, 165, 200]);

subSectionTitle('Gestion des 3 États de l\'Application Mobile');
bullet('1. État Foreground (App au premier plan)', 'Par défaut, Firebase ne fait pas vibrer ni n\'affiche de bannière. Le listener onMessage reçoit l\'alerte : le frontend doit afficher un SnackBar, un bandeau In-App ou un dialogue personnalisé.');
bullet('2. État Background (App en arrière-plan)', 'Le système d\'exploitation gère automatiquement l\'affichage natif de la bannière. Lors du clic utilisateur, l\'événement onMessageOpenedApp est déclenché.');
bullet('3. État Terminated (App complètement tuée)', 'Le clic sur la notification relance l\'application. L\'événement getInitialMessage() fournit les métadonnées (ticketId, bookingId) pour rediriger l\'utilisateur vers le bon écran.');

// =============================================================================
// PAGE 6 : CODE PUSH FCM (FLUTTER)
// =============================================================================
doc.addPage();
currentSectionCategory = 'MODULE 3 : CODE PUSH FCM';
drawHeader();

subSectionTitle('Service Flutter Complet pour Push Notifications');

const flutterFcmCode = `import 'dart:io';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class PushNotificationService {
  final FirebaseMessaging _fcm = FirebaseMessaging.instance;
  final DeviceInfoPlugin _deviceInfo = DeviceInfoPlugin();

  Future<void> initializeAndRegister(String accessToken) async {
    // 1. Demander permission
    NotificationSettings settings = await _fcm.requestPermission(
      alert: true, badge: true, sound: true,
    );
    if (settings.authorizationStatus != AuthorizationStatus.authorized) return;

    // 2. Token FCM & ID Unique Appareil
    String? token = await _fcm.getToken();
    String deviceId = await _getDeviceId();
    String platform = Platform.isIOS ? 'ios' : 'android';

    if (token != null) {
      await _syncDeviceWithBackend(accessToken, deviceId, platform, token);
    }

    // 3. Écoute du renouvellement de token
    _fcm.onTokenRefresh.listen((newToken) {
      _syncDeviceWithBackend(accessToken, deviceId, platform, newToken);
    });

    // 4. Écoute en Foreground (Application ouverte)
    FirebaseMessaging.onMessage.listen((RemoteMessage msg) {
      print('Push reçu au premier plan : \${msg.notification?.title}');
    });

    // 5. Clic utilisateur pour redirection
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage msg) {
      _routeFromNotification(msg.data);
    });
  }

  Future<void> _syncDeviceWithBackend(String jwt, String devId, String plat, String tok) async {
    await http.post(
      Uri.parse('https://api.votredomaine.com/api/v1/notifications/devices'),
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt},
      body: jsonEncode({
        'deviceId': devId, 'platform': plat, 'pushToken': tok, 'appVersion': '1.0.0',
      }),
    );
  }

  Future<void> unregisterDevice(String jwt) async {
    String deviceId = await _getDeviceId();
    await http.delete(
      Uri.parse('https://api.votredomaine.com/api/v1/notifications/devices/' + deviceId),
      headers: {'Authorization': 'Bearer ' + jwt},
    );
  }

  Future<String> _getDeviceId() async {
    if (Platform.isAndroid) {
      return (await _deviceInfo.androidInfo).id;
    }
    return (await _deviceInfo.iosInfo).identifierForVendor ?? 'ios-device';
  }

  void _routeFromNotification(Map<String, dynamic> data) {
    if (data['ticketId'] != null) {
      // Naviguer vers l'écran du ticket
    }
  }
}`;

drawCodeBlock(flutterFcmCode);

// =============================================================================
// PAGE 7 : SMS & FIREBASE PHONE AUTH
// =============================================================================
doc.addPage();
currentSectionCategory = 'MODULE 4 : SMS & FIREBASE PHONE AUTH';
drawHeader();

sectionTitle('5. Module 4 : SMS & Authentification Firebase OTP');

paragraph(
  'Le projet applique une séparation stratégique stricte entre les SMS d\'authentification/sécurité (100% gratuits) et les SMS transactionnels métiers.'
);

subSectionTitle('Comparatif Stratégique des Deux Systèmes SMS');

const smsHeaders = ['Fonctionnalité', 'Vérification & Reset MDP', 'SMS Transactionnels Salons'];
const smsRows = [
  ['Fournisseur', 'Firebase Phone Auth (Google)', 'Termii SMS Gateway'],
  ['Coût pour le Projet', '100% Gratuit (10 000 SMS / mois)', 'Facturé au volume (opérateurs locaux)'],
  ['Acteur à l\'Initiative', 'Le SDK Frontend Mobile / Web', 'Le Backend Automatique (BullMQ)'],
  ['Vérification', 'Preuve cryptographique via firebaseIdToken', 'Numéro normalisé +225 (CI)'],
  ['Cas d\'Application', '• Réinitialisation de mot de passe\n• Validation premier numéro', '• Rappel RDV 2h avant\n• Alerte No-Show / Annulation'],
];

drawTable(smsHeaders, smsRows, [115, 195, 195]);

subSectionTitle('Flux Firebase Phone Auth OTP (Réinitialisation Mot de Passe)');
paragraph(
  '1. Le frontend saisit le numéro au format international obligatoire (+2250700000000).\n2. Le frontend appelle verifyPhoneNumber du SDK Firebase.\n3. Google expédie gratuitement le SMS contenant le code à 6 chiffres.\n4. L\'utilisateur tape le code reçu dans l\'interface.\n5. Firebase authentifie le code et génère un jeton signé idToken.\n6. Le frontend envoie le idToken au backend via POST /api/v1/auth/reset-password.\n7. Le backend valide le jeton auprès de Google, met à jour le mot de passe et révoque toutes les sessions compromises.'
);

subSectionTitle('Code Flutter de Réinitialisation de Mot de Passe');

const otpCode = `import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

final FirebaseAuth _auth = FirebaseAuth.instance;
String? _verificationId;

// 1. Déclencher le SMS gratuit
Future<void> sendOtp(String rawPhone) async {
  await _auth.verifyPhoneNumber(
    phoneNumber: rawPhone, // Format obligatoire: "+2250701020304"
    timeout: const Duration(seconds: 60),
    verificationCompleted: (cred) => resetPasswordWithCredential(cred, 'NouveauMdp!'),
    verificationFailed: (e) => print('Erreur SMS: \${e.message}'),
    codeSent: (verifId, _) => _verificationId = verifId,
    codeAutoRetrievalTimeout: (verifId) => _verificationId = verifId,
  );
}

// 2. Valider le code à 6 chiffres tapé et appeler le backend
Future<void> verifyAndReset(String code, String newPassword) async {
  final cred = PhoneAuthProvider.credential(
    verificationId: _verificationId!,
    smsCode: code,
  );
  await resetPasswordWithCredential(cred, newPassword);
}

Future<void> resetPasswordWithCredential(PhoneAuthCredential cred, String newMdp) async {
  final userCred = await _auth.signInWithCredential(cred);
  final idToken = await userCred.user?.getIdToken(true);

  final res = await http.post(
    Uri.parse('https://api.votredomaine.com/api/v1/auth/reset-password'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'firebaseIdToken': idToken, 'newPassword': newMdp}),
  );

  if (res.statusCode == 200) {
    print('Mot de passe réinitialisé avec succès !');
  }
}`;

drawCodeBlock(otpCode);

// =============================================================================
// PAGE 8 : CHECKLIST FINALE D'INTÉGRATION
// =============================================================================
doc.addPage();
currentSectionCategory = 'CHECKLIST FINALE D\'INTÉGRATION';
drawHeader();

sectionTitle('6. Checklist Finale d\'Intégration Frontend');

paragraph(
  'Pour garantir une mise en production sans faille et sans étape oubliée, vérifiez chaque point ci-dessous avant toute validation QA :'
);

subSectionTitle('1. Module Temps Réel (WebSockets / Socket.IO)');
bullet('[] Connexion Namespace', 'Vérifier que la connexion pointe bien vers /queue et non /.');
bullet('[] Reconnexion automatique', 'Configurer reconnection: true avec délai exponentiel (1s -> 5s).');
bullet('[] Gestion Authentification', 'Envoyer le Bearer JWT dans auth.token pour les mobiles, ou ?salonId pour la TV.');
bullet('[] Sonnerie Carillon Audio', 'Tester la lecture du son chime.mp3 lors de l\'événement ticket:called avec playChime: true.');
bullet('[] Invalidation Cache', 'Brancher l\'événement queue:updated sur le rafraîchissement des listes de tickets.');

subSectionTitle('2. Notifications In-App & Centre de Notifications');
bullet('[] Compteur Badge Rouge', 'Appeler GET /api/v1/notifications/unread-count au démarrage de l\'application.');
bullet('[] Mise à jour en direct', 'Incrémenter le badge lors de la réception de l\'événement WebSocket notification:new.');
bullet('[] Lecture à l\'ouverture', 'Appeler PATCH /api/v1/notifications/:id/read au clic sur un élément.');
bullet('[] Écran Préférences', 'Permettre à l\'utilisateur d\'activer/désactiver les canaux dans ses paramètres.');

subSectionTitle('3. Notifications Push Firebase (FCM)');
bullet('[] Déclarations OS', 'Fichiers google-services.json (Android) et GoogleService-Info.plist (iOS) installés.');
bullet('[] Permissions Requises', 'Demander la permission système dès la fin du tutoriel / onboarding.');
bullet('[] Enregistrement Backend', 'Appeler POST /api/v1/notifications/devices dès que l\'utilisateur est connecté.');
bullet('[] Écoute Token Refresh', 'Ré-enregistrer le token automatiquement sur l\'événement onTokenRefresh.');
bullet('[] Nettoyage au Logout', 'Appeler obligatoirement DELETE /api/v1/notifications/devices/:deviceId à la déconnexion.');
bullet('[] Redirection Métier', 'Vérifier que le clic sur la notification redirige vers le bon écran (ticketId / bookingId).');

subSectionTitle('4. SMS & Authentification Firebase OTP');
bullet('[] Console Firebase', 'Activer le fournisseur Téléphone dans la console Firebase Authentication.');
bullet('[] Empreintes SHA', 'Renseigner les clés SHA-1 et SHA-256 dans Firebase pour éviter le captcha Web sur Android.');
bullet('[] Numéro International', 'S\'assurer que le frontend formate toujours le numéro avec le préfixe +225.');
bullet('[] Sécurité idToken', 'Ne jamais envoyer le code OTP en clair au backend, uniquement le firebaseIdToken signé.');

callout(
  'CONSEIL DE VALIDATION EN ÉQUIPE',
  'Avant la livraison aux bêta-testeurs, réalisez un test de bout en bout : Prenez un ticket d\'attente, fermez l\'application, appelez le ticket depuis l\'espace coiffeur et observez l\'arrivée de la notification Push, le son sur la TV du salon et la mise à jour du badge à la réouverture.',
  'success'
);

// =============================================================================
// PIED DE PAGE DYNAMIQUE SUR TOUTES LES PAGES
// =============================================================================
const range = doc.bufferedPageRange();
for (let i = range.start; i < range.start + range.count; i++) {
  doc.switchToPage(i);
  doc.page.margins.bottom = 0;
  
  doc.save();
  const footerY = PAGE_HEIGHT - 32;
  doc.rect(45, footerY, CONTENT_WIDTH, 0.5).fill(SLATE_200);
  
  doc.fontSize(7).font('Helvetica').fillColor(SLATE_500)
     .text('DOCUMENT TECHNIQUE FRONTEND — PLATEFORME COCO (COCOTAILLE & COCOMOUSSO)', 45, footerY + 6, {
       lineBreak: false,
     });
  
  doc.fontSize(7).font('Helvetica-Bold').fillColor(PRIMARY)
     .text(`Page ${i + 1} sur ${range.count}`, 45, footerY + 6, {
       width: CONTENT_WIDTH,
       align: 'right',
       lineBreak: false,
     });
  doc.restore();
}

doc.end();

writeStream.on('finish', () => {
  console.log('PDF généré avec succès :', outputPath);
});
writeStream.on('error', (err) => {
  console.error('Erreur lors de la génération du PDF :', err);
});
