import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { farmer, distressData } = body;

    if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL || !process.env.OFFICER_EMAIL) {
      console.warn("SendGrid credentials missing in .env.local. Alert not actually sent, but returning success for demo purposes.");
      return NextResponse.json({ success: true, mocked: true });
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626; text-transform: uppercase; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">
          CRITICAL DISTRESS ALERT
        </h2>
        
        <p style="font-weight: bold; font-size: 16px;">
          Immediate intervention required for Farmer ID: ${farmer.id || 'N/A'}
        </p>

        <div style="background-color: #fef2f2; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Farmer Details</h3>
          <ul style="list-style-type: none; padding-left: 0;">
            <li><strong>Name:</strong> ${farmer.name || 'Unknown'}</li>
            <li><strong>Phone:</strong> ${farmer.phone || 'Unknown'}</li>
            <li><strong>Location:</strong> ${farmer.district}, ${farmer.state}</li>
            <li><strong>Coordinates:</strong> ${farmer.latitude || 'N/A'}, ${farmer.longitude || 'N/A'}</li>
          </ul>
        </div>

        <div style="background-color: #fef2f2; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #dc2626;">Distress Assessment</h3>
          <ul style="list-style-type: none; padding-left: 0;">
            <li><strong>Risk Level:</strong> ${distressData.risk_level}</li>
            <li><strong>Distress Score:</strong> ${Math.round(distressData.distress_score)}/100</li>
          </ul>
          
          <h4 style="margin-bottom: 5px;">Key Risk Factors Identified:</h4>
          <ul>
            ${distressData.reasons.map((r: string) => `<li>${r}</li>`).join('')}
          </ul>
        </div>

        <p style="color: #666; font-size: 12px; border-top: 1px solid #ccc; padding-top: 10px;">
          This is an automated emergency dispatch from the KrishiBandhu Early Warning System.
        </p>
      </div>
    `;

    const msg = {
      to: process.env.OFFICER_EMAIL,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: `CRITICAL ALERT: High Distress Detected for Farmer in ${farmer.district}`,
      html: htmlContent,
    };

    await sgMail.send(msg);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to send alert email:", error);
    if (error.response) {
      console.error(error.response.body);
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
