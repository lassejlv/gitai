import { $ } from "bun";
import ora from "ora";
import clipboardy from "clipboardy";
import { SummarizeChanges } from "../lib/ai";

let all_changes = "";

export const SummarizeCommand = async () => {
  const git_status = await $`git status -s --untracked-files=no`.quiet();

  const files_changed = git_status.stdout
    .toString()
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => line.trim().substring(2));

  for (const file of files_changed) {
    const diff = await $`git diff -- ${file}`.quiet();

    const patch = await $`git diff --patch -- ${file}`.quiet();

    const diff_text = diff.stdout
      .toString()
      .split("\n")
      .filter((line) => line.trim() !== "")
      .join("\n");

    const patch_text = patch.stdout
      .toString()
      .split("\n")
      .filter((line) => line.trim() !== "")
      .join("\n");

    all_changes += `${file}\n`;
    all_changes += diff_text;
    all_changes += "\n";
    all_changes += patch_text;
    all_changes += "\n";
    all_changes += "\n";
  }

  const id = Bun.randomUUIDv7();

  const spinner = ora("Summarizing changes...").start();
  await Bun.write(`tmp/git_changes-${id}.txt`, all_changes);
  const changes = await SummarizeChanges(`tmp/git_changes-${id}.txt`);

  spinner.succeed("Changes summarized");
  console.log(changes);
  await clipboardy.write(changes);
  await $`rm -rf tmp`;
};
