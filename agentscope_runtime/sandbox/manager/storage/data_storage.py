# -*- coding: utf-8 -*-
import abc


class DataStorage(abc.ABC):
    @abc.abstractmethod
    def download_folder(self, source_path, destination_path):
        """Download a folder from storage to a local path."""

    @abc.abstractmethod
    def upload_folder(self, source_path, destination_path):
        """Upload a local folder to storage."""

    @abc.abstractmethod
    def path_join(self, *args):
        """Joins multiple path components into a single path string."""
