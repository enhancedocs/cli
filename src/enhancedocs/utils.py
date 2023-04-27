import os


def get_files(dir_path):
    files_list = []
    for entry in os.scandir(dir_path):
        entry_path = os.path.join(dir_path, entry.name)
        if entry.is_file():
            files_list.append(entry_path)
        else:
            files_list.extend(get_files(entry_path))
    return files_list
