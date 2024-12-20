const { getConvo } = require('~/models');

// Middleware to validate conversationId and user relationship
const validateMessageReq = async (req, res, next) => {
  let userId = req.query.studentId || req.user.id;  
  
  let conversationId = req.params.conversationId || req.body.conversationId;

  if (conversationId === 'new') {
    return res.status(200).send([]);
  }

  if (!conversationId && req.body.message) {
    conversationId = req.body.message.conversationId;
  }

  const conversation = await getConvo(userId, conversationId);

  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  if (conversation.user !== userId) {
    return res.status(403).json({ error: 'User not authorized for this conversation' });
  }

  next();
};

module.exports = validateMessageReq;
