#!/usr/bin/env node
import { cac } from "cac";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createProject } from "./createProject.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../package.json"), "utf8")
);
const { version } = packageJson;

// CLI options type
interface CliOptions {
  template: string;
  install?: boolean;
  git?: boolean;
  list?: boolean;
}

const cli = cac("create-helicone");

cli
  .command(
    "[project-directory]",
    "Create a new project with Helicone integration"
  )
  .option("--template <name>", "Template to use", { default: "python-fastapi" })
  .option("--install", "Install dependencies after project creation")
  .option("--git", "Initialize git repository")
  .option("--list", "List available templates")
  .action(async (projectDirectory: string, options: CliOptions) => {
    if (options.list) {
      console.log(chalk.bold("Available templates:"));
      console.log(
        `  ${chalk.green(
          "python-fastapi"
        )} - Minimal FastAPI server with OpenAI + Helicone`
      );
      // Add more templates here as they become available
      process.exit(0);
    }

    if (!projectDirectory) {
      console.error(chalk.red("Please specify a project directory:"));
      console.log(
        `  ${chalk.cyan("npx create-helicone")} ${chalk.green("my-app")}`
      );
      process.exit(1);
    }

    console.log(`
${chalk.bold.cyan("Create Helicone")} v${version}
${chalk.bold("✨ Creating a new Helicone project in")} ${chalk.green(
      projectDirectory
    )}
`);

    try {
      await createProject({
        projectName: projectDirectory,
        template: options.template,
        installDeps: !!options.install,
        initGit: !!options.git,
      });

      console.log(`
${chalk.green("Success!")} Created ${projectDirectory}

${chalk.bold("Next steps:")}
  1. ${chalk.cyan(`cd ${projectDirectory}`)}
  2. ${chalk.cyan(
    options.template.startsWith("python")
      ? "cp env.example .env # add your API keys"
      : "cp .env.example .env # add your API keys"
  )}
  3. ${chalk.cyan(
    options.template.startsWith("python")
      ? "pip install -r requirements.txt"
      : "npm install"
  )}
  4. ${chalk.cyan(
    options.template.startsWith("python")
      ? "uvicorn app.main:app --reload"
      : "npm run dev"
  )}

${chalk.bold("Documentation:")}
  ${chalk.cyan("https://docs.helicone.ai/templates/" + options.template)}
`);
    } catch (error) {
      console.error(`${chalk.red("Error:")} ${(error as Error).message}`);
      process.exit(1);
    }
  });

cli.help();
cli.version(version);

cli.parse();
