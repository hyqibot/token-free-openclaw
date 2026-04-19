"""Case conversion utility for PascalCase, camelCase, and snake_case."""

import re

# Acronyms that should remain uppercase in Pascal/camelCase
_ACRONYMS = {"LLM", "API", "URL", "HTTP", "JSON", "XML", "AI", "MCP"}
_ACRONYM_MAP = {word.lower(): word for word in _ACRONYMS}


def camel_to_snake(content: str) -> str:
    """Convert PascalCase or camelCase to snake_case."""
    # Normalize acronyms to title case (e.g., LLM -> Llm) to assist regex splitting
    for word in _ACRONYMS:
        content = content.replace(word, word.capitalize())

    # Insert underscores between case transitions and convert to lowercase
    return re.sub(r"(?<!^)(?=[A-Z])", "_", content).lower()


def snake_to_camel(content: str) -> str:
    """Convert snake_case to PascalCase (preserving defined acronyms)."""
    return "".join(_ACRONYM_MAP.get(part.lower(), part.capitalize()) for part in content.split("_") if part)


if __name__ == "__main__":
    # Quick verification
    print(camel_to_snake("OpenAILLMClient"))  # open_ai_llm_client
    print(snake_to_camel("open_ai_llm_client"))  # OpenAILLMClient
