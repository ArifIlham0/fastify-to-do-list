const knex = require("../configs/database");
const bcrypt = require("bcrypt");
const { excludeFields, excludeFieldsFromArray} = require("../helpers/responseHelper");

const fetchUsers = async (request, response) => {
  try {
    const users = await knex('users').select('*').orderBy('updated_at', 'desc');
    response.send({
      status: 200,
      message: 'Users fetched successfully',
      data: excludeFieldsFromArray(users, ['password']),
    });
  } catch (error) {
    response.code(500).send({ status: 500, message: error.message });
  }
};

const fetchUserById = async (request, response) => {
  try {
    const { id } = request.params;
    const user = await knex('users').where({ id }).first();

    if (!user) {
      return response.code(404).send({ status: 404, message: 'User not found' });
    }

    response.send({
      status: 200,
      message: 'User fetched successfully',
      data: excludeFields(user, ['password']),
    });
  } catch (error) {
    response.code(500).send({ status: 500, message: error.message });
  }
};

const createUser = async (request, response) => {
  try {
    const { name, email, password, is_superuser } = request.body;

    if (!name || !email || !password) {
      return response.code(400).send({ 
        status: 400, 
        message: 'Name, email, and password are required' 
      });
    }

    const existingUser = await knex('users').where({ email }).first();
    if (existingUser) {
      return response.code(409).send({ 
        status: 409, 
        message: 'Email already exists' 
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const [id] = await knex('users').insert({ 
      name, 
      email, 
      password: hashedPassword, 
      is_superuser: is_superuser || false 
    });

    const newUser = await knex('users').where({ id }).first();

    const access_token = request.server.jwt.sign(
      { 
        id: newUser.id,
        email: newUser.email,
        is_superuser: newUser.is_superuser 
      },
      { expiresIn: "7d" }
    );

    const refresh_token = request.server.jwt.sign(
      { 
        id: newUser.id,
        email: newUser.email,
        is_superuser: newUser.is_superuser 
      },
      { expiresIn: "14d" }
    );

    await knex("refresh_tokens").insert({
      user_id: newUser.id,
      token: refresh_token,
    });

    response.code(201).send({
      status: 201,
      message: 'User registered successfully',
       data: {
        user: excludeFields(newUser, ['password']),
        access_token,
        refresh_token,
      }
    });
  } catch (error) {
    response.code(500).send({ status: 500, message: error.message });
  }
};

const updateUser = async (request, response) => {
  try {
    const { id } = request.params;
    const { name, email, password, is_superuser } = request.body;

    const updated = await knex('users').where({ id }).update({
      name,
      email,
      password,
      is_superuser,
      updated_at: knex.fn.now(),
    });

    if (!updated) {
      return response.code(404).send({ status: 404, message: 'User not found' });
    }

    await knex('users').where({ id }).first();

    response.send({
      status: 200,
      message: 'User updated successfully',
    });
  } catch (error) {
    response.code(500).send({ status: 500, message: error.message });
  }
};

const deleteUsers = async (request, response) => {
  try {
    const { ids } = request.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return response.code(400).send({ 
            status: 400, 
            message: 'IDs array is required and must not be empty' 
        });
    }

    const deleted = await knex('users').whereIn('id', ids).del();

    if (!deleted) {
      return response.code(404).send({ status: 404, message: 'No users found to delete' });
    }

    response.send({
      status: 200,
      message: `${deleted} user(s) deleted successfully`,
    });
  } catch (error) {
    response.code(500).send({ status: 500, message: error.message });
  }
};

const login = async (request, response) => {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      return response.code(400).send({ 
        status: 400, 
        message: 'Email and password are required' 
      });
    }

    const user = await knex('users').where({ email }).first();
    if (!user) {
      return response.code(401).send({ 
        status: 401, 
        message: 'Invalid email' 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return response.code(401).send({ 
        status: 401, 
        message: 'Invalid password' 
      });
    }

    const access_token = request.server.jwt.sign(
      { 
        id: user.id,
        email: user.email,
        is_superuser: user.is_superuser 
      },
      { expiresIn: "7d" }
    );

    const refresh_token = request.server.jwt.sign(
      { 
        id: user.id,
        email: user.email,
        is_superuser: user.is_superuser 
      },
      { expiresIn: "14d" }
    );

    await knex("refresh_tokens").insert({
      user_id: user.id,
      token: refresh_token,
    });

    response.send({
      status: 200,
      message: 'Login successful',
      data: {
        user: excludeFields(user, ['password']),
        access_token,
        refresh_token,
      }
    });
  } catch (error) {
    response.code(500).send({ status: 500, message: error.message });
  }
};

const refreshToken = async (request, response) => {
  try {
    const { refresh_token } = request.body;

    if (!refresh_token) {
      return response.code(400).send({
        status: 400,
        message: "Refresh token is required"
      });
    }

    const refreshTokenData = await knex("refresh_tokens").where({ token: refresh_token }).first();

    if (!refreshTokenData) {
      return response.code(401).send({
        status: 401,
        message: "Invalid refresh token"
      });
    }

    const decoded = await request.server.jwt.verify(refresh_token);
    const newAccessToken = request.server.jwt.sign(
      { 
        id: decoded.id,
        email: decoded.email,
        is_superuser: decoded.is_superuser 
      },
      { expiresIn: "7d" }
    );

    response.send({
      status: 200,
      message: "Token refreshed successfully",
      access_token: newAccessToken,
    });

  } catch (error) {
    response.code(500).send({ status: 500, message: error.message });
  }
};

const logout = async (request, response) => {
  try {
    const { refresh_token } = request.body;

    if (!refresh_token) {
      return response.code(400).send({
        status: 400,
        message: "Refresh token is required"
      });
    }

    await knex("refresh_tokens").where({ token: refresh_token }).del();

    response.send({
      status: 200,
      message: 'Logout successful'
    });
  } catch (error) {
    response.code(500).send({ status: 500, message: error.message });
  }
};

module.exports = { fetchUsers, fetchUserById, createUser, updateUser, deleteUsers, login, refreshToken, logout };