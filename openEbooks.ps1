
$target = "d:/Obsidian Vaults/eBookSandbox/.obsidian/plugins/obsidian-importer/main.js"

Copy-Item -path './main.js' -Destination $target -Force
Start-Process  'obsidian://open?vault=eBookSandbox'

ls $target

