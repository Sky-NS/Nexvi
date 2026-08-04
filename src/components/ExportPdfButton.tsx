import { Trip } from '@/types/trip';
import { Button } from '@/components/ui/Button';
import { FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { format, parseISO } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { useTranslation } from '@/i18n/LanguageContext';
import { LIBERATION_SANS_REGULAR_BASE64, LIBERATION_SANS_BOLD_BASE64 } from '@/lib/pdfFonts';

interface Props { trip: Trip; }

const MARGIN = 15;
const PAGE_H = 297;
const PAGE_W = 210;
const CONTENT_W = PAGE_W - MARGIN * 2;

// jsPDF's built-in fonts only cover Latin, so Cyrillic text renders as blank
// boxes unless a font with Cyrillic glyphs is embedded (see lib/pdfFonts.ts).
// That embedded font doesn't include emoji, so emoji are stripped from PDF
// text rather than showing up as missing-glyph boxes.
function stripEmoji(text: string): string {
  return text
    .replace(/[\u{1F1E6}-\u{1FFFF}]/gu, '')
    .replace(/[\u{2600}-\u{27BF}]/gu, '')
    .replace(/[\u{2B00}-\u{2BFF}]/gu, '')
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')
    .replace(/\u200D/gu, '')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function registerFonts(doc: jsPDF) {
  doc.addFileToVFS('LiberationSans-Regular.ttf', LIBERATION_SANS_REGULAR_BASE64);
  doc.addFont('LiberationSans-Regular.ttf', 'Liberation', 'normal');
  doc.addFileToVFS('LiberationSans-Bold.ttf', LIBERATION_SANS_BOLD_BASE64);
  doc.addFont('LiberationSans-Bold.ttf', 'Liberation', 'bold');
  doc.setFont('Liberation', 'normal');
}

export function ExportPdfButton({ trip }: Props) {
  const { t, language } = useTranslation();
  const locale = language === 'ru' ? ru : enUS;

  const handleExport = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    registerFonts(doc);
    const currency = trip.currency || '';
    let y = MARGIN;

    const ensureSpace = (needed: number) => {
      if (y + needed > PAGE_H - MARGIN) {
        doc.addPage();
        y = MARGIN;
      }
    };
    const rightAlignedText = (text: string, rightEdge: number, yy: number) => {
      doc.text(text, rightEdge - doc.getTextWidth(text), yy);
    };

    // ---- Header ----
    doc.setFont('Liberation', 'bold'); doc.setFontSize(20); doc.setTextColor(17, 24, 39);
    doc.text(stripEmoji(trip.destination) || trip.destination, MARGIN, y); y += 9;
    doc.setFont('Liberation', 'normal'); doc.setFontSize(10.5); doc.setTextColor(107, 114, 128);
    doc.text(
      `${format(parseISO(trip.startDate), 'd MMMM yyyy', { locale })} — ${format(parseISO(trip.endDate), 'd MMMM yyyy', { locale })} · ${trip.travelers} ${t('common.people')}`,
      MARGIN, y
    );
    y += 10;

    // ---- Days ----
    trip.days.forEach((day) => {
      ensureSpace(16);
      doc.setFillColor(243, 244, 246);
      doc.roundedRect(MARGIN, y, CONTENT_W, 10, 1.5, 1.5, 'F');
      doc.setFont('Liberation', 'bold'); doc.setFontSize(12); doc.setTextColor(17, 24, 39);
      const dayHeading = `${t('day.numberLabel', { n: day.dayNumber })}${day.title ? ' — ' + stripEmoji(day.title) : ''}`;
      doc.text(dayHeading, MARGIN + 3, y + 6.7);
      doc.setFont('Liberation', 'normal'); doc.setFontSize(9); doc.setTextColor(107, 114, 128);
      rightAlignedText(format(parseISO(day.date), 'd MMMM', { locale }), MARGIN + CONTENT_W - 3, y + 6.7);
      y += 13;

      // Route
      const route = day.route || [];
      if (route.length > 0) {
        doc.setFont('Liberation', 'normal'); doc.setFontSize(8.5);
        const lines = route.map((r) =>
          `${r.from || '?'} \u2192 ${r.to || '?'}${r.mode ? ' \u00B7 ' + stripEmoji(r.mode) : ''}${typeof r.cost === 'number' && r.cost > 0 ? ' \u00B7 ' + currency + r.cost : ''}`
        );
        const blockH = 4 + lines.length * 4.6;
        ensureSpace(blockH + 3);
        doc.setFillColor(249, 250, 251);
        doc.roundedRect(MARGIN, y, CONTENT_W, blockH, 1.5, 1.5, 'F');
        doc.setTextColor(107, 114, 128);
        let ry = y + 4.2;
        lines.forEach((line) => { doc.text(line, MARGIN + 3, ry); ry += 4.6; });
        y += blockH + 4;
      }

      // Activities
      day.activities.forEach((act) => {
        doc.setFont('Liberation', 'normal'); doc.setFontSize(9.5);
        const descLines: string[] = act.description ? doc.splitTextToSize(stripEmoji(act.description), CONTENT_W - 8) : [];

        doc.setFontSize(8.5);
        const metaParts = [
          act.location ? stripEmoji(act.location) : '',
          act.hours || '',
          typeof act.cost === 'number' ? (act.cost > 0 ? `${currency}${act.cost}` : t('common.free')) : '',
        ].filter(Boolean);
        const metaLines: string[] = metaParts.length ? doc.splitTextToSize(metaParts.join('   \u00B7   '), CONTENT_W - 8) : [];
        const noteLines: string[] = act.bookingNote ? doc.splitTextToSize(stripEmoji(act.bookingNote), CONTENT_W - 8) : [];

        const cardH = 6 + 5.5 + descLines.length * 4.3 + metaLines.length * 4.4 + noteLines.length * 4.4 + 3;
        ensureSpace(cardH + 3);

        if (act.booked) doc.setFillColor(240, 253, 244);
        doc.setDrawColor(229, 231, 235);
        doc.roundedRect(MARGIN, y, CONTENT_W, cardH, 1.5, 1.5, act.booked ? 'FD' : 'S');

        let cy = y + 6;
        doc.setFont('Liberation', 'bold'); doc.setFontSize(10.5); doc.setTextColor(17, 24, 39);
        doc.text(stripEmoji(act.title) || act.title, MARGIN + 4, cy);
        if (act.booked) {
          doc.setFont('Liberation', 'normal'); doc.setFontSize(8); doc.setTextColor(21, 128, 61);
          rightAlignedText(`\u2713 ${t('activity.booked')}`, MARGIN + CONTENT_W - 4, cy);
        }
        cy += 5.5;

        if (descLines.length) {
          doc.setFont('Liberation', 'normal'); doc.setFontSize(9.5); doc.setTextColor(75, 85, 99);
          descLines.forEach((line) => { doc.text(line, MARGIN + 4, cy); cy += 4.3; });
        }
        if (metaLines.length) {
          doc.setFont('Liberation', 'normal'); doc.setFontSize(8.5); doc.setTextColor(107, 114, 128);
          metaLines.forEach((line) => { doc.text(line, MARGIN + 4, cy); cy += 4.4; });
        }
        if (noteLines.length) {
          doc.setFont('Liberation', 'normal'); doc.setFontSize(8.5); doc.setTextColor(107, 114, 128);
          noteLines.forEach((line) => { doc.text(line, MARGIN + 4, cy); cy += 4.4; });
        }

        y += cardH + 3;
      });

      const dayTotal = route.reduce((s, r) => s + (r.cost || 0), 0) + day.activities.reduce((s, a) => s + (a.cost || 0), 0);
      if (dayTotal > 0) {
        ensureSpace(7);
        doc.setFont('Liberation', 'bold'); doc.setFontSize(9.5); doc.setTextColor(75, 85, 99);
        doc.text(t('day.total'), MARGIN, y + 3);
        rightAlignedText(`${currency}${dayTotal}`, MARGIN + CONTENT_W, y + 3);
        y += 8;
      }
      y += 3;
    });

    // ---- Budget summary ----
    const rows = trip.days.map((day) => {
      const routeCost = (day.route || []).reduce((s, r) => s + (r.cost || 0), 0);
      const actCost = day.activities.reduce((s, a) => s + (a.cost || 0), 0);
      return { day, total: routeCost + actCost };
    });
    const grandTotal = rows.reduce((s, r) => s + r.total, 0);

    if (grandTotal > 0) {
      ensureSpace(16);
      doc.setFont('Liberation', 'bold'); doc.setFontSize(13); doc.setTextColor(17, 24, 39);
      doc.text(stripEmoji(t('budget.heading')), MARGIN, y); y += 7;
      doc.setDrawColor(229, 231, 235); doc.line(MARGIN, y, MARGIN + CONTENT_W, y); y += 5;

      doc.setFont('Liberation', 'normal'); doc.setFontSize(9.5); doc.setTextColor(75, 85, 99);
      rows.forEach(({ day, total }) => {
        ensureSpace(6);
        doc.text(`${t('day.numberLabel', { n: day.dayNumber })} \u00B7 ${format(parseISO(day.date), 'd MMM', { locale })}`, MARGIN, y);
        rightAlignedText(`${currency}${total}`, MARGIN + CONTENT_W, y);
        y += 5.5;
      });

      ensureSpace(9);
      doc.setDrawColor(229, 231, 235); doc.line(MARGIN, y, MARGIN + CONTENT_W, y); y += 5.5;
      doc.setFont('Liberation', 'bold'); doc.setFontSize(10.5); doc.setTextColor(17, 24, 39);
      doc.text(t('budget.total'), MARGIN, y);
      rightAlignedText(`${currency}${grandTotal}`, MARGIN + CONTENT_W, y);
    }

    const safeName = trip.destination.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || 'trip';
    doc.save(`${safeName}.pdf`);
  };

  return <Button variant="outline" onClick={handleExport}><FileDown className="w-4 h-4 mr-2" /> PDF</Button>;
}
