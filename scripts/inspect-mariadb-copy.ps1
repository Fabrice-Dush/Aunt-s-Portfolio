<#
Diagnostic on a NEW disposable copy of a verified preservation tree.
RecoveryLevel > 0 requires explicit user authorization (granted 2026-11-04 for 1-6).
Never starts the original/preservation directories. No SQL writes or file deletions.
Leaves a successfully started isolated process running for read-only inspection;
shut it down gracefully through its dedicated port after inspection.
#>
param(
    [Parameter(Mandatory=$true)][ValidateSet('original-data-old','current-data')][string]$Label,
    [ValidateRange(0,6)][int]$RecoveryLevel = 0
)
$ErrorActionPreference = 'Stop'
$preserved = 'C:\Users\HP\Documents\Seraphine-Database-Recovery\2026-11-04-preservation-01'
$source = Join-Path $preserved $Label
$run = 'C:\Users\HP\Documents\Seraphine-Database-Recovery\2026-11-04-normal-' + $Label
$port = if ($Label -eq 'original-data-old') { 13307 } else { 13308 }
if ($RecoveryLevel -gt 0) {
    if ($Label -ne 'original-data-old') { throw 'Recovery tests may use only the verified original backup.' }
    $run = 'C:\Users\HP\Documents\Seraphine-Database-Recovery\2026-11-04-recovery-level-' + $RecoveryLevel
    $port = 13309
    if ($RecoveryLevel -gt 1) {
        $previous = 'C:\Users\HP\Documents\Seraphine-Database-Recovery\2026-11-04-recovery-level-' + ($RecoveryLevel - 1)
        if (-not (Test-Path -LiteralPath (Join-Path $previous 'startup-result.json'))) { throw 'Previous level has not been tested.' }
    }
    if ($RecoveryLevel -ge 4 -and -not (Select-String -LiteralPath (Join-Path $PSScriptRoot '..\docs\PHASE_06_DATABASE_INCIDENT.md') -SimpleMatch 'Levels 1-3 reviewed before higher recovery tests')) { throw 'Document and review levels 1-3 before higher recovery tests.' }
}
if (@(Get-Process | Where-Object { $_.ProcessName -in @('mysqld','mariadbd') }).Count) { throw 'Stop and review existing database processes before isolated startup.' }
if (Test-Path -LiteralPath $run) { throw 'Refusing existing working directory.' }
if (@([Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners() | Where-Object { $_.Port -eq $port }).Count) { throw 'Isolated port is in use.' }
$summary = Get-Content -LiteralPath (Join-Path $preserved 'preservation-summary.json') -Raw | ConvertFrom-Json
$record = @($summary | Where-Object Label -eq $Label)
if ($record.Count -ne 1 -or -not $record[0].Verified -or $record[0].Backup -ne $source) { throw 'Verified preservation record missing.' }
$manifestPath = Join-Path $preserved ($Label + '-manifest.json')
if ((Get-FileHash -LiteralPath $manifestPath -Algorithm SHA256).Hash -ne $record[0].ManifestSHA256) { throw 'Manifest hash changed.' }
$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
$entries = @(Get-Item -LiteralPath $source) + @(Get-ChildItem -LiteralPath $source -Recurse -Force)
if (@($entries | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }).Count) { throw 'Reparse point found.' }
if (@($entries | Where-Object { $_.Extension -eq '.isl' }).Count) { throw 'External InnoDB tablespace reference requires review.' }
$ancestor = [IO.DirectoryInfo]::new($run).Parent
while ($null -ne $ancestor) {
    if ($ancestor.Exists -and ($ancestor.Attributes -band [IO.FileAttributes]::ReparsePoint)) { throw 'Working path ancestor is a reparse point.' }
    $ancestor = $ancestor.Parent
}
New-Item -ItemType Directory -Path $run | Out-Null
$data = Join-Path $run 'data'
Copy-Item -LiteralPath $source -Destination $data -Recurse -Force
$files = @(Get-ChildItem -LiteralPath $data -Recurse -File -Force)
if ($files.Count -ne $manifest.Files.Count) { throw 'Working copy file count mismatch.' }
foreach ($entry in $manifest.Files) {
    if ((Get-FileHash -LiteralPath (Join-Path $source $entry.Path) -Algorithm SHA256).Hash -ne $entry.SHA256 -or
        (Get-FileHash -LiteralPath (Join-Path $data $entry.Path) -Algorithm SHA256).Hash -ne $entry.SHA256) { throw 'Preserved/working copy hash mismatch.' }
}
$dirs = @(Get-ChildItem -LiteralPath $data -Recurse -Directory -Force | ForEach-Object { $_.FullName.Substring($data.Length + 1) } | Sort-Object)
if (($dirs -join "`n") -cne ($manifest.Directories -join "`n")) { throw 'Working copy directory mismatch.' }
$tmp = Join-Path $run 'tmp'
New-Item -ItemType Directory -Path $tmp | Out-Null
$dataUnix = $data.Replace('\','/')
$runUnix = $run.Replace('\','/')
$config = @"
[mysqld]
basedir=C:/xampp/mysql
plugin_dir=C:/xampp/mysql/lib/plugin
datadir=$dataUnix
tmpdir=$runUnix/tmp
pid_file=$runUnix/isolated.pid
log_error=$runUnix/isolated-error.log
aria_log_dir_path=$dataUnix
innodb_data_home_dir=$dataUnix
innodb_data_file_path=ibdata1:10M:autoextend
innodb_log_group_home_dir=$dataUnix
innodb_log_file_size=5M
innodb_log_buffer_size=8M
innodb_buffer_pool_size=16M
innodb_buffer_pool_filename=isolated-buffer-pool
innodb_temp_data_file_path=ibtmp1:12M:autoextend
innodb_force_recovery=$RecoveryLevel
bind_address=127.0.0.1
port=$port
read_only=ON
event_scheduler=OFF
skip_slave_start
skip_log_bin
general_log=OFF
slow_query_log=OFF
character-set-server=utf8mb4
collation-server=utf8mb4_general_ci
"@
$configPath = Join-Path $run 'isolated.ini'
$config | Set-Content -LiteralPath $configPath -Encoding ASCII
if (@(Get-Process | Where-Object { $_.ProcessName -in @('mysqld','mariadbd') }).Count) { throw 'Database process appeared; refusing startup.' }
$process = Start-Process -FilePath 'C:\xampp\mysql\bin\mysqld.exe' -ArgumentList ('--defaults-file="' + $configPath + '"') -WorkingDirectory $run -WindowStyle Hidden -PassThru
$exited = $process.WaitForExit(8000)
$result = [pscustomobject]@{Label=$Label; WorkingDirectory=$run; ProcessId=$process.Id; Port=$port; Exited=$exited; ExitCode=if($exited){$process.ExitCode}else{$null}; RecoveryMode=$RecoveryLevel; CreatedUtc=[DateTime]::UtcNow.ToString('o')}
$result | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $run 'startup-result.json') -Encoding UTF8
$result | ConvertTo-Json
if (Test-Path -LiteralPath (Join-Path $run 'isolated-error.log')) { Get-Content -LiteralPath (Join-Path $run 'isolated-error.log') -Tail 24 }
