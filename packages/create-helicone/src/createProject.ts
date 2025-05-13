import degit from "degit";
import { execa } from "execa";
import fs from "fs/promises";
import path from "path";
import ora from "ora";

export interface CreateProjectOptions {
  projectName: string;
  template: string;
  installDeps: boolean;
  initGit: boolean;
}

export async function createProject(
  options: CreateProjectOptions
): Promise<void> {
  const { projectName, template, installDeps, initGit } = options;

  // Create target directory
  const targetDir = path.resolve(process.cwd(), projectName);

  // Source template path
  const templatePath = `colegottdank/helicone-templates/templates/${template}/template`;

  // Check if directory exists
  try {
    const dirExists = await fs.stat(targetDir).catch(() => false);
    if (dirExists) {
      // Check if directory is empty
      const files = await fs.readdir(targetDir);
      if (files.length > 0) {
        throw new Error(
          `The directory ${projectName} already exists and is not empty`
        );
      }
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
    // Directory doesn't exist, we'll create it with degit
  }

  // Clone the template
  const spinner = ora("Downloading template...").start();
  try {
    const emitter = degit(templatePath, {
      cache: false,
      force: true,
      verbose: false,
    });

    await emitter.clone(targetDir);
    spinner.succeed("Template downloaded successfully");
  } catch (error) {
    spinner.fail("Failed to download template");
    throw new Error(`Failed to download template: ${(error as Error).message}`);
  }

  // Initialize git repository if requested
  if (initGit) {
    const gitSpinner = ora("Initializing git repository...").start();
    try {
      await execa("git", ["init"], { cwd: targetDir });
      await execa("git", ["add", "."], { cwd: targetDir });
      await execa(
        "git",
        ["commit", "-m", "Initial commit from create-helicone"],
        { cwd: targetDir }
      );
      gitSpinner.succeed("Git repository initialized");
    } catch (error) {
      gitSpinner.fail("Failed to initialize git repository");
      console.warn(
        `Warning: Git initialization failed: ${(error as Error).message}`
      );
    }
  }

  // Install dependencies if requested
  if (installDeps) {
    const depsSpinner = ora("Installing dependencies...").start();
    try {
      if (template.startsWith("python")) {
        await execa("pip", ["install", "-r", "requirements.txt"], {
          cwd: targetDir,
        });
      } else {
        // Default to npm for JavaScript/TypeScript templates
        await execa("npm", ["install"], { cwd: targetDir });
      }
      depsSpinner.succeed("Dependencies installed");
    } catch (error) {
      depsSpinner.fail("Failed to install dependencies");
      console.warn(
        `Warning: Dependency installation failed: ${(error as Error).message}`
      );
    }
  }
}
