// email sent after a new user is created
export const NEW_USER_REGISTRY = (name, email) => {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to TeachGrid - H/Meegasara Maha Vidyalaya</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #f7f9fc; line-height: 1.6; color: #334155;">
    
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        
        <div style="background: white; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.08); overflow: hidden; border: 1px solid #e2e8f0;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center;">
                <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.15); border-radius: 16px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 28px;">
                    👨‍🏫
                </div>
                <h1 style="color: white; font-size: 28px; font-weight: 600; margin: 0 0 8px; letter-spacing: -0.025em;">Welcome to TeachGrid</h1>
                <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0; font-weight: 400;">H/Meegasara Maha Vidyalaya Teacher Management System</p>
            </div>

            <!-- Main Content -->
            <div style="padding: 40px 30px;">
                <h2 style="color: #0f172a; font-size: 24px; font-weight: 600; margin: 0 0 20px; letter-spacing: -0.025em;">Hello ${name},</h2>
                
                <p style="color: #475569; font-size: 16px; margin: 0 0 30px; line-height: 1.7;">
                    Your TeachGrid account for <strong>H/Meegasara Maha Vidyalaya</strong> has been successfully created. 
                    We're excited to have you join our teacher management system.
                </p>

                <!-- Login Details -->
                <div style="background: #f8fafc; border-radius: 12px; border-left: 4px solid #3b82f6; padding: 25px; margin: 0 0 30px;">
                    <div style="display: flex; align-items: center; margin-bottom: 20px;">
                        <div style="width: 40px; height: 40px; background: #3b82f6; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0;">
                            <svg style="width: 20px; height: 20px; fill: white;" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                        </div>
                        <h3 style="color: #0f172a; font-size: 18px; font-weight: 600; margin: 0;">Account Access Details</h3>
                    </div>
                    <div style="background: white; border-radius: 10px; padding: 24px; border: 1px solid #e2e8f0;">
                        <div style="display: grid; grid-template-columns: 120px 1fr; gap: 16px; align-items: center; margin-bottom: 16px;">
                            <span style="color: #64748b; font-weight: 500; font-size: 15px;">Email:</span>
                            <code style="background: #f1f5f9; color: #1e293b; padding: 10px 14px; border-radius: 8px; font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace; font-size: 15px; font-weight: 500; display: block; word-break: break-all;">${email}</code>
                        </div>
                        <div style="display: grid; grid-template-columns: 120px 1fr; gap: 16px; align-items: center;">
                            <span style="color: #64748b; font-weight: 500; font-size: 15px;">Password:</span>
                            <div style="background: #fef3c7; color: #92400e; padding: 10px 14px; border-radius: 8px; border: 1px solid #fed7aa; font-weight: 500;">
                                Your registered telephone number
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Security Notice -->
                <div style="background: linear-gradient(90deg, #fef3c7 0%, #fde68a 100%); border-radius: 10px; padding: 20px; border-left: 4px solid #f59e0b; margin-bottom: 30px;">
                    <h4 style="color: #92400e; font-size: 15px; font-weight: 600; margin: 0 0 8px;">
                        🔒 Important Security Notice
                    </h4>
                    <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.5;">
                        For security reasons, please <strong>change your password immediately</strong> after your first login.
                    </p>
                </div>

                <!-- CTA Button -->
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://teachgrid.com/login" style="display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%); color: white; padding: 16px 40px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 8px 25px rgba(30,64,175,0.3); letter-spacing: -0.025em; transition: all 0.2s ease;">
                        Sign In to TeachGrid →
                    </a>
                </div>

                <!-- Important Notice -->
                <div style="background: #fef2f2; border-radius: 10px; padding: 20px; border-left: 4px solid #ef4444; margin-bottom: 30px;">
                    <h4 style="color: #dc2626; font-size: 15px; font-weight: 600; margin: 0 0 8px;">
                        ⚠️ Important Notice
                    </h4>
                    <p style="color: #991b1b; font-size: 14px; margin: 0; line-height: 1.5;">
                        If you did not expect to receive this email or believe this account was created in error, please ignore this message and contact us immediately at <a href="mailto:support@teachgrid.com" style="color: #dc2626; font-weight: 500;">support@teachgrid.com</a>.
                    </p>
                </div>

                <!-- Support -->
                <div style="text-align: center; padding-top: 30px; border-top: 1px solid #e2e8f0;">
                    <p style="color: #64748b; font-size: 14px; margin: 0 0 12px;">
                        Need assistance? Contact our support team:
                    </p>
                    <a href="mailto:support@teachgrid.com" style="color: #1d4ed8; font-weight: 600; text-decoration: none; font-size: 16px; letter-spacing: -0.025em;">
                        support@teachgrid.com
                    </a>
                </div>
            </div>

            <!-- Footer -->
            <div style="background: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #94a3b8; font-size: 14px; margin: 0 0 4px; line-height: 1.5;">
                    © 2026 TeachGrid - H/Meegasara Maha Vidyalaya<br>
                    <span style="font-size: 13px;">This email was sent because a TeachGrid account was created for you.</span>
                </p>
            </div>
        </div>
    </div>
