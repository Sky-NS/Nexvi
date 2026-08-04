import { Trip } from '@/types/trip';
import { Button } from '@/components/ui/Button';
import { FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Props { trip: Trip; }

export function ExportPdfButton({ trip }: Props) {
  const handleExport = () => {
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(20); doc.text(trip.destination, 20, y); y += 10;
    doc.setFontSize(12);
    doc.text(`${format(parseISO(trip.startDate), 'd MMMM yyyy', { locale: ru })} — ${format(parseISO(trip.endDate), 'd MMMM yyyy', { locale: ru })}`, 20, y); y += 10;
    doc.text(`Путешественников: ${trip.travelers}`, 20, y); y += 15;
    trip.days.forEach((day) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.text(`День ${day.dayNumber}: ${day.title} (${format(parseISO(day.date), 'd MMMM', { locale: ru })})`, 20, y); y += 8;
      doc.setFontSize(11);
      day.activities.forEach((act) => {
        if (y > 280) { doc.addPage(); y = 20; }
        doc.text(`${act.time} — ${act.title}${act.location ? ` (${act.location})` : ''}`, 25, y); y += 6;
        if (act.description) { doc.setFontSize(9); doc.text(act.description, 30, y); y += 5; doc.setFontSize(11); }
      });
      y += 8;
    });
    doc.save(`trip-${trip.id}.pdf`);
  };
  return <Button variant="outline" onClick={handleExport}><FileDown className="w-4 h-4 mr-2" /> PDF</Button>;
}