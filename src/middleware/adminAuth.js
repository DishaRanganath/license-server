// exports.verifyAdmin = (req, res, next) => {
//   const apiKey = req.headers['x-admin-key'];

//   if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
//     return res.status(401).json({ message: 'Unauthorized. Invalid admin key.' });
//   }

//   next();
// };
exports.verifyAdmin = (req, res, next) => {
  const apiKey = req.headers['x-admin-key'];

  // TEMPORARY DEBUG - remove after fixing
  console.log('=== ADMIN AUTH DEBUG ===');
  console.log('Received key:', JSON.stringify(apiKey));
  console.log('Expected key:', JSON.stringify(process.env.ADMIN_API_KEY));
  console.log('Match:', apiKey === process.env.ADMIN_API_KEY);
  console.log('========================');

  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ message: 'Unauthorized. Invalid admin key.' });
  }

  next();
};