import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const events = await request.json();
    
    // Each event creates 2 signup forms (Volunteer & Participant)
    const totalForms = events.length * 2;
    
    // Log the received data
    console.log('Received events for batch creation:', events);
    console.log('Total events:', events.length);
    console.log('Total signup forms to create:', totalForms);
    
    // TODO: Add database logic here (e.g., Prisma bulk create)
    // For each event, create 2 forms:
    // const signupForms = events.flatMap(event => [
    //   { ...event, type: 'Volunteer', eventId: event.id },
    //   { ...event, type: 'Participant', eventId: event.id }
    // ]);
    // await prisma.signupForm.createMany({ data: signupForms });
    
    return NextResponse.json({
      success: true,
      message: `Successfully processed ${events.length} event${events.length !== 1 ? 's' : ''} (${totalForms} signup forms)`,
      eventCount: events.length,
      formCount: totalForms,
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error processing batch events:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to process events',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
