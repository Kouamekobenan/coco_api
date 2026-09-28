import { Inject, Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import type { IQueueRepository } from '../../domain/repositories/queue.repository.interface.js';
import { QUEUE_REPOSITORY } from '../../domain/repositories/queue.repository.interface.js';
import type { ISalonRepository } from '../../../salon/domain/repositories/salon.repository.interface.js';
import { SALON_REPOSITORY } from '../../../salon/domain/repositories/salon.repository.interface.js';
import type { ICustomerRepository } from '../../../customer/domain/repositories/customer.repository.interface.js';
import { CUSTOMER_REPOSITORY } from '../../../customer/domain/repositories/customer.repository.interface.js';
import { QueueTicketNotFoundException } from '../../domain/exceptions/queue-domain.exception.js';
import { SalonNotFoundException } from '../../../salon/domain/exceptions/salon-domain.exception.js';

@Injectable()
export class GenerateTicketPdfUseCase {
  constructor(
    @Inject(QUEUE_REPOSITORY)
    private readonly queueRepo: IQueueRepository,
    @Inject(SALON_REPOSITORY)
    private readonly salonRepo: ISalonRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepo: ICustomerRepository,
  ) {}

  public async execute(ticketId: string): Promise<Buffer> {
    const ticket = await this.queueRepo.findById(ticketId);
    if (!ticket) {
      throw new QueueTicketNotFoundException(ticketId);
    }

    const salon = await this.salonRepo.findById(ticket.salonId);
    if (!salon) {
      throw new SalonNotFoundException(ticket.salonId);
    }

    const customer = await this.customerRepo.findById(ticket.customerId);
    const customerName = customer ? customer.getName() : 'Client';

    // Génération du Data URL du QR Code
    const qrCodeDataUrl = await QRCode.toDataURL(
      `https://coco.ci/track/${ticket.qrCodeToken}`,
      { margin: 1, width: 140 },
    );

    return new Promise<Buffer>((resolve, reject) => {
      // Dimensions format ticket de caisse thermique (80mm x 150mm approx en points : 226 x 425 pt)
      const doc = new PDFDocument({
        size: [226, 425],
        margin: 12,
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err: Error) => reject(err));

      // --- Entête du Ticket ---
      doc
        .fillColor('#E11D48') // Couleur Marque Coco / Rose Ébène
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('COCO BEAUTÉ', { align: 'center' });

      doc
        .fillColor('#1E293B')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(salon.getName().toUpperCase(), { align: 'center' });

      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#64748B')
        .text(`${salon.getCommune()} - ${salon.getQuartier()}`, { align: 'center' })
        .text(`Tél: ${salon.getPhone()}`, { align: 'center' });

      doc.moveDown(0.5);
      doc
        .strokeColor('#CBD5E1')
        .lineWidth(1)
        .moveTo(12, doc.y)
        .lineTo(214, doc.y)
        .stroke();

      doc.moveDown(0.8);

      // --- Numéro du Ticket ---
      doc
        .fontSize(9)
        .fillColor('#475569')
        .font('Helvetica')
        .text('VOTRE NUMÉRO DE PASSAGE', { align: 'center' });

      doc.moveDown(0.3);

      doc
        .fontSize(32)
        .fillColor('#0F172A')
        .font('Helvetica-Bold')
        .text(ticket.ticketNumber.value, { align: 'center' });

      doc.moveDown(0.3);
      // --- Informations Client & Attente ---
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#334155')
        .text(`Client : ${customerName}`, { align: 'center' })
        .text(`Type : ${ticket.queueType === 'APPOINTMENT' ? 'Rendez-vous' : 'Sans RDV (Walk-in)'}`, { align: 'center' })
        .text(`Attente estimée : ${ticket.estimate.formattedRange}`, { align: 'center' });

      doc.moveDown(0.5);

      // --- QR Code ---
      doc.image(qrCodeDataUrl, (226 - 90) / 2, doc.y, { width: 90 });
      doc.moveDown(6.2);

      // --- Pied de page ---
      doc
        .fontSize(7)
        .fillColor('#94A3B8')
        .font('Helvetica')
        .text('Scannez pour suivre votre passage en direct', { align: 'center' })
        .text(ticket.createdAt.toLocaleString('fr-FR', { timeZone: 'UTC' }), { align: 'center' });

      doc.end();
    });
  }
}
