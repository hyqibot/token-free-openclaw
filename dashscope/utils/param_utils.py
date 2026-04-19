# -*- coding: utf-8 -*-


class ParamUtil:
    @staticmethod
    def should_modify_incremental_output(model_name: str) -> bool:
        """
        Determine if increment_output parameter needs to be modified based on
        model name.

        Args:
            model_name (str): The name of the model to check

        Returns:
            bool: False if model contains 'tts', 'omni', or
                  'qwen-deep-research', True otherwise
        """
        if not isinstance(model_name, str):
            return True

        model_name_lower = model_name.lower()

        # Check for conditions that return False
        if "tts" in model_name_lower:
            return False
        if "omni" in model_name_lower:
            return False
        if "qwen-deep-research" in model_name_lower:
            return False

        return True
