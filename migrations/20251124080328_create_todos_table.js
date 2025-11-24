/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("todos", function (table) {
        table.increments('id').primary();
        table.integer('user_id').unsigned().notNullable();
        table.string('title', 255).notNullable();
        table.text('description');
        table.boolean('is_completed').defaultTo(false);
        table.datetime('due_date');
        table.timestamps(true, true);
        
        table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('todos');
};