</body>
</html>
`.trim()
};

// email template to be sent after the relief assignment has been cancelled
export const RELIEF_REASSIGNMENT_CANCELLATION = (oldTeacherName, dateStr, period) =>{
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Duty Reassignment Notice - TeachGrid</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: #f7f9fc; line-height: 1.6; color: #334155;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.08); overflow: hidden; border: 1px solid #e2e8f0;">
            
            <div style="background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%); padding: 30px; text-align: center;">
                <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.15); border-radius: 14px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 24px;">📋</div>
                <h1 style="color: white; font-size: 24px; font-weight: 600; margin: 0 0 4px;">Duty Reassignment Notice</h1>
                <p style="color: rgba(255,255,255,0.9); font-size: 15px; margin: 0;">H/Meegasara Maha Vidyalaya - TeachGrid</p>
            </div>

            <div style="padding: 40px 30px;">
                <div style="background: linear-gradient(90deg, #fef2f2 0%, #fee2e2 100%); border-radius: 12px; border-left: 5px solid #dc2626; padding: 32px; border: 1px solid #fecaca;">
                    <h2 style="color: #b91c1c; font-size: 22px; margin: 0 0 12px;">Duty Reassigned</h2>
                    <p style="color: #7f1d1d; font-size: 16px; margin: 0 0 20px;">
                        Hello <strong>${oldTeacherName}</strong>,
                    </p>

                    <div style="background: white; border-radius: 10px; padding: 24px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                        <span style="color: #64748b; font-weight: 500;">Duty Details:</span>
                        <div style="background: #f8fafc; color: #1e293b; padding: 12px 16px; border-radius: 8px; font-family: monospace; font-size: 15px; margin-top: 8px;">
                            ${dateStr} (Period ${period})
                        </div>
                    </div>

                    <div style="background: #fef2f2; border-radius: 10px; padding: 20px; border-left: 4px solid #dc2626;">
                        <p style="color: #b91c1c; font-weight: 600; margin: 0 0 8px;">⚠️ Action Required:</p>
                        <p style="color: #7f1d1d; margin: 0;">You are no longer required to cover this class. It has been reassigned.</p>
                    </div>
                </div>
            </div>

            <div style="background: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #94a3b8; font-size: 14px; margin: 0;">© 2026 TeachGrid - H/Meegasara Maha Vidyalaya</p>
            </div>
        </div>
    </div>
</body>
</html>`.trim()
}

