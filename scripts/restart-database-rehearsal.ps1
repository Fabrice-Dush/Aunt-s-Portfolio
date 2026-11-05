param([ValidateSet('01','02')][string]$Attempt,[ValidatePattern('^[a-z0-9-]+$')][string]$Label)
$ErrorActionPreference='Stop'
if(!$Attempt -or !$Label){throw 'Explicit attempt and checkpoint label required'}
$run='C:\Users\HP\Documents\Seraphine-Database-Recovery\2026-11-05-rehearsal-'+$Attempt
$port=if($Attempt -eq '01'){13310}else{13312}
if(@(Get-Process | Where-Object {$_.ProcessName -in @('mysqld','mariadbd')}).Count){throw 'Database process still running; do not force termination'}
if(@([Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners() | Where-Object {$_.Port -eq $port}).Count){throw 'Port occupied'}
$config=Join-Path $run 'rehearsal.ini'
$lines=Get-Content -LiteralPath $config
if($lines -notcontains ('datadir='+$run.Replace('\','/')+'/data') -or $lines -notcontains 'innodb_force_recovery=0' -or $lines -notcontains ('port='+$port)){throw 'Unexpected config'}
$out=Join-Path $run ($Label+'.stdout.log');$err=Join-Path $run ($Label+'.stderr.log');$record=Join-Path $run ($Label+'.startup.json')
foreach($file in @($out,$err,$record)){if(Test-Path -LiteralPath $file){throw 'Refuse existing diagnostic output'}}
$p=Start-Process 'C:\xampp\mysql\bin\mysqld.exe' -ArgumentList ('--defaults-file="'+$config+'" --console') -WorkingDirectory $run -WindowStyle Hidden -RedirectStandardOutput $out -RedirectStandardError $err -PassThru
$exited=$p.WaitForExit(5000)
[pscustomobject]@{ProcessId=$p.Id;Exited=$exited;Port=$port;RecoveryMode=0;CreatedUtc=[DateTime]::UtcNow.ToString('o')} | ConvertTo-Json | Set-Content -LiteralPath $record -Encoding UTF8
if($exited){throw 'Restart failed; retain evidence and inspect private console log'}
"Rehearsal $Attempt restarted on port $port; SQL identity must still be verified."
