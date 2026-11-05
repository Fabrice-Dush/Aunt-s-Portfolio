<# Authorized 2026-11-05: initialize a NEW private normal-mode instance; no service installation. #>
param([ValidateSet('01','02')][string]$Attempt='01')
$ErrorActionPreference='Stop'
$port=if($Attempt -eq '01'){13310}else{13312}
$run='C:\Users\HP\Documents\Seraphine-Database-Recovery\2026-11-05-rehearsal-'+$Attempt
if(@(Get-Process | Where-Object {$_.ProcessName -in @('mysqld','mariadbd')}).Count){throw 'Database process running; inspect before rehearsal'}
if(Test-Path -LiteralPath $run){throw 'Refusing existing rehearsal directory'}
if(@([Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners() | Where-Object {$_.Port -eq $port}).Count){throw 'Rehearsal port occupied'}
$ancestor=[IO.DirectoryInfo]::new($run).Parent
while($null -ne $ancestor){if($ancestor.Exists -and ($ancestor.Attributes -band [IO.FileAttributes]::ReparsePoint)){throw 'Reparse point in destination'};$ancestor=$ancestor.Parent}
New-Item -ItemType Directory -Path $run | Out-Null
$data=Join-Path $run 'data'
# This version's initializer bootstraps with --no-defaults inside the supplied new datadir.
# No --service, --default-user, remote-root or password command-line options.
& 'C:\xampp\mysql\bin\mysql_install_db.exe' ('--datadir='+$data) ('--port='+$port)
if($LASTEXITCODE -ne 0){throw 'Fresh initialization failed; retain directory for inspection'}
New-Item -ItemType Directory -Path (Join-Path $run 'tmp') | Out-Null
$u=$run.Replace('\','/')
@"
[mysqld]
basedir=C:/xampp/mysql
plugin_dir=C:/xampp/mysql/lib/plugin
datadir=$u/data
tmpdir=$u/tmp
pid_file=$u/rehearsal.pid
log_error=$u/rehearsal-error.log
aria_log_dir_path=$u/data
innodb_data_home_dir=$u/data
innodb_log_group_home_dir=$u/data
innodb_buffer_pool_filename=rehearsal-buffer-pool
innodb_buffer_pool_size=64M
innodb_force_recovery=0
innodb_flush_log_at_trx_commit=1
innodb_fast_shutdown=0
bind_address=127.0.0.1
port=$port
event_scheduler=OFF
skip_slave_start
skip_log_bin
general_log=OFF
slow_query_log=OFF
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci
"@ | Set-Content -LiteralPath (Join-Path $run 'rehearsal.ini') -Encoding ASCII
$process=Start-Process -FilePath 'C:\xampp\mysql\bin\mysqld.exe' -ArgumentList ('--defaults-file="'+(Join-Path $run 'rehearsal.ini')+'" --console') -RedirectStandardOutput (Join-Path $run 'initial.stdout.log') -RedirectStandardError (Join-Path $run 'initial.stderr.log') -WorkingDirectory $run -WindowStyle Hidden -PassThru
$exited=$process.WaitForExit(8000)
[pscustomobject]@{ProcessId=$process.Id;Run=$run;Port=$port;RecoveryMode=0;Exited=$exited;CreatedUtc=[DateTime]::UtcNow.ToString('o')} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $run 'startup.json') -Encoding UTF8
if($exited){throw 'Rehearsal server exited; inspect its private log'}
"Fresh normal-mode instance started on loopback port $port; verify SQL identity before any writes."
