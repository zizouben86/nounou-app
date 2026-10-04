const { ZodError } = require('zod');

const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Données invalides',
      errors: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Erreur serveur',
  });
};

module.exports = { errorHandler };