import { Trip } from '@/types/trip';
import { Button } from '@/components/ui/Button';
import { FileDown, Loader2, Check } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { format, parseISO } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { useTranslation } from '@/i18n/LanguageContext';
import { LIBERATION_SANS_REGULAR_BASE64, LIBERATION_SANS_BOLD_BASE64 } from '@/lib/pdfFonts';
import { useActionFeedback } from '@/hooks/useActionFeedback';

interface Props { trip: Trip; }

const MARGIN = 15;
const PAGE_H = 297;
const PAGE_W = 210;
const CONTENT_W = PAGE_W - MARGIN * 2;

// Roamvas palette as RGB triples (mirrors the CSS tokens in index.css) so the
// PDF reads as the same product as the web app, not a generic gray report.
const COLOR = {
  ink: [23, 23, 46] as [number, number, number],
  inkSoft: [99, 98, 125] as [number, number, number],
  inkFaint: [153, 152, 172] as [number, number, number],
  border: [230, 229, 241] as [number, number, number],
  borderSoft: [239, 238, 247] as [number, number, number],
  brand: [36, 81, 184] as [number, number, number],
  brandSoft: [232, 238, 252] as [number, number, number],
  success: [31, 157, 107] as [number, number, number],
  successSoft: [230, 247, 239] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

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
  const { state, run } = useActionFeedback();

  const handleExport = () => run(() => {
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
    const setFill = (c: [number, number, number]) => doc.setFillColor(c[0], c[1], c[2]);
    const setText = (c: [number, number, number]) => doc.setTextColor(c[0], c[1], c[2]);
    const setDraw = (c: [number, number, number]) => doc.setDrawColor(c[0], c[1], c[2]);

    // ---- Header ----
    doc.setFont('Liberation', 'bold'); doc.setFontSize(20); setText(COLOR.ink);
    doc.text(stripEmoji(trip.destination) || trip.destination, MARGIN, y); y += 7.5;
    setDraw(COLOR.brand); doc.setLineWidth(0.8);
    doc.line(MARGIN, y, MARGIN + 14, y); y += 4.5;
    doc.setFont('Liberation', 'normal'); doc.setFontSize(10.5); setText(COLOR.inkSoft);
    doc.text(
      `${format(parseISO(trip.startDate), 'd MMMM yyyy', { locale })} — ${format(parseISO(trip.endDate), 'd MMMM yyyy', { locale })} · ${trip.travelers} ${t('common.people')}`,
      MARGIN, y
    );
    y += 10;

    // ---- Days ----
    trip.days.forEach((day) => {
      ensureSpace(17);

      // Day badge — mirrors the day-number badge used throughout the app
      setFill(COLOR.brandSoft);
      doc.roundedRect(MARGIN, y, 9, 9, 2, 2, 'F');
      doc.setFont('Liberation', 'bold'); doc.setFontSize(10); setText(COLOR.brand);
      const numStr = String(day.dayNumber).padStart(2, '0');
      doc.text(numStr, MARGIN + 4.5 - doc.getTextWidth(numStr) / 2, y + 6);

      doc.setFont('Liberation', 'bold'); doc.setFontSize(12.5); setText(COLOR.ink);
      doc.text(stripEmoji(day.title) || day.title || '—', MARGIN + 13, y + 6.2);
      doc.setFont('Liberation', 'normal'); doc.setFontSize(9); setText(COLOR.inkFaint);
      rightAlignedText(format(parseISO(day.date), 'd MMMM', { locale }), MARGIN + CONTENT_W, y + 6.2);
      y += 12.5;
      setDraw(COLOR.borderSoft); doc.setLineWidth(0.3);
      doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
      y += 4;

      // Route
      const route = day.route || [];
      if (route.length > 0) {
        doc.setFont('Liberation', 'normal'); doc.setFontSize(8.5);
        const lines = route.map((r) =>
          `${r.from || '?'} \u2192 ${r.to || '?'}${r.mode ? ' \u00B7 ' + stripEmoji(r.mode) : ''}${typeof r.cost === 'number' && r.cost > 0 ? ' \u00B7 ' + currency + r.cost : ''}`
        );
        const blockH = 4 + lines.length * 4.6;
        ensureSpace(blockH + 3);
        setFill(COLOR.borderSoft);
        doc.roundedRect(MARGIN, y, CONTENT_W, blockH, 2, 2, 'F');
        setText(COLOR.inkSoft);
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

        if (act.booked) setFill(COLOR.successSoft);
        setDraw(COLOR.border); doc.setLineWidth(0.25);
        doc.roundedRect(MARGIN, y, CONTENT_W, cardH, 2, 2, act.booked ? 'FD' : 'S');

        let cy = y + 6;
        doc.setFont('Liberation', 'bold'); doc.setFontSize(10.5); setText(COLOR.ink);
        doc.text(stripEmoji(act.title) || act.title, MARGIN + 4, cy);
        if (act.booked) {
          doc.setFont('Liberation', 'bold'); doc.setFontSize(8); setText(COLOR.success);
          rightAlignedText(`\u2713 ${t('activity.booked')}`, MARGIN + CONTENT_W - 4, cy);
        }
        cy += 5.5;

        if (descLines.length) {
          doc.setFont('Liberation', 'normal'); doc.setFontSize(9.5); setText(COLOR.inkSoft);
          descLines.forEach((line) => { doc.text(line, MARGIN + 4, cy); cy += 4.3; });
        }
        if (metaLines.length) {
          doc.setFont('Liberation', 'normal'); doc.setFontSize(8.5); setText(COLOR.inkFaint);
          metaLines.forEach((line) => { doc.text(line, MARGIN + 4, cy); cy += 4.4; });
        }
        if (noteLines.length) {
          doc.setFont('Liberation', 'normal'); doc.setFontSize(8.5); setText(COLOR.inkFaint);
          noteLines.forEach((line) => { doc.text(line, MARGIN + 4, cy); cy += 4.4; });
        }

        y += cardH + 3;
      });

      const dayTotal = route.reduce((s, r) => s + (r.cost || 0), 0) + day.activities.reduce((s, a) => s + (a.cost || 0), 0);
      if (dayTotal > 0) {
        ensureSpace(7);
        doc.setFont('Liberation', 'bold'); doc.setFontSize(9.5); setText(COLOR.inkSoft);
        doc.text(t('day.total'), MARGIN, y + 3);
        setText(COLOR.ink);
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
      doc.setFont('Liberation', 'bold'); doc.setFontSize(13); setText(COLOR.ink);
      doc.text(stripEmoji(t('budget.heading')), MARGIN, y); y += 7;
      setDraw(COLOR.border); doc.setLineWidth(0.3); doc.line(MARGIN, y, MARGIN + CONTENT_W, y); y += 5;

      doc.setFont('Liberation', 'normal'); doc.setFontSize(9.5); setText(COLOR.inkSoft);
      rows.forEach(({ day, total }) => {
        ensureSpace(6);
        doc.text(`${t('day.numberLabel', { n: day.dayNumber })} \u00B7 ${format(parseISO(day.date), 'd MMM', { locale })}`, MARGIN, y);
        setText(COLOR.ink);
        rightAlignedText(`${currency}${total}`, MARGIN + CONTENT_W, y);
        setText(COLOR.inkSoft);
        y += 5.5;
      });

      ensureSpace(10);
      setDraw(COLOR.border); doc.line(MARGIN, y, MARGIN + CONTENT_W, y); y += 6;
      setFill(COLOR.brandSoft);
      doc.roundedRect(MARGIN, y - 5, CONTENT_W, 9, 2, 2, 'F');
      doc.setFont('Liberation', 'bold'); doc.setFontSize(10.5); setText(COLOR.brand);
      doc.text(t('budget.total'), MARGIN + 3, y + 1);
      rightAlignedText(`${currency}${grandTotal}`, MARGIN + CONTENT_W - 3, y + 1);
    }

    const safeName = trip.destination.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || 'trip';
    doc.save(`${safeName}.pdf`);
  });

  return (
    <Button variant="outline" onClick={handleExport} disabled={state !== 'idle'}>
      {state === 'processing' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {state === 'done' && <Check className="w-4 h-4 mr-2" />}
      {state === 'idle' && <FileDown className="w-4 h-4 mr-2" />}
      {state === 'done' ? t('common.done') : 'PDF'}
    </Button>
  );
}
