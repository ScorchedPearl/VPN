import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const headers = Object.fromEntries(request.headers.entries());
  
  // Extracting potential IP addresses
  const ip = 
    request.headers.get('x-forwarded-for')?.split(',')[0] || 
    request.headers.get('x-real-ip') || 
    request.headers.get('cf-connecting-ip') ||
    'Unknown';

  return NextResponse.json({
    ip,
    headers: {
      'user-agent': headers['user-agent'] || 'Unknown',
      'accept-language': headers['accept-language'] || 'Unknown',
      'accept-encoding': headers['accept-encoding'] || 'Unknown',
      'connection': headers['connection'] || 'Unknown',
      'sec-ch-ua': headers['sec-ch-ua'] || 'Unknown',
      'sec-ch-ua-mobile': headers['sec-ch-ua-mobile'] || 'Unknown',
      'sec-ch-ua-platform': headers['sec-ch-ua-platform'] || 'Unknown',
      'x-forwarded-for': headers['x-forwarded-for'] || 'None',
      'x-real-ip': headers['x-real-ip'] || 'None',
      'via': headers['via'] || 'None',
    }
  });
}
