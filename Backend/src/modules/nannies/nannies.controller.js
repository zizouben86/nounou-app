const service = require('./nannies.service');

const search = async (req, res, next) => {
  try {
    const results = await service.search(req.query);
    res.json(results);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const nanny = await service.getById(req.params.id);
    res.json(nanny);
  } catch (err) { next(err); }
};

const getMe = async (req, res, next) => {
  try {
    const nanny = await service.getMe(req.user.id);
    res.json(nanny);
  } catch (err) { next(err); }
};

const updateMe = async (req, res, next) => {
  try {
    const updated = await service.updateMyProfile(req.user.id, req.body);
    res.json(updated);
  } catch (err) { next(err); }
};

const uploadDocuments = async (req, res, next) => {
  try {
    console.log("📁 Fichiers reçus :", req.files);

    const updates = {};
    if (req.files && req.files.idCard) {
      updates.idCardUrl = '/uploads/' + req.files.idCard[0].filename;
    }
    if (req.files && req.files.criminalRecord) {
      updates.criminalRecordUrl = '/uploads/' + req.files.criminalRecord[0].filename;
    }
    if (req.files && req.files.diploma) {
      updates.diplomaUrl = '/uploads/' + req.files.diploma[0].filename;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'Aucun fichier reçu' });
    }

    console.log("📝 Mise à jour DB avec :", updates);

    // Mettre à jour la DB
    await service.updateMyProfile(req.user.id, updates);

    // Récupérer le profil complet pour le renvoyer
    const fullProfile = await service.getMe(req.user.id);
    res.json(fullProfile);
  } catch (err) {
    console.error("❌ Erreur upload :", err);
    next(err);
  }
};

module.exports = { search, getById, getMe, updateMe, uploadDocuments };