import nodemailer from 'nodemailer';
import { CLIENT_URL } from '../config.js';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // implicit TLS — matches port 465
    auth: {
        user: process.env.ADMIN_GMAIL,
        pass: process.env.ADMIN_GMAIL_PASSWORD,
    },
    // Bail out instead of hanging if the SMTP server stalls.
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
});

const GRADIENT = 'linear-gradient(90deg,#9333ea,#db2777)';

// ---- Reusable, email-safe (inline-styled) building blocks --------------------

const button = (text, link) =>
    `<a href="${link}" style="display:inline-block;margin:18px 0 6px;padding:12px 28px;border-radius:9999px;background:${GRADIENT};color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;">${text}</a>`;

const roleBadge = (role) => {
    const key = String(role || '').toLowerCase();
    const styles = {
        owner: 'background:#f3e8ff;color:#7e22ce;',
        editor: 'background:#dcfce7;color:#15803d;',
        viewer: 'background:#f1f5f9;color:#475569;',
    };
    return `<span style="display:inline-block;padding:3px 12px;border-radius:9999px;font-size:12px;font-weight:700;text-transform:capitalize;${
        styles[key] || styles.viewer
    }">${role}</span>`;
};

const docCard = (name, extra = '') => `
    <div style="margin:18px 0;padding:14px 16px;border:1px solid #e5e7eb;border-radius:12px;background:#fafafa;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#9ca3af;margin-bottom:4px;">Document</div>
        <div style="font-size:15px;font-weight:600;color:#111827;">📄 ${name}</div>
        ${extra}
    </div>`;

const featureList = (items) =>
    `<div style="margin:18px 0;">` +
    items
        .map(
            (i) => `
        <div style="margin:0 0 14px;">
            <span style="font-size:16px;">${i.icon}</span>
            <span style="font-size:14px;color:#111827;font-weight:600;margin-left:6px;">${i.title}</span>
            <div style="font-size:13px;color:#6b7280;line-height:1.5;margin:3px 0 0 26px;">${i.desc}</div>
        </div>`,
        )
        .join('') +
    `</div>`;

const emailShell = ({ preheader = '', heading, intro = '', content = '', btn }) => `
    <div style="background:#f3f4f6;padding:24px 12px;">
        ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>` : ''}
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
            <div style="padding:26px 28px 0;">
                <div style="font-size:22px;font-weight:800;background:${GRADIENT};-webkit-background-clip:text;background-clip:text;color:transparent;">DocWeave</div>
            </div>
            <div style="padding:6px 28px 28px;">
                <h1 style="font-size:20px;margin:14px 0 8px;color:#111827;">${heading}</h1>
                ${intro ? `<p style="font-size:14px;line-height:1.6;color:#4b5563;margin:0;">${intro}</p>` : ''}
                ${content}
                ${btn ? button(btn.text, btn.link) : ''}
            </div>
            <div style="padding:16px 28px;border-top:1px solid #f1f5f9;background:#fafafa;">
                <p style="font-size:12px;color:#9ca3af;margin:0;line-height:1.5;">DocWeave · real-time collaborative documents.<br/>You're receiving this because you have a DocWeave account.</p>
            </div>
        </div>
    </div>`;

// Email is best-effort: a delivery failure must never break the request flow.
const safeSend = async (mailOptions, label) => {
    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log(`Error sending ${label} email:`, error.message);
    }
};

const ROLE_BLURB = {
    owner: 'You have full control over this document — including sharing, roles, and visibility.',
    editor: 'You can edit this document in real time alongside everyone else.',
    viewer: 'You have read-only access — you can open and read, but not edit.',
};

// ---- Emails ------------------------------------------------------------------

export const sendWelcome = async (touser) => {
    const html = emailShell({
        preheader: 'Welcome to DocWeave — here’s what you can do.',
        heading: `Welcome aboard, ${touser?.username}! 👋`,
        intro: 'Thanks for joining DocWeave. Here’s a quick look at what you can do:',
        content: featureList([
            {
                icon: '🟣',
                title: 'Write together, live',
                desc: 'Edit the same document with your team in real time — see everyone’s cursors and presence.',
            },
            {
                icon: '✨',
                title: 'AI writing assistant',
                desc: 'Ask about a document, generate new content, or rewrite a selection in any tone.',
            },
            {
                icon: '🕘',
                title: 'Version history',
                desc: 'Save named checkpoints and restore any earlier version in one click.',
            },
            {
                icon: '🔐',
                title: 'Fine-grained sharing',
                desc: 'Invite people as editors or viewers, or share via link — you decide who can do what.',
            },
        ]),
        btn: { text: 'Create your first document', link: `${CLIENT_URL}/dashboard` },
    });
    await safeSend(
        { from: process.env.ADMIN_GMAIL, to: touser?.email, subject: 'Welcome to DocWeave 🎉', html },
        'welcome',
    );
};

export const sendInvite = async (touser, fromuser, documentdata, userrole) => {
    const link = `${CLIENT_URL}/editor/${documentdata?.documentId}`;
    const roleKey = String(userrole || '').toLowerCase();
    const html = emailShell({
        preheader: `${fromuser?.username} invited you to "${documentdata?.name}"`,
        heading: `You've been invited to collaborate`,
        intro: `<strong>${fromuser?.username}</strong>${
            fromuser?.email ? ` (${fromuser.email})` : ''
        } invited you to collaborate on a document in DocWeave.`,
        content:
            docCard(
                documentdata?.name,
                `<div style="margin-top:10px;">Your role: ${roleBadge(userrole)}</div>`,
            ) +
            `<p style="font-size:13px;color:#6b7280;line-height:1.6;margin:0;">${
                ROLE_BLURB[roleKey] || ROLE_BLURB.viewer
            }</p>`,
        btn: { text: 'Open document', link },
    });
    await safeSend(
        {
            from: process.env.ADMIN_GMAIL,
            to: touser?.email,
            subject: `${fromuser?.username} invited you to "${documentdata?.name}"`,
            html,
        },
        'invite',
    );
};

