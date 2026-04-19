# -*- coding: utf-8 -*-
import os
import shutil

from .data_storage import DataStorage


class LocalStorage(DataStorage):
    def download_folder(self, source_path, destination_path):
        """Copy a folder from source_path to destination_path."""
        abs_source_path = os.path.abspath(source_path)
        abs_destination_path = os.path.abspath(destination_path)

        if abs_source_path == abs_destination_path:
            return

        if not os.path.exists(source_path):
            return

        # Ensure the destination path exists
        os.makedirs(destination_path, exist_ok=True)

        # Copy the directory structure and files
        for root, _, files in os.walk(source_path):
            relative_path = os.path.relpath(root, source_path)
            dest_dir = os.path.join(destination_path, relative_path)

            # Ensure the destination directory exists
            os.makedirs(dest_dir, exist_ok=True)

            # Copy files
            for file in files:
                src_file = os.path.join(root, file)
                dest_file = os.path.join(dest_dir, file)
                shutil.copy2(src_file, dest_file)

    def upload_folder(self, source_path, destination_path):
        """Copy a folder from source_path to destination_path."""
        # This is essentially a symmetric operation of download_folder
        self.download_folder(source_path, destination_path)

    def path_join(self, *args):
        """Join path components."""
        return os.path.join(*args)
