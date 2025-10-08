!macro customInit
  ; Close the application if it's running
  DetailPrint "Checking for running instances of Secure Kiosk..."
  
  ; Try graceful close first
  nsExec::Exec 'taskkill /IM "Secure Kiosk.exe" /T'
  Sleep 2000
  
  ; Force close if still running
  nsExec::Exec 'taskkill /F /IM "Secure Kiosk.exe" /T'
  Sleep 2000
  
  ; Kill any orphaned processes
  nsExec::Exec 'taskkill /F /IM "Secure Kiosk.exe" /T'
  Sleep 1000
  
  DetailPrint "Processes closed. Ready to install..."
!macroend

!macro customInstall
  ; Additional custom install steps can go here
!macroend

!macro customUnInit
  ; Close the application before uninstall
  DetailPrint "Closing Secure Kiosk before uninstall..."
  
  ; Force close the application
  nsExec::Exec 'taskkill /F /IM "Secure Kiosk.exe" /T'
  Sleep 1000
  
  DetailPrint "Ready to uninstall..."
!macroend
