const { BrevoClient } = require('@getbrevo/brevo');

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
  timeoutInSeconds: 30,
  maxRetries: 3,
});

const SENDER = {
  name: process.env.BREVO_SENDER_NAME || 'NounouHome',
  email: process.env.BREVO_SENDER_EMAIL || 'noreply@nounouhome.cm',
};

const sendEmail = async ({ to, subject, htmlContent, textContent }) => {
  try {
    const result = await brevo.transactionalEmails.sendTransacEmail({
      subject,
      htmlContent,
      textContent,
      sender: SENDER,
      to: [{ email: to }],
    });

    console.log('Email envoye a ' + to + ' — id: ' + result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (err) {
    console.error('Erreur email a ' + to + ': ' + err.message);
    return { success: false, error: err.message };
  }
};

module.exports = { sendEmail };