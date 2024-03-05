import { logger } from '@/server/logger';
import nodemailer from 'nodemailer';

export { composer } from './composer';

interface Props {
  body: string;
  recipient: {
    name: string;
    email: string;
  };
}

const getAuth = () => {
  const email = process.env.ADMIN_EMAIL;
  const name = process.env.ADMIN_NAME;
  const pass = process.env.GMAIL_APP_SPECIFIC_PWD;
  if (!email || !name || !pass) return;

  return { email, name, pass };
};

export const sendEmail = async ({ body, recipient }: Props) => {
  const auth = getAuth();
  if (!auth) return;

  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: auth.email,
      pass: auth.pass,
    },
  });

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: `${auth.name} <${auth.email}>`,
    to: `${recipient.email}`,
    subject: 'YouTube Recommendation Algorithm Project',
    html: body,
  });

  info.rejected.length > 0
    ? logger.warn(`FAILED: Email not sent ${recipient.email}`)
    : logger.info(`Email sent ${recipient.email}`);

  return info;
};
