import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

const outputPath = path.resolve('ARCHITECTURE_TEMPS_REEL_ET_NOTIFICATIONS_COCO_API.pdf');

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 40, bottom: 45, left: 45, right: 45 },
  bufferPages: true,
  autoFirstPage: true,
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// --- COULEURS ---
const PRIMARY = '#BE123C'; // Rose Framboise Coco
const PRIMARY_DARK = '#881337';
const PRIMARY_LIGHT = '#FFE4E6';
const SLATE_900 = '#0F172A';
const SLATE_800 = '#1E293B';
const SLATE_700 = '#334155';
const SLATE_600 = '#475569';
const SLATE_500 = '#64748B';
const SLATE_200 = '#E2E8F0';
const SLATE_100 = '#F1F5F9';
const SLATE_50 = '#F8FAFC';
const EMERALD = '#059669';
const EMERALD_LIGHT = '#D1FAE5';
const AMBER = '#D97706';
const AMBER_LIGHT = '#FEF3C7';
const BLUE = '#2563EB';
const BLUE_LIGHT = '#DBEAFE';

const PAGE_WIDTH = doc.page.width;
const PAGE_HEIGHT = doc.page.height;
const CONTENT_WIDTH = PAGE_WIDTH - 90; // 505 pt

let currentSectionCategory = 'ARCHITECTURE TECHNIQUE & RECOMMANDATIONS';

function drawHeader() {
  doc.save();
  doc.rect(45, 30, CONTENT_WIDTH, 2.5).fill(PRIMARY);
  
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor(SLATE_500)
     .text(currentSectionCategory.toUpperCase(), 45, 38, { align: 'left' });
  doc.fontSize(7.5).font('Helvetica')
     .text('PROJET COCO API - NESTJS 12 / CLEAN ARCHITECTURE', 45, 38, { width: CONTENT_WIDTH, align: 'right' });
  
  doc.restore();
  doc.y = 58;
}

function checkPageSpace(needed) {
  if (doc.y + needed > PAGE_HEIGHT - 50) {
    doc.addPage();
    drawHeader();
  }
}

function sectionTitle(title, subtitle = null) {
  checkPageSpace(50);
  doc.moveDown(0.5);
  
  const curY = doc.y;
  doc.save();
  doc.rect(45, curY, 4, 18).fill(PRIMARY);
  doc.fontSize(12).font('Helvetica-Bold').fillColor(SLATE_900)
     .text(title, 56, curY + 2);
  doc.restore();
  
  doc.y = curY + 22;
  if (subtitle) {
    doc.fontSize(8.5).font('Helvetica-Oblique').fillColor(SLATE_500)
       .text(subtitle, 56, doc.y);
    doc.y += 13;
  }
}

function subSectionTitle(title) {
  checkPageSpace(30);
  doc.moveDown(0.3);
  doc.fontSize(10).font('Helvetica-Bold').fillColor(PRIMARY_DARK).text(title, 45, doc.y);
  doc.y += 4;
}

function paragraph(text) {
  checkPageSpace(22);
  doc.fontSize(8.5).font('Helvetica').fillColor(SLATE_700).text(text, 45, doc.y, {
    width: CONTENT_WIDTH,
    align: 'justify',
    lineGap: 2.5,
  });
  doc.y += 4;
}

function bullet(title, text) {
  checkPageSpace(20);
  const curY = doc.y;
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor(SLATE_900).text('• ' + title + ' : ', 45, curY, {
    continued: true,
  });
  doc.fontSize(8.5).font('Helvetica').fillColor(SLATE_700).text(text, {
    width: CONTENT_WIDTH - 10,
    lineGap: 2,
  });
  doc.y += 3;
}

