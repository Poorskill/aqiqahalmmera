import { NextResponse } from 'next/server';
import { getSlotCapacitiesForDate, getSlotOccupancyExcludingOrder } from '@/lib/services';

export const dynamic = 'force-dynamic';

const HOURLY_SLOTS = [
  '07.00 WIB', '08.00 WIB', '09.00 WIB', '10.00 WIB', '11.00 WIB',
  '12.00 WIB', '13.00 WIB', '14.00 WIB', '15.00 WIB', '16.00 WIB', '17.00 WIB'
];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    const exclude = url.searchParams.get('exclude');
    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }
    if (exclude) {
      const slots: Record<string, number> = {};
      HOURLY_SLOTS.forEach((slot) => {
        slots[slot] = getSlotOccupancyExcludingOrder(date, slot, exclude);
      });
      return NextResponse.json({ date, slots });
    }
    const slots = getSlotCapacitiesForDate(date);
    return NextResponse.json({ date, slots });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
