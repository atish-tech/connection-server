import { getToken } from '@/config/generateToken';
import { Resend } from 'resend';

export const sendOtp = (otp: Number) => {
  const resend = new Resend('re_FnFujksW_5NHvXy6Gn3tViNnaqZHWkWEi');

  resend.emails.send({
    from: 'connectionserver@resend.dev',
    to: 'katish332@gmail.com',
    subject: `${otp}`,
    html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
  });
}

export const verifyEmail = async (email: String , origin: String) => {
  const resend = new Resend('re_FnFujksW_5NHvXy6Gn3tViNnaqZHWkWEi');
  const token = await getToken(email)

  resend.emails.send({
    from: 'connectionserver@resend.dev',
    to: 'katish332@gmail.com',
    subject: "Verify Account",
    html: `<div> <a href="${origin}/verify/?token=${token}">Verify</a>
      <p>If link not work then paste that link on browser</p>
      <p>${origin}/verify/?token=${token}</p>
    </div>`
  });
}