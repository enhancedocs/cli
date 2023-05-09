import os
import click
from .config import ENVIRONMENT_VARIABLES_HELP
from pathspec import PathSpec
from pathspec.patterns import GitWildMatchPattern


def find_gitignore_files(dir_path):
    gitignore_files = []
    for entry in os.scandir(dir_path):
        entry_path = os.path.join(dir_path, entry.name)
        if entry.is_file() and entry.name == '.gitignore':
            gitignore_files.append(entry_path)
        elif entry.is_dir():
            gitignore_files.extend(find_gitignore_files(entry_path))
    return gitignore_files


def get_ignore_spec(gitignore_files):
    ignore_patterns = [".enhancedocs", ".git", ".idea"]
    for gitignore_file in gitignore_files:
        with open(gitignore_file, 'r', encoding='utf-8') as f:
            ignore_patterns.extend([line.strip() for line in f.readlines()])
    return PathSpec.from_lines(GitWildMatchPattern, ignore_patterns)


def get_files(dir_path, ignore_spec):
    files_list = []
    for entry in os.scandir(dir_path):
        entry_path = os.path.join(dir_path, entry.name)
        if entry.is_file() and not ignore_spec.match_file(entry_path):
            files_list.append(entry_path)
        elif entry.is_dir():
            files_list.extend(get_files(entry_path, ignore_spec))
    return files_list


class CustomHelpGroup(click.Group):
    def get_help(self, ctx):
        default_help = super().get_help(ctx)
        return f"{default_help}\n{ENVIRONMENT_VARIABLES_HELP}"
