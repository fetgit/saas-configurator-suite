import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { TwoFactorService, TwoFactorConfig } from '@/services/twoFactorService';
import { Shield, Smartphone, Copy, CheckCircle, AlertCircle, Clock, Key } from 'lucide-react';

interface TwoFactorSetupProps {
  userEmail: string;
  userName: string;
  onSetupComplete: (config: TwoFactorConfig) => void;
  onCancel: () => void;
}

export const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({
  userEmail,
  userName,
  onSetupComplete,
  onCancel
}) => {
  const { toast } = useToast();
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');
  const [config, setConfig] = useState<TwoFactorConfig | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [backupCodesCopied, setBackupCodesCopied] = useState(false);

  // Générer la configuration 2FA au montage du composant
  useEffect(() => {
    const generateConfig = async () => {
      try {
        const twoFactorConfig = await TwoFactorService.generateTwoFactorConfig(userEmail, userName);
        setConfig(twoFactorConfig);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de générer la configuration 2FA",
          variant: "destructive"
        });
      }
    };

    generateConfig();
  }, [userEmail, userName, toast]);

  // Timer pour le code TOTP
  useEffect(() => {
    const updateTimer = () => {
      setTimeRemaining(TwoFactorService.getTimeRemaining());
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  // Vérifier le code TOTP
  const handleVerifyCode = async () => {
    if (!config || !verificationCode) return;

    setIsVerifying(true);
    try {
      const isValid = TwoFactorService.verifyTotpCode(config.secret, verificationCode);
      
      if (isValid) {
        setStep('backup');
        toast({
          title: "Code vérifié",
          description: "Votre code 2FA est valide !",
        });
      } else {
        toast({
          title: "Code invalide",
          description: "Le code saisi n'est pas correct. Veuillez réessayer.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la vérification du code",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Copier les codes de récupération
  const copyBackupCodes = async () => {
    if (!config) return;

    const codesText = TwoFactorService.formatBackupCodes(config.backupCodes).join('\n');
    try {
      await navigator.clipboard.writeText(codesText);
      setBackupCodesCopied(true);
      toast({
        title: "Codes copiés",
        description: "Les codes de récupération ont été copiés dans le presse-papiers",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier les codes",
        variant: "destructive"
      });
    }
  };

  // Finaliser la configuration
  const handleComplete = () => {
    if (config) {
      onSetupComplete(config);
    }
  };

  if (!config) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configuration 2FA
          </CardTitle>
          <CardDescription>
            Génération de votre configuration d'authentification à deux facteurs...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Configuration 2FA
        </CardTitle>
        <CardDescription>
          {step === 'setup' && "Étape 1: Scannez le QR code avec votre application d'authentification"}
          {step === 'verify' && "Étape 2: Vérifiez votre configuration avec un code"}
          {step === 'backup' && "Étape 3: Sauvegardez vos codes de récupération"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 'setup' && (
          <>
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertDescription>
                Téléchargez une application d'authentification comme Google Authenticator, Authy ou Microsoft Authenticator.
              </AlertDescription>
            </Alert>

            <div className="text-center">
              <div className="bg-white p-4 rounded-lg border inline-block">
                <img 
                  src={config.qrCodeUrl} 
                  alt="QR Code 2FA" 
                  className="w-48 h-48"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Code secret (si vous ne pouvez pas scanner le QR code)</Label>
              <div className="flex items-center gap-2">
                <Input 
                  value={config.secret} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(config.secret)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setStep('verify')} className="flex-1">
                Continuer
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Annuler
              </Button>
            </div>
          </>
        )}

        {step === 'verify' && (
          <>
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                Entrez le code à 6 chiffres affiché dans votre application d'authentification.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm text-muted-foreground">
                    Temps restant: {timeRemaining}s
                  </span>
                </div>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {TwoFactorService.generateCurrentTotp(config.secret)}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verification-code">Code de vérification</Label>
                <Input
                  id="verification-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleVerifyCode} 
                  disabled={verificationCode.length !== 6 || isVerifying}
                  className="flex-1"
                >
                  {isVerifying ? "Vérification..." : "Vérifier"}
                </Button>
                <Button variant="outline" onClick={() => setStep('setup')}>
                  Retour
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'backup' && (
          <>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important :</strong> Sauvegardez ces codes de récupération dans un endroit sûr. 
                Ils vous permettront d'accéder à votre compte si vous perdez votre appareil.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Codes de récupération</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyBackupCodes}
                  >
                    {backupCodesCopied ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-1 text-sm font-mono">
                  {TwoFactorService.formatBackupCodes(config.backupCodes).map((code, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{code}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button onClick={handleComplete} className="flex-1">
                  Terminer la configuration
                </Button>
                <Button variant="outline" onClick={() => setStep('verify')}>
                  Retour
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
