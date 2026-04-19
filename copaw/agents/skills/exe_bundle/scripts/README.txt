Put your "exe + libraries/dll + resource files" in a single subdirectory under this skill, e.g.:
  scripts/MyApp/
    MyApp.exe
    (all dlls, libs, config, data, etc.)
In that skill's SKILL.md specify: working directory = scripts/MyApp, entry command = MyApp.exe [args].
