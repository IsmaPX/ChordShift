# Code Signing — Worship Piano Desktop

## Por qué firmar

- Windows SmartScreen bloquea instaladores sin firma
- macOS Gatekeeper rechaza apps sin firma (notarization required)
- Usuarios ven advertencias de "origen no verificado"

## Windows

### Requisitos
- Certificado de firma de código: EV (Extended Validation) recomendado (~$300/año)
  - Proveedores: DigiCert, Sectigo, Certum
  - EV permite firma inmediata (sin reputación de SmartScreen)
  - Estándar (OV): requiere acumular reputación con el tiempo

### Configuración
```yaml
# electron-builder.yml
win:
  sign: true
  certificateFile: cert.pfx
  certificatePassword: ${CERT_PASSWORD}
  certificateSubjectName: "Your Company Name"
```

### Alternativa gratuita (self-signed)
```powershell
# Generar certificado (solo para pruebas)
New-SelfSignedCertificate -Type Custom -Subject "CN=Worship Piano" -KeyUsage DigitalSignature -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.3") -CertStoreLocation "Cert:\CurrentUser\My"
# Exportar a PFX (proteger con contraseña)
$pwd = ConvertTo-SecureString -String "password" -Force -AsPlainText
Export-PfxCertificate -Cert "Cert:\CurrentUser\My\THUMBPRINT" -FilePath cert.pfx -Password $pwd
```

## macOS

### Requisitos
- Apple Developer Account ($99/año)
- Certificado "Developer ID Application" en Apple Developer Portal
- Notarization: enviar build a Apple para escaneo

### Configuración
```yaml
# electron-builder.yml
mac:
  identity: "Developer ID Application: Your Name (TEAMID)"
  hardenedRuntime: true
  gatekeeperAssess: false
  notarize:
    teamId: TEAMID
```

## CI (GitHub Actions)

### Almacenar certificados como secretos
```bash
# Convertir PFX a base64 para GitHub Secrets
certutil -encode cert.pfx cert-base64.txt
# Pegar contenido en: Settings → Secrets → CERT_BASE64
```

### Workflow step
```yaml
- name: Decode certificate
  run: echo "${{ secrets.CERT_BASE64 }}" | certutil -decode - cert.pfx

- name: Build signed
  run: npm run dist:win
  env:
    CERT_PASSWORD: ${{ secrets.CERT_PASSWORD }}
```

## Estado actual
- `sign: false` en electron-builder.yml (sin certificado)
- `perMachine: false` para evitar bloqueos de SmartScreen
- Instalador en `%LOCALAPPDATA%\Programs\Worship Piano` sin requerir admin

## Referencias
- [electron-builder — Code Signing](https://www.electron.build/code-signing)
- [Windows Hardware Dev Center](https://partner.microsoft.com/dashboard)
- [Apple Developer — Notarization](https://developer.apple.com/documentation/xcode/notarizing-macos-software-before-distribution)
