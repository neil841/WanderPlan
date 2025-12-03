import { format } from 'date-fns';

interface CalendarEvent {
    title: string;
    description?: string | null;
    startDateTime: Date | string;
    endDateTime?: Date | string | null;
    location?: any;
}

interface TripData {
    name: string;
    events: CalendarEvent[];
}

/**
 * Generate ICS file content from trip events
 */
export function generateICS(trip: TripData): string {
    const events = trip.events.map((event) => {
        const start = new Date(event.startDateTime);
        const end = event.endDateTime ? new Date(event.endDateTime) : new Date(start.getTime() + 60 * 60 * 1000); // Default 1 hour

        const now = new Date();
        const stamp = format(now, "yyyyMMdd'T'HHmmss'Z'");
        const startStr = format(start, "yyyyMMdd'T'HHmmss");
        const endStr = format(end, "yyyyMMdd'T'HHmmss");

        let locationStr = '';
        if (typeof event.location === 'string') {
            locationStr = event.location;
        } else if (event.location?.address) {
            locationStr = event.location.address;
        } else if (event.location?.name) {
            locationStr = event.location.name;
        }

        return `BEGIN:VEVENT
UID:${crypto.randomUUID()}@wanderplan.app
DTSTAMP:${stamp}
DTSTART;TZID=UTC:${startStr}
DTEND;TZID=UTC:${endStr}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ''}
LOCATION:${locationStr}
END:VEVENT`;
    }).join('\n');

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//WanderPlan//Trip Itinerary//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${trip.name}
${events}
END:VCALENDAR`;
}

/**
 * Trigger download of ICS file
 */
export function downloadICS(trip: TripData) {
    const content = generateICS(trip);
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${trip.name.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}
