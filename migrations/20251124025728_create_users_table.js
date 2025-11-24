/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("users", function (table) {
        table.increments('id').primary();
        table.string('name', 100).notNullable();
        table.string('email', 100).notNullable().unique();
        table.string('password', 255).notNullable();
        table.boolean('is_superuser').defaultTo(false);
        table.timestamps(true, true);
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('users');
};
