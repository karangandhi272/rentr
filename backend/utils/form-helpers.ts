export function formatDateToKijiji(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '/');
  } catch {
    const today = new Date();
    return today.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '/');
  }
}

export const bedroomMap: { [key: string]: string } = {
  "bachelor": "0",
  "studio": "0",
  "1": "1",
  "1+den": "1.5",
  "2": "2",
  "2+den": "2.5",
  "3": "3",
  "3+den": "3.5",
  "4": "4",
  "4+den": "4.5",
  "5": "5",
  "5+": "5"
};

export const bathroomMap: { [key: string]: string } = {
  "1": "10",
  "1.5": "15",
  "2": "20",
  "2.5": "25",
  "3": "30",
  "3.5": "35",
  "4": "40",
  "4.5": "45",
  "5": "50",
  "5.5": "55",
  "6": "60",
};