// email template for email sent after a releif is assigned
export const RELIEF_ASSIGNED = (newTeacherName, dateStr, assignment) => {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relief Duty Assigned - TeachGrid</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: #f7f9fc; line-height: 1.6; color: #334155;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.08); overflow: hidden; border: 1px solid #e2e8f0;">
            
            <div style="background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%); padding: 30px; text-align: center;">
                <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.15); border-radius: 14px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 24px;">✅</div>
                <h1 style="color: white; font-size: 24px; font-weight: 600; margin: 0 0 4px;">Relief Duty Assigned</h1>
                <p style="color: rgba(255,255,255,0.9); font-size: 15px; margin: 0;">H/Meegasara Maha Vidyalaya - TeachGrid</p>
            </div>

            <div style="padding: 40px 30px;">
                <div style="background: linear-gradient(90deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 12px; border-left: 5px solid #2563eb; padding: 32px; border: 1px solid #93c5fd;">
                    <h2 style="color: #1d4ed8; font-size: 22px; margin: 0 0 12px;">New Assignment</h2>
                    <p style="color: #1e40af; font-size: 16px; margin: 0 0 20px;">
                        Hello <strong>${newTeacherName}</strong>,
                    </p>

                    <div style="background: white; border-radius: 10px; padding: 24px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                        <h3 style="color: #0f172a; font-size: 16px; margin: 0 0 15px;">Duty Assignment Details</h3>
                        <p style="margin: 5px 0;"><strong>Date:</strong> ${dateStr}</p>
                        <p style="margin: 5px 0;"><strong>Period:</strong> ${assignment.period}</p>
                        <p style="margin: 5px 0;"><strong>Grade:</strong> ${assignment.grade}</p>
                        <p style="margin: 5px 0;"><strong>Subject:</strong> ${assignment.subject}</p>
                    </div>

                    <div style="background: #eff6ff; border-radius: 10px; padding: 20px; border-left: 4px solid #2563eb;">
                        <p style="color: #1d4ed8; font-weight: 600; margin: 0;">👉 Next Steps:</p>
                        <p style="color: #1d4ed8; margin: 5px 0 0;">Please log in to the TeachGrid portal to acknowledge this duty assignment.</p>
                    </div>
                </div>
            </div>

            <div style="background: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #94a3b8; font-size: 14px; margin: 0;">© 2026 TeachGrid - H/Meegasara Maha Vidyalaya</p>
            </div>
        </div>
    </div>
</body>
</html>`.trim();
}

// email template for anouncemnt
export const ANNOUNCEMENT_TEMPLATE = (title, content, category, priority) => {
    // Logic to change priority badge color dynamically
    const priorityGradient = priority === 'High' 
        ? 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)' // Red for High
        : 'linear-gradient(135deg, #059669 0%, #10b981 100%)'; // Green for Normal/Low

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - TeachGrid Announcement</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f7f9fc; line-height: 1.6; color: #334155;">
    
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.08); overflow: hidden; border: 1px solid #e2e8f0;">
            
            <div style="background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%); padding: 30px; text-align: center;">
                <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.15); border-radius: 14px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                    📢
                </div>
                <h1 style="color: white; font-size: 24px; font-weight: 600; margin: 0 0 4px; letter-spacing: -0.025em;">School Announcement</h1>
                <p style="color: rgba(255,255,255,0.9); font-size: 15px; margin: 0; font-weight: 400;">H/Meegasara Maha Vidyalaya - TeachGrid</p>
            </div>

            <div style="padding: 20px 30px 10px;">
                <div style="display: flex; gap: 12px; align-items: center;">
                    <span style="background: #f1f5f9; color: #64748b; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid #e2e8f0;">
                        ${category}
                    </span>
                    <span style="background: ${priorityGradient}; color: white; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
                        ${priority} Priority
                    </span>
                </div>
            </div>

            <div style="padding: 0 30px 30px;">
                <h2 style="color: #0f172a; font-size: 22px; font-weight: 700; margin: 10px 0 20px; letter-spacing: -0.025em; line-height: 1.3;">
                    ${title}
                </h2>

                <div style="background: #f8fafc; border-radius: 12px; border-left: 5px solid #1d4ed8; padding: 24px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
                    <div style="font-size: 16px; color: #334155; line-height: 1.7; margin: 0;">
                        ${content}
                    </div>
                </div>
            </div>

            <div style="text-align: center; padding: 20px 30px; border-top: 1px solid #f1f5f9;">
                <p style="color: #64748b; font-size: 13px; margin: 0 0 8px;">
                    Questions about this announcement?
                </p>
                <a href="mailto:support@teachgrid.com" style="color: #1d4ed8; font-weight: 600; text-decoration: none; font-size: 14px;">
                    support@teachgrid.com
                </a>
            </div>

            <div style="background: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0 0 4px; line-height: 1.5;">
                    Sent by H/Meegasara Maha Vidyalaya Administration via TeachGrid
                </p>
                <p style="color: #94a3b8; font-size: 11px; margin: 0; line-height: 1.4;">
                    Please do not reply to this automated email.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();
};