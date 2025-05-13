#!/usr/bin/env node
import { cac } from "cac";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createProject } from "./createProject.js";
import prompts from "prompts";

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

// Available templates - later we could load this dynamically
const AVAILABLE_TEMPLATES = [
  {
    name: "python-fastapi",
    display: "Python FastAPI",
    description: "Minimal FastAPI server with OpenAI + Helicone",
    color: "green",
  },
  // Add more templates here as they become available
];

const cli = cac("create-helicone-app");

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
    // Show header
    console.log(`
${chalk.bold.cyan("Create Helicone App")} ${chalk.gray(`v${version}`)}
${chalk.dim("A CLI to generate Helicone-integrated projects")}
`);

    if (options.list) {
      console.log(chalk.bold("Available templates:"));
      for (const template of AVAILABLE_TEMPLATES) {
        // Safely handle the chalk color
        let coloredName = template.name;
        if (template.color === "green") {
          coloredName = chalk.green(template.name);
        } else if (template.color === "blue") {
          coloredName = chalk.blue(template.name);
        } else if (template.color === "yellow") {
          coloredName = chalk.yellow(template.name);
        }

        console.log(`  ${coloredName} - ${template.description}`);
      }
      process.exit(0);
    }

    // If no project directory provided, enter interactive mode
    let finalOptions = { ...options };

    if (!projectDirectory) {
      const responses = await prompts(
        [
          {
            type: "text",
            name: "projectName",
            message: "What is your project named?",
            initial: "my-helicone-app",
          },
          {
            type: "select",
            name: "template",
            message: "Select a template",
            choices: AVAILABLE_TEMPLATES.map((t) => ({
              title: t.display,
              description: t.description,
              value: t.name,
            })),
            initial: 0,
          },
          {
            type: "confirm",
            name: "install",
            message: "Install dependencies?",
            initial: false,
          },
          {
            type: "confirm",
            name: "git",
            message: "Initialize Git repository?",
            initial: false,
          },
        ],
        {
          onCancel: () => {
            console.log(chalk.red("✖") + " Operation cancelled");
            process.exit(1);
          },
        }
      );

      projectDirectory = responses.projectName;
      finalOptions = {
        ...finalOptions,
        template: responses.template,
        install: responses.install,
        git: responses.git,
      };

      if (!projectDirectory) {
        console.error(chalk.red("Project name is required"));
        process.exit(1);
      }
    }

    console.log(`
${chalk.bold.cyan("Create Helicone App")} v${version}
${chalk.bold("✨ Creating a new Helicone project in")} ${chalk.green(
      projectDirectory
    )}
${chalk.dim(`Template: ${finalOptions.template}`)}
`);

    try {
      await createProject({
        projectName: projectDirectory,
        template: finalOptions.template,
        installDeps: !!finalOptions.install,
        initGit: !!finalOptions.git,
      });

      console.log(`
${chalk.green("Success!")} Created ${projectDirectory}

${chalk.bold("Next steps:")}
  1. ${chalk.cyan(`cd ${projectDirectory}`)}
  2. ${chalk.cyan(
    finalOptions.template.startsWith("python")
      ? "cp env.example .env # add your API keys"
      : "cp .env.example .env # add your API keys"
  )}
  3. ${chalk.cyan(
    finalOptions.template.startsWith("python")
      ? "pip install -r requirements.txt"
      : "npm install"
  )}
  4. ${chalk.cyan(
    finalOptions.template.startsWith("python")
      ? "uvicorn app.main:app --reload"
      : "npm run dev"
  )}

${chalk.bold("Documentation:")}
  ${chalk.cyan("https://docs.helicone.ai/templates/" + finalOptions.template)}
`);
      // Ensure the process exits cleanly
      process.exit(0);
    } catch (error) {
      console.error(`${chalk.red("Error:")} ${(error as Error).message}`);
      process.exit(1);
    }
  });

cli.help();
cli.version(version);

cli.parse();
