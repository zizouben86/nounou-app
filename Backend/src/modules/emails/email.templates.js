const baseTemplate = (title, content) => `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>${title}</title></head>
<body style="margin:0;padding:20px;background:#FFF9F3;font-family:Inter,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#FFF9F3;border-radius:24px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#FF7A6B,#FFB84D);padding:40px 30px;text-align:center;color:white;">
      <div style="font-size:48px;margin-bottom:10px;">NounouHome</div>
      <h1 style="margin:0;font-size:24px;font-weight:800;">NounouHome</h1>
      <p style="margin:10px 0 0;opacity:0.9;font-size:14px;">La garde d'enfants reinventee</p>
    </div>
    <div style="background:white;padding:40px 30px;color:#333;line-height:1.6;">
      ${content}
    </div>
    <div style="background:#FFF9F3;padding:20px 30px;text-align:center;color:#666;font-size:13px;">
      <p style="margin:0 0 10px;">2026 NounouHome</p>
      <p style="margin:0;font-size:12px;color:#999;">Vous recevez cet email car vous etes inscrit sur NounouHome.</p>
    </div>
  </div>
</body>
</html>`;

const btn = 'display:inline-block;background:linear-gradient(135deg,#FF7A6B,#F05A48);color:white !important;padding:16px 32px;text-decoration:none;border-radius:50px;font-weight:600;margin:20px 0;';

const welcomeParent = ({ firstName }) => ({
  subject: 'Bienvenue sur NounouHome, ' + firstName + ' !',
  html: baseTemplate('Bienvenue', `
    <h2 style="color:#F05A48;margin-top:0;">Bonjour ${firstName} !</h2>
    <p>Bienvenue sur <strong>NounouHome</strong> ! Trouvez la nounou ideale pres de chez vous.</p>
    <div style="text-align:center;"><a href="${process.env.FRONTEND_URL}/nannies" style="${btn}">Trouver une nounou</a></div>
    <p style="color:#666;font-size:14px;">L'equipe NounouHome</p>
  `),
  text: 'Bienvenue ' + firstName + ' ! Trouvez une nounou sur NounouHome: ' + process.env.FRONTEND_URL + '/nannies',
});

const welcomeNanny = ({ firstName }) => ({
  subject: 'Bienvenue parmi nous, ' + firstName + ' !',
  html: baseTemplate('Bienvenue Nounou', `
    <h2 style="color:#F05A48;margin-top:0;">Bonjour ${firstName} !</h2>
    <p>Merci de rejoindre <strong>NounouHome</strong> ! Completez votre profil pour etre visible.</p>
    <div style="text-align:center;"><a href="${process.env.FRONTEND_URL}/dashboard" style="${btn}">Completer mon profil</a></div>
  `),
  text: 'Bienvenue ' + firstName + ' ! Completez votre profil: ' + process.env.FRONTEND_URL + '/dashboard',
});

const bookingConfirmationParent = ({ firstName, nannyName, startDate, endDate, totalPrice, bookingId }) => ({
  subject: 'Reservation confirmee avec ' + nannyName,
  html: baseTemplate('Reservation', `
    <h2 style="color:#5DCFA0;margin-top:0;">Reservation confirmee</h2>
    <p>Bonjour ${firstName}, votre reservation est enregistree.</p>
    <div style="background:#F0FBF6;border-left:4px solid #5DCFA0;padding:20px;border-radius:12px;margin:20px 0;">
      <p><strong>Nounou :</strong> ${nannyName}</p>
      <p><strong>Du :</strong> ${new Date(startDate).toLocaleDateString('fr-FR')}</p>
      <p><strong>Au :</strong> ${new Date(endDate).toLocaleDateString('fr-FR')}</p>
      <p style="font-size:18px;"><strong>Total :</strong> <span style="color:#F05A48;">${totalPrice} XAF</span></p>
    </div>
    <div style="text-align:center;"><a href="${process.env.FRONTEND_URL}/bookings/${bookingId}/pay" style="${btn}">Payer maintenant</a></div>
  `),
  text: 'Reservation confirmee avec ' + nannyName + '. Total: ' + totalPrice + ' XAF',
});

const bookingNotificationNanny = ({ nannyFirstName, parentName, startDate, endDate, totalPrice, bookingId }) => ({
  subject: 'Nouvelle reservation de ' + parentName,
  html: baseTemplate('Nouvelle reservation', `
    <h2 style="color:#F05A48;margin-top:0;">Nouvelle demande</h2>
    <p>Bonjour ${nannyFirstName}, vous avez une nouvelle reservation.</p>
    <div style="background:#FFF5F3;border-left:4px solid #FF7A6B;padding:20px;border-radius:12px;margin:20px 0;">
      <p><strong>Parent :</strong> ${parentName}</p>
      <p><strong>Du :</strong> ${new Date(startDate).toLocaleDateString('fr-FR')}</p>
      <p><strong>Au :</strong> ${new Date(endDate).toLocaleDateString('fr-FR')}</p>
      <p style="font-size:18px;"><strong>Vous recevrez :</strong> <span style="color:#5DCFA0;">${(totalPrice * 0.85).toFixed(2)} XAF</span></p>
    </div>
    <div style="text-align:center;"><a href="${process.env.FRONTEND_URL}/dashboard" style="${btn}">Voir la demande</a></div>
  `),
  text: 'Nouvelle reservation de ' + parentName + '.',
});

const paymentReceived = ({ firstName, amount, bookingId, nannyName }) => ({
  subject: 'Paiement recu - ' + amount + ' XAF',
  html: baseTemplate('Paiement recu', `
    <h2 style="color:#5DCFA0;margin-top:0;">Paiement confirme</h2>
    <p>Bonjour ${firstName}, nous avons recu votre paiement.</p>
    <div style="background:#F0FBF6;border-left:4px solid #5DCFA0;padding:20px;border-radius:12px;margin:20px 0;">
      <p><strong>Montant :</strong> <span style="color:#F05A48;font-size:20px;">${amount} XAF</span></p>
      <p><strong>Pour :</strong> ${nannyName}</p>
      <p><strong>Reference :</strong> ${bookingId}</p>
    </div>
  `),
  text: 'Paiement de ' + amount + ' XAF confirme.',
});

module.exports = {
  welcomeParent,
  welcomeNanny,
  bookingConfirmationParent,
  bookingNotificationNanny,
  paymentReceived,
};