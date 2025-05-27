#!/usr/bin/env node
import { Command } from 'commander';
import { addComponent } from '../lib/add.js';
import { createProject } from '../lib/create.js';
const program = new Command();

program
  .name('pillars')
  .description('Node.js project scaffolder CLI - A tool to create and manage Node.js projects')
  .version('1.0.0');

program
  .command('create')
  .argument('<project-name>')
  .option('--typescript', 'Create a TypeScript project')
  .description('Create a new Node.js project')
  .action(async (name, options) => {
    try {
      await createProject(name, options);
    } catch (error) {
      console.error('❌ Error creating project:', error.message);
      process.exit(1);
    }
  });

program
  .command('add')
  .argument('<type>')
  .argument('<name>')
  .description('Add a component file')
  .action(addComponent);

program.parse();