export const sendOwnershipTransfer = async (touser, fromuser, documentdata) => {
    const link = `${CLIENT_URL}/editor/${documentdata?.documentId}`;
    const html = emailShell({
        preheader: `You're now the owner of "${documentdata?.name}"`,
        heading: `You're now the owner 🔑`,
        intro: `<strong>${fromuser?.username}</strong> transferred ownership of this document to you.`,
        content:
            docCard(documentdata?.name, `<div style="margin-top:10px;">Your role: ${roleBadge('owner')}</div>`) +
            `<p style="font-size:13px;color:#374151;line-height:1.6;margin:0 0 6px;font-weight:600;">As the owner you can now:</p>` +
            featureList([
                { icon: '👥', title: 'Manage people & roles', desc: 'Add or remove collaborators and set who can edit or view.' },
                { icon: '🌐', title: 'Control visibility', desc: 'Choose between restricted, link, or signed-in-user access.' },
                { icon: '🔑', title: 'Transfer or lock', desc: 'Hand ownership to someone else or lock the document down.' },
            ]),
        btn: { text: 'Open document', link },
    });
    await safeSend(
        {
            from: process.env.ADMIN_GMAIL,
            to: touser?.email,
            subject: `You're now the owner of "${documentdata?.name}"`,
            html,
        },
        'ownership transfer',
    );
};

export const sendPasswordReset = async (touser, resetLink) => {
    const html = emailShell({
        preheader: 'Reset your DocWeave password (link expires in 1 hour).',
        heading: 'Reset your password',
        intro: 'We received a request to reset the password for your DocWeave account. Click the button below to choose a new one — this link expires in 1 hour.',
        content: `
            <p style="font-size:12px;color:#6b7280;margin:14px 0 0;">If the button doesn't work, copy and paste this link into your browser:<br/>
            <a href="${resetLink}" style="color:#9333ea;word-break:break-all;">${resetLink}</a></p>
            <p style="font-size:12px;color:#6b7280;margin:14px 0 0;">If you didn't request this, you can safely ignore this email — your password won't change.</p>`,
        btn: { text: 'Reset password', link: resetLink },
    });
    await safeSend(
        { from: process.env.ADMIN_GMAIL, to: touser?.email, subject: 'Reset your DocWeave password', html },
        'password reset',
    );
};
