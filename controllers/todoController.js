const knex = require("../configs/database");

const fetchTodos = async (request, response) => {
  try {
    const { is_completed, is_overdue } = request.query;
    let query = knex('todos').where({ user_id: request.user.id });
    
    if (is_completed !== undefined && is_completed !== '') {
        const completedValue = is_completed === 'true' || is_completed === '1';
        query = query.where({ is_completed: completedValue });
    }
    
    if (is_overdue !== undefined && is_overdue !== '') {
        if (is_overdue === 'true' || is_overdue === '1') {
            const now = new Date();
            query = query.where('due_date', '<', now).whereNotNull('due_date').where({ is_completed: false });
        }
    }
    
    const todos = await query.orderBy('due_date', 'asc').orderBy('updated_at', 'desc');

    response.send({
        status: 200,
        message: 'Todos fetched successfully',
        data: todos,
    });
  } catch (error) {
    response.code(500).send({ status: 500, message: error.message });
  }
};

const fetchTodoById = async (request, response) => {
  try {
    const { id } = request.params;
    
    const todo = await knex('todos').where({ id, user_id: request.user.id }).first();

    if (!todo) {
      return response.code(404).send({ 
        status: 404, 
        message: 'Todo not found' 
      });
    }

    response.send({
      status: 200,
      message: 'Todo fetched successfully',
      data: todo,
    });
  } catch (error) {
    response.code(500).send({ status: 500, message: error.message });
  }
};

const createTodo = async (request, response) => {
  try {
    const { title, description, due_date } = request.body;

    if (!title) {
      return response.code(400).send({ 
        status: 400, 
        message: 'Title is required' 
      });
    }

    await knex('todos').insert({ 
        user_id: request.user.id,
        title, 
        description: description || null,
        due_date: due_date || null,
        is_completed: false
    });

    response.code(201).send({
      status: 201,
      message: 'Todo created successfully',
    });
  } catch (error) {
    response.code(500).send({ status: 500, message: error.message });
  }
};

const updateTodo = async (request, response) => {
  try {
    const { id } = request.params;
    const { title, description, is_completed, due_date } = request.body;

    const todo = await knex('todos').where({ id, user_id: request.user.id }).first();

    if (!todo) {
      return response.code(404).send({ 
        status: 404, 
        message: 'Todo not found' 
      });
    }

    const updated = await knex('todos')
      .where({ id, user_id: request.user.id })
      .update({
        title: title || todo.title,
        description: description !== undefined ? description : todo.description,
        is_completed: is_completed !== undefined ? is_completed : todo.is_completed,
        due_date: due_date !== undefined ? due_date : todo.due_date,
        updated_at: knex.fn.now(),
      });

    if (!updated) {
      return response.code(404).send({ 
        status: 404, 
        message: 'Todo not found' 
      });
    }

    response.send({
        status: 200,
        message: 'Todo updated successfully',
    });
  } catch (error) {
    response.code(500).send({ status: 500, message: error.message });
  }
};

const deleteTodos = async (request, response) => {
  try {
    const { ids } = request.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return response.code(400).send({ 
            status: 400, 
            message: 'IDs array is required and must not be empty' 
        });
    }

    const deleted = await knex('todos').whereIn('id', ids).where({ user_id: request.user.id }).del();

    if (!deleted) {
        return response.code(404).send({ 
            status: 404, 
            message: 'No todos found to delete' 
        });
    }

    response.send({
        status: 200,
        message: `${deleted} todo(s) deleted successfully`,
    });
  } catch (error) {
    response.code(500).send({ status: 500, message: error.message });
  }
};

module.exports = { fetchTodos, fetchTodoById, createTodo, updateTodo, deleteTodos };