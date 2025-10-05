import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { SEND_INVITE_TEMPLATE } from './templates.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: process.env.ADMIN_GMAIL,
        pass: process.env.ADMIN_GMAIL_PASSWORD,
    },
});

export const sendInvite = async (touser, fromuser, documentdata, userrole) => {
    try {
        const names = touser?.username.split(' ');
        const userInitials =
            names.length >= 2 ? names[0][0].toUpperCase() + names[1][0].toUpperCase() : names[0][0].toUpperCase();
        const mailOptions = {
            from: process.env.ADMIN_GMAIL,
            to: touser.email,
            subject: `You've been invited to collaborate on ${documentdata?.name}`,
            html: SEND_INVITE_TEMPLATE.replace(/tousername/g, touser?.username)
                .replace(/fromusername/g, fromuser?.username)
                .replace(/documentname/g, documentdata?.name)
                .replace(/documentdescription/g, documentdata?.documentdescription || '')
                .replace(/documentId/g, documentdata?.documentId)
                .replace(/fromuseremail/g, fromuser.email)
                .replace(/userrole/g, userrole)
                .replace(/toUserInitials/g, userInitials)
                .replace(/senderEmail/g, fromuser.email)
                .replace(/documentLink/g, 'www.google.com')
                .replace(/invitationdate/g, new Date().toLocaleDateString('en-GB'))
                .replace(
                    /invitationtime/g,
                    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                ),
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('Invite sent successfully to: ' + info.response);
    } catch (error) {
        console.log('Error occured while sending invite', error.message);
    }
};
