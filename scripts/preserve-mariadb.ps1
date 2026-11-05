<#
Offline preservation only. Never repairs, starts/stops, replaces or deletes database files.
Run only after the owner has stopped MySQL in XAMPP and agreed to leave it stopped.
Creates a new private directory OUTSIDE the repository, with separate source trees.
#>
param([Parameter(Mandatory=$true)][string]$Destination)
$ErrorActionPreference = 'Stop'
function Assert-Offline {
    if (@(Get-Process -Name mysqld,mariadbd -ErrorAction SilentlyContinue).Count -ne 0) {
        throw 'MariaDB is running. Stop it in XAMPP and keep it stopped before preservation.'
    }
}
Assert-Offline
$repo = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..')).TrimEnd('\')
$backupRoot = [IO.Path]::GetFullPath($Destination).TrimEnd('\')
if ($backupRoot.StartsWith($repo + '\', [StringComparison]::OrdinalIgnoreCase) -or $backupRoot -eq $repo) { throw 'Backups must be outside the repository.' }
if ($backupRoot.StartsWith('C:\xampp\', [StringComparison]::OrdinalIgnoreCase) -or $backupRoot -eq 'C:\xampp') { throw 'Backups must be outside XAMPP.' }
if (Test-Path -LiteralPath $backupRoot) { throw 'Refusing existing destination; use a new private directory.' }
$ancestor = [IO.DirectoryInfo]::new($backupRoot).Parent
while ($null -ne $ancestor) {
    if ($ancestor.Exists -and ($ancestor.Attributes -band [IO.FileAttributes]::ReparsePoint)) { throw 'Destination ancestor is a reparse point; review before copying.' }
    $ancestor = $ancestor.Parent
}
$sources = @{
    'current-data' = 'C:\xampp\mysql\data'
    'original-data-old' = 'C:\xampp\mysql\data-old'
    'xampp-stock-backup' = 'C:\xampp\mysql\backup'
}
$requiredBytes = 0L
foreach ($source in $sources.Values) {
    if (-not (Test-Path -LiteralPath $source -PathType Container)) { throw 'A required source directory is missing.' }
    $entries = @(Get-Item -LiteralPath $source) + @(Get-ChildItem -LiteralPath $source -Recurse -Force)
    if (@($entries | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }).Count) { throw 'Reparse point found; review before copying.' }
    $requiredBytes += ($entries | Where-Object { -not $_.PSIsContainer } | Measure-Object -Property Length -Sum).Sum
}
$drive = [IO.DriveInfo]::new([IO.Path]::GetPathRoot($backupRoot))
if ($drive.AvailableFreeSpace -lt ($requiredBytes * 2 + 100MB)) { throw 'Insufficient free space for verified preservation.' }
New-Item -ItemType Directory -Path $backupRoot | Out-Null
$summaries = @()
foreach ($label in ($sources.Keys | Sort-Object)) {
    Assert-Offline
    $source = [IO.Path]::GetFullPath($sources[$label]).TrimEnd('\')
    $target = Join-Path $backupRoot $label
    $beforeDirectories = @(Get-ChildItem -LiteralPath $source -Recurse -Directory -Force | ForEach-Object { $_.FullName.Substring($source.Length + 1) } | Sort-Object)
    $before = @(Get-ChildItem -LiteralPath $source -Recurse -File -Force | Sort-Object FullName | ForEach-Object {
        [pscustomobject]@{ Path=$_.FullName.Substring($source.Length + 1); Bytes=$_.Length; LastWriteUtc=$_.LastWriteTimeUtc.ToString('o'); SHA256=(Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash }
    })
    Copy-Item -LiteralPath $source -Destination $target -Recurse -Force
    Assert-Offline
    $afterFiles = @(Get-ChildItem -LiteralPath $source -Recurse -File -Force)
    $copiedFiles = @(Get-ChildItem -LiteralPath $target -Recurse -File -Force)
    if ($afterFiles.Count -ne $before.Count -or $copiedFiles.Count -ne $before.Count) { throw 'Source/destination file membership changed.' }
    $afterDirectories = @(Get-ChildItem -LiteralPath $source -Recurse -Directory -Force | ForEach-Object { $_.FullName.Substring($source.Length + 1) } | Sort-Object)
    $copiedDirectories = @(Get-ChildItem -LiteralPath $target -Recurse -Directory -Force | ForEach-Object { $_.FullName.Substring($target.Length + 1) } | Sort-Object)
    if (($beforeDirectories -join "`n") -cne ($afterDirectories -join "`n") -or
        ($beforeDirectories -join "`n") -cne ($copiedDirectories -join "`n")) { throw 'Source/destination directory membership changed.' }
    foreach ($entry in $before) {
        $sourceFile = Join-Path $source $entry.Path
        $copiedFile = Join-Path $target $entry.Path
        if ((Get-FileHash -LiteralPath $sourceFile -Algorithm SHA256).Hash -ne $entry.SHA256 -or
            (Get-FileHash -LiteralPath $copiedFile -Algorithm SHA256).Hash -ne $entry.SHA256) { throw 'Source changed or copy hash mismatch; preserve both for review.' }
    }
    $manifest = Join-Path $backupRoot ($label + '-manifest.json')
    [pscustomobject]@{ Directories=$beforeDirectories; Files=$before } | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $manifest -Encoding UTF8
    $summaries += [pscustomobject]@{ Label=$label; Source=$source; Backup=$target; Files=$before.Count; Bytes=($before | Measure-Object Bytes -Sum).Sum; ManifestSHA256=(Get-FileHash -LiteralPath $manifest -Algorithm SHA256).Hash; Verified=$true }
}
Assert-Offline
$configTarget = Join-Path $backupRoot 'configuration'
New-Item -ItemType Directory -Path $configTarget | Out-Null
foreach ($pair in @(@('C:\xampp\mysql\bin\my.ini','mysql-bin-my.ini'), @('C:\xampp\xampp-control.ini','xampp-control.ini'))) {
    $target = Join-Path $configTarget $pair[1]
    Copy-Item -LiteralPath $pair[0] -Destination $target
    if ((Get-FileHash -LiteralPath $pair[0]).Hash -ne (Get-FileHash -LiteralPath $target).Hash) { throw 'Configuration copy mismatch.' }
}
Assert-Offline
$summaries | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $backupRoot 'preservation-summary.json') -Encoding UTF8
$summaries | ConvertTo-Json -Depth 5
