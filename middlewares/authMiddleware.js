const authenticate = async (request, response) => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return response.code(401).send({
        status: 401,
        message: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = await request.server.jwt.verify(token);
      request.user = decoded;
    } catch (error) {
      return response.code(401).send({
        status: 401,
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    return response.code(500).send({
      status: 500,
      message: error.message
    });
  }
};

const requireAdmin = async (request, response) => {
  if (!request.user) {
    return response.code(401).send({
      status: 401,
      message: 'Authentication required'
    });
  }

  if (!request.user.is_superuser) {
    return response.code(403).send({
      status: 403,
      message: 'Admin privileges required'
    });
  }
};

const requireUser = async (request, response) => {
  if (!request.user) {
    return response.code(401).send({
      status: 401,
      message: 'Authentication required'
    });
  }
};

module.exports = { authenticate, requireAdmin, requireUser };