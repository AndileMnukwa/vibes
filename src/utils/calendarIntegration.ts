
export interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  url?: string;
}

export class CalendarIntegration {
  static generateICSFile(event: CalendarEvent): string {
    const formatDate = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const startDate = formatDate(event.startDate);
    const endDate = event.endDate ? formatDate(event.endDate) : formatDate(new Date(event.startDate.getTime() + 60 * 60 * 1000)); // Default 1 hour duration

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//VibeCatcher//Event Calendar//EN',
      'BEGIN:VEVENT',
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
      `LOCATION:${event.location}`,
      event.url ? `URL:${event.url}` : '',
      `UID:${Date.now()}@vibecatcher.com`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(line => line !== '').join('\r\n');

    return icsContent;
  }

  static downloadICSFile(event: CalendarEvent): void {
    const icsContent = this.generateICSFile(event);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static getGoogleCalendarUrl(event: CalendarEvent): string {
    const formatDate = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const startDate = formatDate(event.startDate);
    const endDate = event.endDate ? formatDate(event.endDate) : formatDate(new Date(event.startDate.getTime() + 60 * 60 * 1000));

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${startDate}/${endDate}`,
      details: event.description,
      location: event.location,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  static getOutlookCalendarUrl(event: CalendarEvent): string {
    const params = new URLSearchParams({
      subject: event.title,
      body: event.description,
      location: event.location,
      startdt: event.startDate.toISOString(),
      enddt: event.endDate ? event.endDate.toISOString() : new Date(event.startDate.getTime() + 60 * 60 * 1000).toISOString(),
    });

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  }

  static getYahooCalendarUrl(event: CalendarEvent): string {
    const formatDate = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const startDate = formatDate(event.startDate);
    const endDate = event.endDate ? formatDate(event.endDate) : formatDate(new Date(event.startDate.getTime() + 60 * 60 * 1000));

    const params = new URLSearchParams({
      v: '60',
      title: event.title,
      st: startDate,
      et: endDate,
      desc: event.description,
      in_loc: event.location,
    });

    return `https://calendar.yahoo.com/?${params.toString()}`;
  }
}