function callout(title, text, type = 'info') {
  const bgColor = type === 'success' ? EMERALD_LIGHT : type === 'warning' ? AMBER_LIGHT : BLUE_LIGHT;
  const borderColor = type === 'success' ? EMERALD : type === 'warning' ? AMBER : BLUE;
  const textColor = type === 'success' ? '#065F46' : type === 'warning' ? '#92400E' : '#1E40AF';
  
  doc.fontSize(8).font('Helvetica');
  const textHeight = doc.heightOfString(text, { width: CONTENT_WIDTH - 24, lineGap: 1.5 });
  const boxHeight = textHeight + 24;
  
  checkPageSpace(boxHeight + 8);
  const startY = doc.y;
  
  doc.save();
  doc.roundedRect(45, startY, CONTENT_WIDTH, boxHeight, 4).fill(bgColor);
  doc.rect(45, startY, 4, boxHeight).fill(borderColor);
  
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor(textColor).text(title, 57, startY + 6);
  doc.fontSize(8).font('Helvetica').fillColor(SLATE_700).text(text, 57, startY + 18, {
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
  doc.rect(45, curY, CONTENT_WIDTH, 18).fill(SLATE_900);
  let curX = 45;
  headers.forEach((h, i) => {
    doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#FFFFFF')
       .text(h, curX + 5, curY + 4, { width: colWidths[i] - 10 });
    curX += colWidths[i];
  });
  doc.restore();
  curY += 18;

  // Calculate & Draw Rows
  rows.forEach((row, rIdx) => {
    doc.fontSize(7.5).font('Helvetica');
    const heights = row.map((cell, cIdx) => 
      doc.heightOfString(cell, { width: colWidths[cIdx] - 10, lineGap: 1.5 })
    );
    const rowHeight = Math.max(...heights) + 8;

    if (curY + rowHeight > PAGE_HEIGHT - 50) {
      doc.addPage();
      drawHeader();
      curY = doc.y;
      
      // Redessiner entête de tableau
      doc.save();
      doc.rect(45, curY, CONTENT_WIDTH, 18).fill(SLATE_900);
      let hX = 45;
      headers.forEach((h, i) => {
        doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#FFFFFF')
           .text(h, hX + 5, curY + 4, { width: colWidths[i] - 10 });
        hX += colWidths[i];
      });
      doc.restore();
      curY += 18;
    }

    doc.save();
    if (rIdx % 2 === 0) {
      doc.rect(45, curY, CONTENT_WIDTH, rowHeight).fill(SLATE_50);
    }
    doc.rect(45, curY, CONTENT_WIDTH, rowHeight).stroke(SLATE_200);

    let cellX = 45;
    row.forEach((cell, cIdx) => {
      doc.fontSize(7.5).font(cIdx === 0 ? 'Helvetica-Bold' : 'Helvetica')
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
  doc.fontSize(7).font('Courier');
  const codeHeight = doc.heightOfString(code, { width: CONTENT_WIDTH - 20, lineGap: 1.5 }) + 14;
  checkPageSpace(codeHeight + 6);
  
  const startY = doc.y;
  doc.save();
  doc.roundedRect(45, startY, CONTENT_WIDTH, codeHeight, 4).fill(SLATE_800);
  doc.fontSize(7).font('Courier').fillColor('#F8FAFC')
     .text(code, 55, startY + 7, { width: CONTENT_WIDTH - 20, lineGap: 1.5 });
  doc.restore();
  
  doc.y = startY + codeHeight + 6;
}

// =============================================================================
// PAGE 1 : COUVERTURE & RÉSUMÉ EXÉCUTIF
// =============================================================================

// Bandeau supérieur
doc.rect(0, 0, PAGE_WIDTH, 160).fill(PRIMARY_DARK);
doc.rect(0, 156, PAGE_WIDTH, 4).fill(PRIMARY);

doc.save();
doc.fontSize(10).font('Helvetica-Bold').fillColor(PRIMARY_LIGHT)
   .text('DOSSIER D\'ARCHITECTURE TECHNIQUE & STRATÉGIE INGÉNIERIE', 45, 42);

doc.fontSize(20).font('Helvetica-Bold').fillColor('#FFFFFF')
   .text('COCO API : TEMPS RÉEL, GESTION DE QUEUE & NOTIFICATIONS', 45, 62, { width: 500, lineGap: 3 });

doc.fontSize(9.5).font('Helvetica').fillColor('#FFE4E6')
   .text('Spécifications d\'implémentation NestJS 12, Socket.io, BullMQ & Notifications Omnicanal', 45, 120);
doc.restore();

doc.y = 180;

// Cartouche Métadonnées
const metaY = doc.y;
doc.save();
doc.roundedRect(45, metaY, CONTENT_WIDTH, 68, 5).fill(SLATE_100).stroke(SLATE_200);

doc.fontSize(7.5).font('Helvetica-Bold').fillColor(SLATE_500).text('PROJET & APPLICATION', 60, metaY + 10);
doc.fontSize(9).font('Helvetica-Bold').fillColor(SLATE_900).text('Coco API (CocoTaille / CocoMousso)', 60, metaY + 22);
doc.fontSize(7.5).font('Helvetica').fillColor(SLATE_600).text('Plateforme Salons de Beauté (Abidjan / Côte d\'Ivoire)', 60, metaY + 35);

doc.fontSize(7.5).font('Helvetica-Bold').fillColor(SLATE_500).text('EXPERTISE & RÔLE', 245, metaY + 10);
doc.fontSize(9).font('Helvetica-Bold').fillColor(SLATE_900).text('Lead Architecte & Expert NestJS', 245, metaY + 22);
doc.fontSize(7.5).font('Helvetica').fillColor(SLATE_600).text('Architecture Événementielle & Systèmes Distribués', 245, metaY + 35);

doc.fontSize(7.5).font('Helvetica-Bold').fillColor(SLATE_500).text('DATE & STATUT', 415, metaY + 10);
doc.fontSize(9).font('Helvetica-Bold').fillColor(SLATE_900).text('30 Septembre 2026', 415, metaY + 22);
doc.fontSize(7.5).font('Helvetica-Bold').fillColor(EMERALD).text('VALIDÉ POUR TRANSMISSION', 415, metaY + 35);
doc.restore();

doc.y = metaY + 84;

subSectionTitle('RÉSUMÉ EXÉCUTIF');
paragraph(
  "Ce document technique est destiné à l'équipe d'ingénierie Coco API. Il fournit les directives d'architecture pour moderniser la plateforme vers un modèle réactif et événementiel. Il détaille la mise en œuvre du temps réel pour la file d'attente (écrans salon et smartphones clients), la gestion asynchrone des délais de grâce (résolution automatique des No-Show en 10 minutes), l'expiration automatique des créneaux non payés, ainsi qu'un système complet de notifications multi-canal adapté aux spécificités de la Côte d'Ivoire (WhatsApp, SMS, Push FCM, In-App)."
);

doc.moveDown(0.4);
subSectionTitle('TABLE DES MATIÈRES SYNTHÉTIQUE');

const toc = [
  { num: '01', title: 'Diagnostic de l\'Existant & Vulnérabilités Identifiées', desc: 'Analyse du module Queue, synchronisme et absence de moteur de jobs.' },
  { num: '02', title: 'Architecture Cible : Modèle Événementiel Réactif (DDD)', desc: 'Découplage strict entre Domain Events, WebSockets et Workers asynchrones.' },
  { num: '03', title: 'Benchmark & Stack Technologique Recommandée', desc: 'Sélection argumentée de Socket.io, BullMQ, Redis, FCM et WhatsApp/SMS.' },
  { num: '04', title: 'Cas d\'Usage Clés & Mécanismes Métier Détaillés', desc: 'Cycle de vie d\'un ticket, timer de grâce de 10 min, webhooks Mobile Money.' },
  { num: '05', title: 'Évolution du Schéma de Données (Prisma)', desc: 'Modèle de persistance Notification et stratégie multi-canal.' },
  { num: '06', title: 'Feuille de Route d\'Implémentation en 4 Phases', desc: 'Plan d\'exécution pas à pas avec bonnes pratiques pour l\'équipe.' },
];

toc.forEach((item) => {
  const itemY = doc.y;
  doc.rect(45, itemY, 18, 14).fill(PRIMARY_LIGHT);
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor(PRIMARY_DARK).text(item.num, 48, itemY + 3);
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor(SLATE_900).text(item.title, 70, itemY + 2);
  doc.fontSize(7.5).font('Helvetica').fillColor(SLATE_500).text(item.desc, 70, itemY + 14);
  doc.y = itemY + 26;
});

// =============================================================================
// PAGE 2 : DIAGNOSTIC & ARCHITECTURE CIBLE
// =============================================================================
doc.addPage();
currentSectionCategory = '01. DIAGNOSTIC TECHNIQUE & ARCHITECTURE CIBLE';
drawHeader();

sectionTitle('1. ÉTAT DES LIEUX DE LA CODEBASE & CONSTAT', 'Analyse du code source existant dans le projet coco_api');

paragraph(
  "L'inspection de la solution coco_api met en évidence une application NestJS 12 et Prisma v6 très bien structurée selon les principes de la Clean Architecture (couches domain, application, infrastructure, presentation). Les entités, DTOs et interfaces de repository sont isolés et testables."
);

subSectionTitle('Constat des 3 Manques Techniques Majeurs :');
bullet('1. Polling HTTP sur la Queue', 'Le dashboard de file d\'attente (GetLiveQueueDashboardUseCase) est uniquement accessible via des requêtes REST répétées. En l\'absence de communication bidirectionnelle, les écrans TV des salons et les applications mobiles doivent interroger le serveur en continu, ce qui sature la bande passante et induit une latence dans l\'affichage des numéros appelés.');
bullet('2. Non-Résolution des Délais de Grâce (No-Show)', 'Lorsqu\'un ticket est appelé dans QueueLifecycleUseCase, un délai de 10 minutes est assigné dans callDeadlineAt. Toutefois, aucun processus autonome ne vient clore le ticket si le client ne se présente pas. Le ticket reste indéfiniment en statut CALLED, bloquant la chaîne opérationnelle du salon.');
bullet('3. Traitements Tiers Bloquants', 'L\'envoi de notifications (SMS, WhatsApp, Push) au sein du cycle de vie des requêtes HTTP expose le serveur aux latences des API externes (Orange, MTN, Wave, Meta, Twilio), avec un risque élevé de timeouts et de saturation de l\'Event Loop Node.js.');

callout(
  'DIRECTIVE LEAD ARCHITECTE',
  'Le métier applicatif ne doit jamais être ralenti par des opérations d\'I/O externes. Les Use Cases doivent exécuter leur logique pure, sauvegarder en base, puis émettre un événement. L\'infrastructure se charge de réagir en temps réel ou de manière différée.',
  'warning'
);

sectionTitle('2. ARCHITECTURE CIBLE : DÉCOUPLAGE ÉVÉNEMENTIEL (DDD)', 'Synergie entre Domain Events, WebSockets et Distributed Queues');

paragraph(
  "L'architecture cible adoptée s'articule autour du principe d'Event-Driven Architecture (EDA) :"
);

bullet('Couche Application (Métier Pur)', 'Les usecases (ex: QueueLifecycleUseCase) modifient l\'état en base via les repositories Prisma, puis publient un événement domaine typé via EventEmitter2 (@nestjs/event-emitter). Le use case ignore totalement si l\'événement sera diffusé sur une TV ou envoyé par SMS.');
bullet('Couche Présentation Temps Réel (WebSockets)', 'Une Gateway Socket.io dédiée intercepte les événements (@OnEvent) et pousse la donnée dans les Rooms ciblées : la room du salon (salon:${salonId}) pour l\'affichage général, et la room client (customer:${customerId}) pour le smartphone personnel.');
bullet('Couche Infrastructure Asynchrone (BullMQ)', 'Un Event Listener spécifique intercepte également l\'événement pour déléguer les actions lourdes à des workers Redis : programmation d\'un timer différé de 10 min pour le contrôle No-Show, et envoi résilient des SMS / WhatsApp.');

// =============================================================================
// PAGE 3 : BENCHMARK & CHOIX DES OUTILS
// =============================================================================
doc.addPage();
currentSectionCategory = '02. BENCHMARK & SÉLECTION DES OUTILS';
drawHeader();

sectionTitle('3. BENCHMARK & SÉLECTION DES TECHNOLOGIES', 'Choix des briques modernes pour une haute résilience');

paragraph(
  "Les technologies retenues garantissent une compatibilité maximale avec l'écosystème NestJS 12 tout en tenant compte de l'infrastructure mobile et réseau en Côte d'Ivoire (réseaux 3G/4G hétérogènes, usage massif de WhatsApp et du SMS)."
);

const toolsHeaders = ['Périmètre', 'Solution Retenue', 'Alternative Rejetée', 'Avantages & Justification Technique'];
const toolsRows = [
  [
    'Temps Réel (WebSockets)',
    'Socket.io + Redis Adapter\n(@nestjs/platform-socket.io)',
    'WS natif pur\nServer-Sent Events (SSE)',
    '• Support natif des Rooms et Namespaces par salon.\n• Reconnexion automatique avec backoff.\n• Fallback HTTP Long-Polling vital pour les mobiles en zone réseau faible.',
  ],
  [
    'Files Asynchrones & Délais',
    'BullMQ + Redis\n(@nestjs/bullmq, ioredis)',
    'RabbitMQ / Kafka\nSimple @Cron NestJS',
    '• Support des Delayed Jobs (indispensable pour le timer No-Show 10 min).\n• Gestion native des retries exponentiels.\n• Léger, persistant et hyper-performant sur Redis.',
  ],
  [
    'Supervision des Queues',
    '@bull-board/nestjs',
    'Scripts CLI / Logs bruts',
    '• Interface web d\'administration pour observer l\'état des jobs (waiting, active, failed).\n• Relance des jobs échoués (Dead-Letter Queue) en 1 clic.',
  ],
  [
    'Bus Événements Métier',
    '@nestjs/event-emitter\n(EventEmitter2)',
    'Couplage direct dans UseCase',
    '• Découplage complet de la Clean Architecture.\n• Permet de brancher WebSockets, BullMQ et Analytics sans toucher au Use Case.',
  ],
  [
    'Push Notifications',
    'Firebase Cloud Messaging (FCM v1)',
    'OneSignal propriétaire',
    '• Gratuit, standard mondial Android & iOS.\n• Envoi de payloads de données silencieux pour mise à jour de l\'app en arrière-plan.',
  ],
  [
    'SMS & WhatsApp (Afrique)',
    'WhatsApp Cloud API + Termii\n(Fallback: Twilio / Infobip)',
    'Passerelles locales non documentées',
    '• WhatsApp : taux d\'ouverture > 95% en Côte d\'Ivoire.\n• Termii : excellent taux de délivrabilité SMS sur les préfixes Orange/MTN/Moov CI.',
  ],
];

drawTable(toolsHeaders, toolsRows, [85, 120, 100, 200]);

subSectionTitle('Pourquoi éliminer le Cron PostgreSQL au profit de BullMQ ?');
paragraph(
  "L'approche classique par Cron (@Cron de NestJS exécuté toutes les minutes) impose d'interroger la table QueueTicket avec SELECT * FROM ... WHERE callDeadlineAt < NOW(). Cela provoque une surcharge d'I/O et de verrouillages sur PostgreSQL, tout en créant une latence pouvant aller jusqu'à 60 secondes. Avec BullMQ, le timer est différé dans Redis : l'exécution est déclenchée à la seconde exacte sans solliciter la base PostgreSQL durant toute la période d'attente."
);

// =============================================================================
// PAGE 4 : CAS D'USAGE MÉTIER & CODE D'EXEMPLE
// =============================================================================
doc.addPage();
currentSectionCategory = '03. CAS D\'USAGE CLÉS & MÉCANISMES MÉTIER';
drawHeader();

sectionTitle('4. CAS D\'USAGE CLÉS & FLUX OPÉRATIONNELS', 'Application concrète au cycle de vie de la file et des réservations');

subSectionTitle('A. Scénario : Appel d\'un Ticket & Résolution Automatique du No-Show');
paragraph(
  "Lorsqu'un coiffeur appelle un ticket via QueueLifecycleUseCase.callTicket() :"
);

bullet('1. Changement d\'état', 'Le ticket passe en CALLED, avec callDeadlineAt = NOW() + 10 minutes.');
bullet('2. Émission de l\'événement', 'Le usecase émet l\'événement QueueTicketCalledEvent avec les métadonnées.');
bullet('3. Diffusion Temps Réel', 'La Gateway Socket.io diffuse sur salon:${salonId} (mise à jour de l\'écran TV d\'affichage avec carillon sonore) et sur customer:${customerId} (vibration et compte à rebours interactif de 10 min sur le smartphone du client).');
bullet('4. Armement du Timer BullMQ', 'Un job différé check-ticket-no-show est inséré dans Redis avec delay: 600000 (10 min).');
bullet('5. Traitement à Échéance', 'À T+10 min, si le ticket est toujours en statut CALLED (le client ne s\'est pas présenté), le worker le passe en NO_SHOW, libère la place et avertit le salon pour appeler le ticket suivant.');

drawCodeBlock(`// Worker BullMQ dédié à l'automatisation du No-Show (src/module/queue/infrastructure/workers/)
@Processor('queue-lifecycle')
export class QueueLifecycleWorker extends WorkerHost {
  constructor(
    @Inject(QUEUE_REPOSITORY) private readonly queueRepo: IQueueRepository,
    private readonly eventEmitter: EventEmitter2,
  ) { super(); }

  async process(job: Job<{ ticketId: string; salonId: string }>) {
    if (job.name === 'check-ticket-no-show') {
      const ticket = await this.queueRepo.findById(job.data.ticketId);
      if (ticket && ticket.status === QueueTicketStatus.CALLED) {
        ticket.markAsNoShow();
        await this.queueRepo.update(ticket);
        this.eventEmitter.emit('queue.ticket.no_show', new QueueTicketNoShowEvent(ticket));
      }
    }
  }
}`);

subSectionTitle('B. Scénario : Verrouillage Temporaire de Créneau (Hold 15 min)');
paragraph(
  "Lors de la prise de RDV avec acompte Mobile Money, la réservation est en attente (PENDING_DEPOSIT). Un job différé release-unpaid-booking est planifié à 15 minutes. Si aucun webhook de paiement réussi n'est reçu, le créneau horaire est immédiatement restitué à la disponibilité du salon."
);

subSectionTitle('C. Scénario : Confirmation Instantanée des Paiements Webhooks');
paragraph(
  "Dès validation du webhook Mobile Money (Wave, Orange, MTN), l'événement payment.succeeded est envoyé sur la socket du client. L'écran de l'application mobile affiche instantanément le ticket validé et le reçu numérique sans manipulation supplémentaire."
);

// =============================================================================
// PAGE 5 : ÉVOLUTION DU SCHÉMA PRISMA & NOTIFICATIONS
// =============================================================================
doc.addPage();
currentSectionCategory = '04. SCHÉMA DE DONNÉES & NOTIFICATIONS';
drawHeader();

sectionTitle('5. ÉVOLUTION DU SCHÉMA PRISMA & NOTIFICATIONS', 'Persistance de l\'historique In-App et Architecture Multi-Fournisseurs');

paragraph(
  "Dans le schéma prisma actuel, la table NotificationPreference configure les canaux acceptés par l'utilisateur, mais il manque la table matérialisant les notifications reçues. L'ajout du modèle Notification ci-dessous comble ce manque pour alimenter le centre d'alertes in-app :"
);

drawCodeBlock(`// À intégrer dans prisma/schema.prisma (Module Notifications)
model Notification {
  id          String              @id @default(uuid())
  userId      String
  salonId     String?             // Salon expéditeur si applicable
  title       String
  body        String
  channel     NotificationChannel // PUSH, SMS, IN_APP, WHATSAPP
  isRead      Boolean             @default(false)
  readAt      DateTime?
  data        Json?               // { ticketId: "...", bookingId: "...", actionUrl: "..." }
  createdAt   DateTime            @default(now())

  user        User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  salon       Salon?              @relation(fields: [salonId], references: [id], onDelete: SetNull)

  @@index([userId, isRead])
  @@index([userId, createdAt])
}`);

subSectionTitle('Design Pattern Strategy pour le NotificationModule');
paragraph(
  "Le service de notification orchestre l'envoi en interrogeant la fabrique de fournisseurs selon les préférences de l'utilisateur :"
);

bullet('Canal In-App', 'Insertion de l\'enregistrement dans la table Notification et émission WebSocket instantanée.');
bullet('Canal Push (Firebase FCM)', 'Envoi vers les tokens FCM enregistrés lors de la connexion mobile.');
bullet('Canal WhatsApp', 'Transmission d\'un message interactif via l\'API officielle WhatsApp Business (haute priorité pour les rappels de rdv et alertes de ticket appelé).');
bullet('Canal SMS (Termii / Twilio)', 'Envoi du SMS transactionnel si le client est sans connexion mobile data.');

callout(
  'ROBUSTESSE FACE AUX PANNES DES OPÉRATEURS',
  'Chaque tentative d\'envoi de SMS ou WhatsApp est confiée à un worker BullMQ avec 3 tentatives automatiques et backoff exponentiel. En cas d\'indisponibilité temporaire d\'un opérateur télécom, le message n\'est jamais perdu.',
  'success'
);

// =============================================================================
// PAGE 6 : ROADMAP & BONNES PRATIQUES
// =============================================================================
doc.addPage();
currentSectionCategory = '05. FEUILLE DE ROUTE & BONNES PRATIQUES';
drawHeader();

sectionTitle('6. FEUILLE DE ROUTE D\'IMPLÉMENTATION EN 4 PHASES', 'Plan d\'exécution structuré pour l\'équipe de développement');

const roadmapHeaders = ['Phase', 'Intitulé & Scope', 'Charge Estimée', 'Livrables Techniques'];
const roadmapRows = [
  [
    'Phase 1',
    'Socle Infra & Message Broker\n(Redis + BullMQ + Event-Emitter)',
    '2 - 3 jours',
    '• Déploiement Redis (ex: Railway Redis)\n• Configuration @nestjs/bullmq & @nestjs/event-emitter\n• Montage de l\'UI d\'administration Bull-Board',
  ],
  [
    'Phase 2',
    'Temps Réel & Gateway WebSockets\n(Socket.io)',
    '3 - 4 jours',
    '• QueueGateway avec Rooms dynamiques par salon et par client\n• Authentification JWT sur handshake WebSocket\n• Événements ticket:called, ticket:waiting, ticket:done',
  ],
  [
    'Phase 3',
    'Automatisation du Cycle de Vie\n(Workers No-Show & Holds)',
    '2 - 3 jours',
    '• Worker check-ticket-no-show avec délai de grâce de 10 min\n• Worker release-unpaid-booking (délai 15 min)\n• Synchronisation automatique avec Booking et CRM',
  ],
  [
    'Phase 4',
    'Module Notifications Omnicanal\n(In-App, Push, WhatsApp, SMS)',
    '4 - 5 jours',
    '• Migration Prisma de la table Notification\n• Intégration Firebase Admin SDK (FCM)\n• Intégration WhatsApp Cloud API & Termii SMS Provider',
  ],
];

drawTable(roadmapHeaders, roadmapRows, [55, 160, 80, 210]);

subSectionTitle('Règles d\'Ingénierie pour l\'Équipe');
bullet('Idempotence des Jobs', 'Chaque tâche BullMQ doit avoir un jobId explicite (ex: no-show-${ticketId}) pour interdire les doublons en cas de double clic.');
bullet('Typage Strict des Payloads', 'Créer un fichier domain/events/queue-ticket.events.ts contenant toutes les classes d\'événements typées.');
bullet('Monitoring & Alerting', 'Brancher des alertes en cas de jobs envoyés dans la Dead-Letter Queue (DLQ).');

callout(
  'SYNTHÈSE DE LA DIRECTION TECHNIQUE',
  'Cette modernisation confère à Coco API une infrastructure digne des meilleurs standards SaaS internationaux. Elle supprime la latence en salon, automatise les opérations chronophages et garantit une expérience utilisateur fluide et moderne.',
  'info'
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
     .text('DOCUMENT TECHNIQUE CONFIDENTIEL - USAGE STRICTEMENT INTERNE COCO API', 45, footerY + 6, {
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
